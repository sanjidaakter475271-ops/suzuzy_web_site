
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { startOfDay, addDays } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || !user.dealerId) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const dealerId = user.dealerId;

        // Fetch Stock Variants
        // We fetch variants that belong to products of this dealer
        const stockData = await prisma.product_variants.findMany({
            where: {
                products: {
                    dealer_id: dealerId
                }
            },
            select: {
                id: true,
                product_id: true,
                sku: true,
                stock_quantity: true,
                low_stock_threshold: true,
                price: true,
                products: {
                    select: {
                        name: true,
                        product_images: {
                            select: { image_url: true },
                            take: 1
                        },
                        categories_products_category_idTocategories: {
                            select: { name: true }
                        },
                        categories_products_sub_category_idTocategories: {
                            select: { name: true }
                        },
                        brands: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        // Fetch Expiring Batches
        const today = new Date();
        const thirtyDaysFromNow = addDays(today, 30);

        const expiringBatches = await prisma.inventory_batches.findMany({
            where: {
                dealer_id: dealerId,
                current_quantity: { gt: 0 },
                expiry_date: {
                    lte: thirtyDaysFromNow
                }
            },
            orderBy: {
                expiry_date: 'asc'
            },
            take: 5,
            select: {
                id: true,
                batch_number: true,
                expiry_date: true,
                current_quantity: true,
                variant_id: true,
                product_variants: {
                    select: {
                        sku: true,
                        products: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        // Transform data to match frontend expectations
        const formattedStock = stockData.map(item => ({
            id: item.id,
            product_id: item.product_id,
            sku: item.sku,
            stock_quantity: item.stock_quantity,
            low_stock_threshold: item.low_stock_threshold,
            price: Number(item.price), // Ensure number
            products: {
                name: item.products?.name || "Unknown Product",
                product_images: item.products?.product_images || [],
                categories: item.products?.categories_products_category_idTocategories || { name: 'Uncategorized' },
                sub_categories: item.products?.categories_products_sub_category_idTocategories || { name: '' },
                brands: item.products?.brands || { name: 'Generic' }
            }
        }));

        return NextResponse.json({
            success: true,
            data: {
                stock: formattedStock,
                expiringBatches: expiringBatches
            }
        });

    } catch (error: any) {
        console.error("Error fetching stock data:", error);
        return NextResponse.json({
            error: "Failed to fetch stock data",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
