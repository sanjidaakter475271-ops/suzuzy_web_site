"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { headers } from "next/headers";

interface SessionUser {
    id: string;
    role: string;
    dealerId?: string;
    email?: string;
    name?: string;
}

/**
 * getDealerProducts: Fetches products for the current dealer, applying ownership scope
 */
export async function getDealerProducts() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const user = session.user as unknown as SessionUser;

    // Model-specific filter for products
    let filter: any = {};
    if (user.role === 'super_admin' || user.role === 'showroom_admin') {
        filter = {};
    } else if (user.dealerId) {
        filter = { dealer_id: user.dealerId };
    } else {
        filter = { dealer_id: 'none' }; // Block for non-dealer/non-admin
    }

    try {
        const products = await prisma.products.findMany({
            where: filter,
            include: {
                categories_products_category_idTocategories: {
                    select: { name: true }
                },
                product_images: {
                    select: { image_url: true },
                    take: 1
                },
                product_variants: {
                    select: {
                        id: true,
                        sku: true,
                        has_duplicate_barcode: true,
                        stock_quantity: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Map back to expected interface names if necessary
        const mappedProducts = products.map(p => ({
            ...p,
            categories: p.categories_products_category_idTocategories
        }));

        return { success: true, data: mappedProducts };
    } catch (error: unknown) {
        console.error("Error fetching products:", error);
        return { success: false, error: "Failed to fetch inventory data" };
    }
}

/**
 * getCategories: Utility to fetch active categories
 */
export async function getCategories() {
    try {
        const categories = await prisma.categories.findMany({
            where: { is_active: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: categories };
    } catch {
        return { success: false, error: "Failed to fetch categories" };
    }
}

/**
 * updateProductStatusAction: Toggles or sets product status
 */
export async function updateProductStatusAction(productId: string, newStatus: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error("Unauthorized");
    const user = session.user as unknown as SessionUser;

    if (user.role !== 'super_admin' && user.role !== 'showroom_admin') {
        const product = await prisma.products.findFirst({
            where: { id: productId, dealer_id: user.dealerId }
        });
        if (!product) return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.products.update({
            where: { id: productId },
            data: { status: newStatus }
        });
        return { success: true };
    } catch {
        return { success: false, error: "Status update failed" };
    }
}

/**
 * bulkUpdateProductStatusAction: Batch updates status for multiple products
 */
export async function bulkUpdateProductStatusAction(productIds: string[], newStatus: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error("Unauthorized");
    const user = session.user as unknown as SessionUser;

    try {
        await prisma.products.updateMany({
            where: {
                id: { in: productIds },
                ...(user.role !== 'super_admin' && user.role !== 'showroom_admin' ? { dealer_id: user.dealerId } : {})
            },
            data: { status: newStatus }
        });
        return { success: true };
    } catch {
        return { success: false, error: "Batch update failed" };
    }
}

/**
 * bulkDeleteProductsAction: Batch deletes multiple products
 */
export async function bulkDeleteProductsAction(productIds: string[]) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error("Unauthorized");
    const user = session.user as unknown as SessionUser;

    try {
        await prisma.products.deleteMany({
            where: {
                id: { in: productIds },
                ...(user.role !== 'super_admin' && user.role !== 'showroom_admin' ? { dealer_id: user.dealerId } : {})
            }
        });
        return { success: true };
    } catch {
        return { success: false, error: "Batch purge failed" };
    }
}

/**
 * deleteProduct: Deletes (archives) a product if owned by the user
 */
export async function deleteProductAction(productId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");

    const user = session.user as unknown as SessionUser;

    // Ownership check (middleware logic applied manually here)
    if (user.role !== 'super_admin' && user.role !== 'showroom_admin') {
        const product = await prisma.products.findFirst({
            where: {
                id: productId,
                dealer_id: user.dealerId
            }
        });
        if (!product) return { success: false, error: "Asset not found or unauthorized" };
    }

    try {
        await prisma.products.delete({
            where: { id: productId }
        });
        return { success: true };
    } catch {
        return { success: false, error: "Failed to archive asset" };
    }
}



/**
 * importProductsAction: Core logic for batch importing products from structured data.
 */
export async function importProductsAction(data: {
    dealerId: string;
    rows: Record<string, string | number>[];
    defaultCategoryId: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error("Unauthorized");
    const user = session.user as unknown as SessionUser;

    if (user.role !== 'super_admin' && user.dealerId !== data.dealerId) {
        throw new Error("Unauthorized dealer scope");
    }

    let successful = 0;
    let failed = 0;
    const errors: { row: number; error: string }[] = [];

    // Fetch categories for mapping
    const categories = await prisma.categories.findMany({ select: { id: true, name: true } });

    for (const [index, row] of data.rows.entries()) {
        try {
            const itemName = String(row['Item Name'] || row['ItemName'] || row['Name'] || '');
            const barcode = String(row['Barcode'] || row['SKU'] || '').trim();
            const purchasePrice = Number(row['Purchase Price'] || row['Cost'] || 0);
            const retailPrice = Number(row['Retail Price'] || row['Price'] || 0);
            const quantity = Number(row['Quantity'] || row['Qty'] || 0);
            const bin = String(row['Bin'] || '');
            const partNo = String(row['Part No'] || row['PartNumber'] || '').trim();

            if (!itemName) throw new Error("Missing Item Name");

            // Slug Generation
            const slug = `${itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

            // Dynamic Category Mapping
            let categoryId = data.defaultCategoryId;
            const itemLower = itemName.toLowerCase();

            // Match item name against all available categories from DB
            const matchedCategory = categories.find(cat =>
                itemLower.includes(cat.name.toLowerCase()) ||
                cat.name.toLowerCase().includes(itemLower)
            );

            if (matchedCategory) {
                categoryId = matchedCategory.id;
            }

            const productSku = barcode || `sku-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            await prisma.$transaction(async (tx) => {
                const product = await tx.products.create({
                    data: {
                        dealer_id: data.dealerId,
                        name: itemName,
                        slug: slug,
                        description: `Imported Part: ${partNo}`,
                        category_id: categoryId,
                        base_price: retailPrice,
                        cost_price: purchasePrice,
                        sku: productSku,
                        barcode: barcode || null,
                        part_number: partNo || null,
                        status: 'active',
                    }
                });

                await tx.product_variants.create({
                    data: {
                        product_id: product.id,
                        sku: productSku,
                        price: retailPrice,
                        stock_quantity: quantity,
                        bin: bin,
                    }
                });
            });

            successful++;
        } catch (err: unknown) {
            failed++;
            const errorMessage = err instanceof Error ? err.message : "Undefined storage conflict";
            errors.push({ row: index + 1, error: errorMessage });
        }
    }

    return { success: true, successful, failed, errors };
}

