import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { z } from "zod";

const feedbackSchema = z.object({
    ticket_id: z.string().uuid().optional(),
    user_id: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    staff_rating: z.number().min(1).max(5).optional(),
    timing_rating: z.number().min(1).max(5).optional(),
});

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const feedbacks = await prisma.service_feedback.findMany({
            where: {
                service_tickets: {
                    profiles: {
                        dealer_id: dealerId
                    }
                }
            },
            include: {
                profiles: { select: { full_name: true, phone: true } },
                service_tickets: { select: { service_number: true, created_at: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ success: true, data: feedbacks });
    } catch (error: any) {
        console.error("[CUSTOMER_FEEDBACK_GET] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const parsed = feedbackSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        const feedback = await prisma.service_feedback.create({
            data: {
                user_id: parsed.data.user_id,
                ticket_id: parsed.data.ticket_id,
                rating: parsed.data.rating,
                comment: parsed.data.comment,
                staff_rating: parsed.data.staff_rating,
                timing_rating: parsed.data.timing_rating
            }
        });

        return NextResponse.json({ success: true, data: feedback });
    } catch (error: any) {
        console.error("[CUSTOMER_FEEDBACK_POST] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
