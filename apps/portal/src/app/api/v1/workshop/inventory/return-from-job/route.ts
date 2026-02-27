import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { z } from "zod";

const returnSchema = z.object({
    parts_usage_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const body = await req.json();
        const parsed = returnSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ success: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        const { parts_usage_id, quantity, reason } = parsed.data;

        // 1. Fetch parts usage and verify ownership via job card
        const usage = await prisma.parts_usage.findUnique({
            where: { id: parts_usage_id },
            include: {
                job_cards: true,
                part_variants: true
            }
        });

        if (!usage || usage.job_cards?.dealer_id !== dealerId) {
            return NextResponse.json({ success: false, error: "Record not found or access denied" }, { status: 404 });
        }

        if (usage.quantity < quantity) {
            return NextResponse.json({ success: false, error: "Return quantity exceeds issued quantity" }, { status: 400 });
        }

        const variantId = usage.variant_id;
        if (!variantId) {
            return NextResponse.json({ success: false, error: "Inconsistent data: Part variant reference missing" }, { status: 500 });
        }

        // 2. Execute Transaction
        await prisma.$transaction(async (tx) => {
            // A. Increment variant stock (Master Catalog)
            await tx.part_variants.update({
                where: { id: variantId },
                data: { stock_quantity: { increment: quantity } }
            });

            // B. Update Usage record
            if (usage.quantity === quantity) {
                // Fully returned, delete usage or set to 0?
                // Usually we delete or keep with 0. Let's update quantity.
                await tx.parts_usage.delete({ where: { id: parts_usage_id } });
            } else {
                const newTotal = Number(usage.unit_price) * (usage.quantity - quantity);
                await tx.parts_usage.update({
                    where: { id: parts_usage_id },
                    data: {
                        quantity: { decrement: quantity },
                        total_price: newTotal
                    }
                });
            }

            // C. Log movement if there's a dealer-specific movement table?
            // inventory_movements uses product_id, but parts don't have product_id.
            // So we might need a separate log or just skip for parts if not available.
        });

        return NextResponse.json({ success: true, message: "Parts returned successfully" });

    } catch (error: any) {
        console.error("[INVENTORY_RETURN_FROM_JOB] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
