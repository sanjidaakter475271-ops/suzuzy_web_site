import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcast } from "@/lib/socket-server";

/**
 * GET: Fetch workshop products for inventory management and requisition search
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const includeMovements = searchParams.get('movements') === 'true';

        if (includeMovements) {
            const movements = await prisma.inventory_movements.findMany({
                where: {
                    dealer_id: user.dealerId || ""
                },
                include: {
                    products: { select: { name: true } },
                    profiles: { select: { full_name: true } }
                },
                orderBy: { created_at: 'desc' },
                take: 50
            });
            return NextResponse.json({ success: true, data: movements });
        }

        const products = await prisma.products.findMany({
            where: {
                dealer_id: user.dealerId || "",
                status: 'approved',
            },
            include: {
                brands: true,
                categories_products_category_idTocategories: true,
                product_variants: true,
                product_images: {
                    where: { is_primary: true },
                    take: 1
                }
            },
            orderBy: { name: 'asc' }
        });

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
                variants: p.product_variants.map(v => ({
                    id: v.id,
                    sku: v.sku,
                    price: Number(v.price || p.base_price),
                    stock: v.stock_quantity,
                    attributes: v.attributes
                }))
            };
        });

        return NextResponse.json({ success: true, data: formattedProducts });

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

        const body = await req.json();

        // If productId is present, it's an adjustment
        if (body.productId) {
            const { productId, quantity, type, reason } = body;

            // Get current product
            const product = await prisma.products.findUnique({
                where: { id: productId }
            });

            if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

            const quantity_before = product.stock_quantity || 0;
            const quantity_change = type === 'in' ? Math.abs(quantity) : -Math.abs(quantity);
            const quantity_after = quantity_before + quantity_change;

            // Transaction for atomicity
            const result = await prisma.$transaction(async (tx) => {
                // 1. Update product stock
                const updatedProduct = await tx.products.update({
                    where: { id: productId },
                    data: { stock_quantity: quantity_after }
                });

                // 2. Create movement record
                await tx.inventory_movements.create({
                    data: {
                        dealer_id: product.dealer_id || user.dealerId || "",
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

            // Broadcast real-time update
            const broadcastData = {
                productId,
                type,
                triggeredBy: user.userId,
                dealerId: user.dealerId
            };
            await broadcast('inventory:changed', broadcastData);
            await broadcast('inventory:adjusted', broadcastData);

            return NextResponse.json({ success: true, data: result });
        }

        // Otherwise, create new product
        const product = await prisma.products.create({
            data: {
                dealer_id: user.dealerId || "",
                name: body.name,
                sku: body.sku,
                brand: body.brand,
                base_price: body.price || 0,
                stock_quantity: body.stock || 0,
                status: 'approved',
                slug: (body.name || 'product').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
            }
        });
        return NextResponse.json({ success: true, data: product });
    } catch (error: any) {
        console.error("Inventory error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...data } = body;
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
        return NextResponse.json({ success: true, data: product });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
