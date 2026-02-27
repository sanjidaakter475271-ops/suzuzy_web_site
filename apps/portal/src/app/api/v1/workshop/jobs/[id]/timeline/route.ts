import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const events = await prisma.job_events.findMany({
            where: {
                job_card_id: id,
                job_cards: {
                    dealer_id: user.dealerId
                }
            },
            include: {
                profiles: {
                    select: {
                        full_name: true,
                        email: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json(events);
    } catch (error: any) {
        console.error("[JOB_TIMELINE_GET] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
