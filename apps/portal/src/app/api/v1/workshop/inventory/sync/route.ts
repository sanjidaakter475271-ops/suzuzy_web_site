import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

const generateUniqueSlug = (text: string, index: number) => {
    const base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40);
    return `${base}-${Date.now().toString(36)}-${index}`;
};

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const { rows, options } = await req.json();
        if (!rows || !Array.isArray(rows)) {
            return NextResponse.json({ error: "Invalid rows data" }, { status: 400 });
        }

        const { update_stock = true, update_prices = false, create_bike_model_links = true } = options || {};

        // Pre-fetch global data to save DB queries
        const [allCategories, allBikeModels] = await Promise.all([
            prisma.categories.findMany(),
            prisma.bike_models.findMany()
        ]);

        const categoryMap = new Map(allCategories.map(c => [c.name.toLowerCase(), c]));
        const bikeModelMap = new Map(allBikeModels.map(b => [b.name.toLowerCase(), b]));

        // Pre-fetch existing products for this dealer
        const partNumbers = rows.map(r => (r.part_number || r["Part Number"] || "").trim()).filter(p => p);
        const existingProductsRaw = await prisma.products.findMany({
            where: { part_number: { in: partNumbers }, dealer_id: dealerId },
            select: { id: true, part_number: true, specifications: true, base_price: true }
        });
        const existingProductMap = new Map(existingProductsRaw.map(p => [p.part_number!, p]));

        const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };
        const locationPattern = /^[A-Z]-\d+-\d+$/i;

        // SEQUENTIAL PROCESSING (Prevents Database Connection Pool Exhaustion & Hanging)
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                const partNo = (row.part_number || row["Part Number"] || "").trim();
                const description = (row.description || row["Description"] || "").trim();
                const categoryName = (row.category || row["Category"] || "").trim();
                const subCategoryName = (row.sub_category || row["Sub-Category"] || "").trim();
                const bikeModelName = (row.bike_model || row["Bike Model"] || "").trim();
                const priceStr = (row.price || row["Price"] || "").trim();
                const stockQty = parseInt(row.stock || row["Stock"] || "0") || 0;

                if (!partNo && !description) {
                    results.skipped++;
                    continue;
                }

                // Resolving IDs from memory maps (0 database queries here)
                let categoryId = categoryMap.get(categoryName.toLowerCase())?.id || null;
                let subCategoryId = null;
                if (categoryId && subCategoryName) {
                    subCategoryId = allCategories.find(c => c.name.toLowerCase() === subCategoryName.toLowerCase() && c.parent_id === categoryId)?.id || null;
                }

                let currentBikeModelId = bikeModelMap.get(bikeModelName.toLowerCase())?.id || null;
                if (!currentBikeModelId && bikeModelName && bikeModelName.toUpperCase() === "UNIVERSAL") {
                    currentBikeModelId = allCategories.find(c => c.name.toLowerCase() === "universal")?.id || null;
                }

                const isLocationCode = locationPattern.test(priceStr);
                const priceValue = isLocationCode ? 0 : parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

                const existing = partNo ? existingProductMap.get(partNo) : null;

                if (existing) {
                    const updateData: any = {};
                    if (update_stock) updateData.stock_quantity = stockQty;
                    if (update_prices && !isLocationCode && priceValue > 0) updateData.base_price = priceValue;
                    if (categoryId) updateData.category_id = categoryId;
                    if (subCategoryId) updateData.sub_category_id = subCategoryId;
                    if (isLocationCode) {
                        const specs = (existing.specifications as any) || {};
                        specs.warehouse_bin = priceStr;
                        updateData.specifications = specs;
                    }

                    const updated = await prisma.products.update({
                        where: { id: existing.id },
                        data: updateData
                    });
                    results.updated++;

                    if (create_bike_model_links && currentBikeModelId) {
                        await prisma.product_bike_models.upsert({
                            where: { product_id_bike_model_id: { product_id: updated.id, bike_model_id: currentBikeModelId } },
                            update: {},
                            create: { product_id: updated.id, bike_model_id: currentBikeModelId }
                        });
                    }
                } else {
                    const finalSku = partNo || `SKU-${Date.now().toString(36)}-${i}`;
                    const created = await prisma.products.create({
                        data: {
                            dealer_id: dealerId,
                            name: description,
                            part_number: partNo || null,
                            sku: finalSku,
                            slug: generateUniqueSlug(description, i),
                            base_price: priceValue,
                            stock_quantity: stockQty,
                            category_id: categoryId,
                            sub_category_id: subCategoryId,
                            is_genuine: !!(partNo && partNo.length > 5),
                            brand: "Suzuki",
                            status: "approved",
                            specifications: isLocationCode ? { warehouse_bin: priceStr } : {},
                            product_bike_models: (create_bike_model_links && currentBikeModelId) ? {
                                create: { bike_model_id: currentBikeModelId }
                            } : undefined
                        }
                    });
                    results.created++;
                }
            } catch (e: any) {
                console.error(`Row ${i} failed:`, e.message);
                results.errors.push(`Row ${i + 1}: ${e.message}`);
            }
        }

        return NextResponse.json({ success: true, data: results });

    } catch (error: any) {
        console.error("[CRITICAL_SYNC_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
