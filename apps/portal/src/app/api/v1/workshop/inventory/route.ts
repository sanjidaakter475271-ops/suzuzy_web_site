import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcastEvent } from "@/lib/socket-server";

// Helper to convert Prisma Decimals to Numbers
const serialize = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(serialize);
    if (typeof obj === 'object') {
        if (obj.constructor && obj.constructor.name === 'Decimal') {
            return Number(obj);
        }
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = serialize(obj[key]);
        }
        return newObj;
    }
    return obj;
};

/**
 * GET: Fetch workshop products for inventory management and requisition search
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const searchParams = new URL(req.url).searchParams;
        const includeMovements = searchParams.get('movements') === 'true';
        const search = searchParams.get('search');
        const categoryId = searchParams.get('categoryId');
        const bikeModelId = searchParams.get('bikeModelId');

        // Pagination params
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const skip = (page - 1) * limit;

        if (includeMovements) {
            const movements = await prisma.inventory_movements.findMany({
                where: {
                    dealer_id: dealerId
                },
                include: {
                    products: { select: { name: true } },
                    profiles: { select: { full_name: true } }
                },
                orderBy: { created_at: 'desc' },
                take: 50
            });
            return NextResponse.json({ success: true, data: serialize(movements) });
        }

        // Build filtering where clause
        const where: any = {
            dealer_id: dealerId,
            status: 'approved',
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { part_number: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (categoryId) {
            where.OR = [
                { category_id: categoryId },
                { sub_category_id: categoryId }
            ];
        }

        if (bikeModelId) {
            where.product_bike_models = {
                some: {
                    bike_model_id: bikeModelId
                }
            };
        }

        // Parallel query for paginated results and total count
        const [products, totalItems, allStatsRaw] = await Promise.all([
            prisma.products.findMany({
                where,
                skip,
                take: limit,
                include: {
                    brands: true,
                    categories_products_category_idTocategories: true,
                    // REMOVED: product_variants to drastically reduce payload size
                    product_images: {
                        where: { is_primary: true },
                        take: 1
                    }
                },
                orderBy: { name: 'asc' }
            }),
            prisma.products.count({ where }),
            // Fetch minimal data for all filtered items to calculate global stats accurately
            prisma.products.findMany({
                where,
                select: {
                    stock_quantity: true,
                    base_price: true,
                    low_stock_threshold: true
                }
            })
        ]);

        // Calculate summary stats
        let totalValue = 0;
        let lowStockCount = 0;
        for (const item of allStatsRaw) {
            const stock = item.stock_quantity || 0;
            totalValue += stock * Number(item.base_price || 0);
            if (stock <= (item.low_stock_threshold || 5) && stock > 0) {
                lowStockCount++;
            }
        }

        // Add price mapping for consistency if needed by frontend
        const formattedProducts = products.map(p => {
            const stock = p.stock_quantity || 0;
            const threshold = p.low_stock_threshold || 5;

            let status: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
            if (stock <= 0) status = 'out-of-stock';
            else if (stock <= threshold) status = 'low-stock';

            return {
                id: p.id,
                sku: p.sku || '',
                name: p.name,
                category: p.categories_products_category_idTocategories?.name || 'Uncategorized',
                brand: p.brands?.name || p.brand || 'Suzuki',
                price: Number(p.base_price),
                costPrice: Number(p.cost_price || 0),
                stock: stock,
                minStock: threshold,
                image: p.product_images?.[0]?.image_url,
                status: status,
                variants: [] // Omitted for performance
            };
        });

        return NextResponse.json({
            success: true,
            data: formattedProducts,
            pagination: {
                total: totalItems,
                page,
                limit,
                totalPages: Math.ceil(totalItems / limit)
            },
            summary: {
                totalValue,
                lowStockCount,
                totalItems
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST: Create product OR Create stock adjustment
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const body = await req.json();

        // If productId is present, it's an adjustment
        if (body.productId) {
            const { productId, quantity, type, reason } = body;

            // Scoped by dealerId
            const product = await prisma.products.findFirst({
                where: {
                    id: productId,
                    dealer_id: dealerId
                }
            });

            if (!product) return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 });

            const quantity_before = product.stock_quantity || 0;
            const quantity_change = type === 'in' ? Math.abs(quantity) : -Math.abs(quantity);
            const quantity_after = quantity_before + quantity_change;

            const result = await prisma.$transaction(async (tx) => {
                const updatedProduct = await tx.products.update({
                    where: { id: productId },
                    data: { stock_quantity: quantity_after }
                });

                await tx.inventory_movements.create({
                    data: {
                        dealer_id: dealerId,
                        product_id: productId,
                        movement_type: type === 'in' ? 'stock_in' : 'stock_out',
                        quantity_before,
                        quantity_change,
                        quantity_after,
                        reason: reason || 'Manual Adjustment',
                        performed_by: user.userId
                    }
                });

                return updatedProduct;
            });

            await broadcastEvent('inventory:adjusted', {
                productId,
                type,
                dealerId
            });

            return NextResponse.json({ success: true, data: serialize(result) });
        }

        // Create new product
        const product = await prisma.products.create({
            data: {
                dealer_id: dealerId,
                name: body.name,
                sku: body.sku,
                brand: body.brand,
                base_price: body.price || 0,
                stock_quantity: body.stock || 0,
                status: 'approved',
                slug: (body.name || 'product').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
            }
        });
        return NextResponse.json({ success: true, data: serialize(product) });
    } catch (error: any) {
        console.error("Inventory error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const body = await req.json();
        const { id, ...data } = body;

        // Verify ownership
        const existing = await prisma.products.findFirst({
            where: { id, dealer_id: dealerId }
        });
        if (!existing) return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 });

        const product = await prisma.products.update({
            where: { id },
            data: {
                name: data.name,
                sku: data.sku,
                brand: data.brand,
                base_price: data.price,
                stock_quantity: data.stock
            }
        });
        return NextResponse.json({ success: true, data: serialize(product) });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
