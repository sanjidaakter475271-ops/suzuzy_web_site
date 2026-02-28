import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { z } from "zod";

const issueSchema = z.object({
    job_card_id: z.string().uuid(),
    variant_id: z.string().uuid(),
    quantity: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const body = await req.json();
        const parsed = issueSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ success: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        const { job_card_id, variant_id, quantity } = parsed.data;

        // 1. Verify Job Card ownership
        const jobCard = await prisma.job_cards.findFirst({
            where: { id: job_card_id, dealer_id: dealerId }
        });
        if (!jobCard) return NextResponse.json({ success: false, error: "Job card not found or access denied" }, { status: 404 });

        // 2. Verify Part Variant & Stock (using part_variants model)
        const variant = await prisma.part_variants.findUnique({
            where: { id: variant_id },
            include: { parts: true }
        });
        if (!variant) return NextResponse.json({ success: false, error: "Part variant not found" }, { status: 404 });

        if ((variant.stock_quantity || 0) < quantity) {
            return NextResponse.json({ success: false, error: "Insufficient stock" }, { status: 400 });
        }

        // 3. Execute Transaction
        const result = await prisma.$transaction(async (tx) => {
            // A. Update variant stock
            await tx.part_variants.update({
                where: { id: variant_id },
                data: { stock_quantity: { decrement: quantity } }
            });

            // B. Create parts_usage record
            const usage = await tx.parts_usage.create({
                data: {
                    job_card_id,
                    variant_id,
                    quantity,
                    unit_price: variant.price || 0,
                    total_price: (Number(variant.price) || 0) * quantity
                }
            });

            return usage;
        });

        // Convert Decimal to Number for response
        const serialized = {
            ...result,
            unit_price: Number(result.unit_price),
            total_price: Number(result.total_price)
        };

        return NextResponse.json({ success: true, data: serialized });

    } catch (error: any) {
        console.error("[INVENTORY_ISSUE_TO_JOB] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
