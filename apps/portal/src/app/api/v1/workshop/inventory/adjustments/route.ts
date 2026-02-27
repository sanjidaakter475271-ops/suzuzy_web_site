import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const adjustments = await prisma.stock_adjustments.findMany({
            where: { dealer_id: dealerId },
            include: {
                stock_adjustment_items: {
                    include: {
                        products: { select: { name: true, sku: true } },
                        inventory_batches: { select: { batch_number: true } }
                    }
                },
                profiles_stock_adjustments_performed_byToprofiles: { select: { full_name: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ success: true, data: adjustments });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const body = await req.json();
        const { reason, notes, items } = body; // items: Array<{productId, variantId, batchId, actualQuantity, reason}>

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Items are required" }, { status: 400 });
        }

        const adjustmentNumber = `ADJ-${Date.now()}`;

        const adjustment = await prisma.$transaction(async (tx) => {
            // 1. Create adjustment header
            const adj = await tx.stock_adjustments.create({
                data: {
                    dealer_id: dealerId,
                    adjustment_number: adjustmentNumber,
                    reason,
                    notes,
                    performed_by: user.userId,
                    status: 'pending', // Requires approval
                    total_items: items.length
                }
            });

            // 2. Create adjustment items
            for (const item of items) {
                // Fetch current stock info
                let systemQuantity = 0;
                if (item.batchId) {
                    const batch = await tx.inventory_batches.findUnique({
                        where: { id: item.batchId },
                        select: { current_quantity: true, unit_cost_price: true }
                    });
                    systemQuantity = batch?.current_quantity || 0;
                } else {
                    const product = await tx.products.findUnique({
                        where: { id: item.productId },
                        select: { stock_quantity: true }
                    });
                    systemQuantity = product?.stock_quantity || 0;
                }

                const difference = item.actualQuantity - systemQuantity;

                await tx.stock_adjustment_items.create({
                    data: {
                        adjustment_id: adj.id,
                        product_id: item.productId,
                        variant_id: item.variantId,
                        batch_id: item.batchId,
                        system_quantity: systemQuantity,
                        actual_quantity: item.actualQuantity,
                        difference: difference,
                        reason: item.reason || reason
                    }
                });
            }

            return adj;
        });

        return NextResponse.json({ success: true, data: adjustment });

    } catch (error: any) {
        console.error("Stock adjustment error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
