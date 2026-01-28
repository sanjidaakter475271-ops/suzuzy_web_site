"use server";

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { broadcast } from "@/lib/socket-server";

/**
 * getCatalogData: Fetches all necessary data for product creation forms
 */
export async function getCatalogData() {
    try {
        const [categories, brands, bikeModels] = await Promise.all([
            prisma.categories.findMany({
                where: { is_active: true },
                orderBy: { name: 'asc' },
                select: { id: true, name: true, parent_id: true }
            }),
            prisma.brands.findMany({
                orderBy: { name: 'asc' },
                select: { id: true, name: true }
            }),
            prisma.bike_models.findMany({
                orderBy: { name: 'asc' },
                select: { id: true, name: true }
            })
        ]);

        return {
            success: true,
            data: {
                categories,
                brands,
                bikeModels
            }
        };
    } catch (error) {
        console.error("Catalog fetch error:", error);
        return { success: false, error: "Failed to load catalog data" };
    }
}

/**
 * createBrand: Allows dealers to create new brands on the fly
 */
export async function createBrand(name: string, dealerId: string) {
    if (!name || !dealerId) return { success: false, error: "Invalid data" };

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
        const newBrand = await prisma.brands.create({
            data: {
                name,
                slug,
                dealer_id: dealerId // Ensure your schema supports this
            }
        });

        revalidatePath('/dealer/products/new');
        return { success: true, data: newBrand };
    } catch (error) {
        console.error("Brand creation error:", error);
        return { success: false, error: "Failed to create brand" };
    }
}

/**
 * createProduct: Server Action for secure product creation
 */
export async function createProduct(data: any, dealerId: string) {
    if (!dealerId) return { success: false, error: "Unauthorized" };

    try {
        // 1. Create Product
        const product = await prisma.products.create({
            data: {
                name: data.name,
                description: data.description,
                sku: data.sku,
                barcode: data.barcode,
                base_price: Number(data.base_price),
                // Ensure cost_price is in your schema if you use it, otherwise ignore
                stock_quantity: data.stock_quantity,
                category_id: data.category_id,
                brand_id: data.brand_id,
                brand: data.brand_name, // Legacy support
                dealer_id: dealerId,
                status: 'pending',
                slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
            }
        });

        // 2. Images
        if (data.images && data.images.length > 0) {
            await prisma.product_images.createMany({
                data: data.images.map((url: string, idx: number) => ({
                    product_id: product.id,
                    image_url: url,
                    is_primary: idx === 0
                }))
            });
        }

        // 3. Bike Models Mapping
        if (data.selectedModels && data.selectedModels.length > 0) {
            await prisma.product_bike_models.createMany({
                data: data.selectedModels.map((mid: string) => ({
                    product_id: product.id,
                    bike_model_id: mid
                }))
            });
        }

        // 4. Variants
        if (data.variants && data.variants.length > 0) {
            await prisma.product_variants.createMany({
                data: data.variants.map((v: any) => ({
                    product_id: product.id,
                    sku: v.sku,
                    price: Number(v.price),
                    stock_quantity: Number(v.stock),
                    attributes: { size: v.size },
                    dealer_id: dealerId,
                    // Map manual_barcode if exists in schema
                }))
            });
        }

        await broadcast('dashboard:refresh', { type: 'product_created' });

        revalidatePath('/dealer/products');
        return { success: true, productId: product.id };

    } catch (error: any) {
        console.error("Product creation error:", error);
        return { success: false, error: error.message };
    }
}
