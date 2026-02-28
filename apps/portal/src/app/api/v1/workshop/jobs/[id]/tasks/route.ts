import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { z } from "zod";

const taskSchema = z.object({
    item_name: z.string().min(1, "Name is required"),
    cost: z.number().min(0, "Cost must be a positive number"),
    is_checked: z.boolean().optional().default(false)
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        const parsed = taskSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { item_name, cost, is_checked } = parsed.data;

        // Verify job card belongs to the dealer
        const jobCard = await prisma.job_cards.findFirst({
            where: {
                id,
                dealer_id: user.dealerId
            }
        });

        if (!jobCard) {
            return NextResponse.json({ error: "Job card not found or unauthorized" }, { status: 404 });
        }

        const task = await prisma.service_tasks.create({
            data: {
                job_card_id: id,
                name: item_name,
                description: `Cost: ${cost}`,
                status: 'pending'
            }
        });

        return NextResponse.json({ success: true, data: { ...task, cost } });
    } catch (error: any) {
        console.error("[ADD_TASK_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
