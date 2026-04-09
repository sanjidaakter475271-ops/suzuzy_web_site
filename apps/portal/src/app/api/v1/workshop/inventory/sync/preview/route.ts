import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const { rows } = await req.json();
        if (!rows || !Array.isArray(rows)) {
            return NextResponse.json({ error: "Invalid rows data" }, { status: 400 });
        }

        // Fetch all current products for this dealer to match by part_number
        const existingProducts = await prisma.products.findMany({
            where: { dealer_id: dealerId },
            select: { id: true, part_number: true, sku: true, name: true, base_price: true }
        });

        // Fetch existing categories and bike models for summary
        const existingCategories = await prisma.categories.findMany({ select: { name: true } });
        const existingBikeModels = await prisma.bike_models.findMany({ select: { name: true } });

        const categorySet = new Set(existingCategories.map(c => c.name.toLowerCase()));
        const bikeModelSet = new Set(existingBikeModels.map(b => b.name.toLowerCase()));
        const productMap = new Map(existingProducts.filter(p => p.part_number).map(p => [p.part_number!.toLowerCase(), p]));

        const previewRows: any[] = [];
        const summary = {
            total: rows.length,
            new_products: 0,
            updates: 0,
            skipped: 0,
            new_categories: 0,
            new_bike_models: 0
        };

        const newCategories = new Set<string>();
        const newBikeModels = new Set<string>();

        const locationPattern = /^[A-Z]-\d+-\d+$/i;

        for (const row of rows) {
            const partNo = (row.part_number || row["Part Number"] || "").trim();
            const description = (row.description || row["Description"] || "").trim();
            const category = (row.category || row["Category"] || "").trim();
            const subCategory = (row.sub_category || row["Sub-Category"] || "").trim();
            const bikeModel = (row.bike_model || row["Bike Model"] || "").trim();
            const priceStr = (row.price || row["Price"] || "").trim();
            const stock = (row.stock || row["Stock"] || "0");

            if (!partNo && !description) continue;

            const isLocationCode = locationPattern.test(priceStr);
            const priceValue = isLocationCode ? 0 : parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

            let action: 'CREATE' | 'UPDATE' | 'SKIP' = 'CREATE';
            let changes: string[] = [];
            const existing = partNo ? productMap.get(partNo.toLowerCase()) : null;

            if (existing) {
                action = 'SKIP';
                if (existing.name !== description) {
                    action = 'UPDATE';
                    changes.push(`Name: ${existing.name} -> ${description}`);
                }

                const existingPrice = Number(existing.base_price);
                if (!isLocationCode && priceValue > 0 && Math.abs(existingPrice - priceValue) > 0.01) {
                    action = 'UPDATE';
                    changes.push(`Price: ${existingPrice} -> ${priceValue}`);
                }

                if (action === 'UPDATE') {
                    summary.updates++;
                } else {
                    summary.skipped++;
                }
            } else {
                action = 'CREATE';
                summary.new_products++;
            }

            if (category && !categorySet.has(category.toLowerCase())) {
                newCategories.add(category);
            }
            if (subCategory && !categorySet.has(subCategory.toLowerCase())) {
                newCategories.add(subCategory);
            }
            if (bikeModel && bikeModel.toUpperCase() !== "UNIVERSAL" && !bikeModelSet.has(bikeModel.toLowerCase())) {
                newBikeModels.add(bikeModel);
            } else if (bikeModel.toUpperCase() === "UNIVERSAL" && !bikeModelSet.has("universal")) {
                newBikeModels.add("Universal");
            }

            previewRows.push({
                bike_model: bikeModel,
                category: category,
                sub_category: subCategory,
                part_number: partNo,
                description: description,
                price: priceStr,
                stock: stock,
                action,
                existing_name: existing?.name,
                changes,
                is_location_code: isLocationCode,
                detected_location: isLocationCode ? priceStr : null
            });
        }

        summary.new_categories = newCategories.size;
        summary.new_bike_models = newBikeModels.size;

        return NextResponse.json({
            success: true,
            data: {
                summary,
                categories_to_create: Array.from(newCategories),
                bike_models_to_create: Array.from(newBikeModels),
                products: previewRows
            }
        });

    } catch (error: any) {
        console.error("[SYNC_PREVIEW_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
