import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { ROLES } from "@/lib/auth/roles";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Define valid roles for viewing history using central ROLES registry
        const validRoles = [
            ROLES.SUPER_ADMIN, ROLES.SERVICE_ADMIN, ROLES.DEALER_OWNER,
            ROLES.SHOWROOM_ADMIN, ROLES.SERVICE_STUFF, ROLES.SERVICE_TECHNICIAN,
            ROLES.SELLS_STUFF
        ];
        if (!validRoles.includes(user.role as any)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch the job to check dealer scope
        const job = await prisma.job_cards.findUnique({
            where: { id },
            select: { dealer_id: true }
        });

        if (!job) {
            return NextResponse.json({ error: "Job card not found" }, { status: 404 });
        }

        // Scope check
        if (job.dealer_id !== user.dealerId && user.role !== 'super_admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch history
        const history = await prisma.job_state_history.findMany({
            where: {
                job_card_id: id,
            },
            include: {
                profiles: {
                    select: {
                        first_name: true,
                        last_name: true,
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Format for frontend
        const formatted = history.map(h => ({
            id: h.id,
            jobCardId: h.job_card_id,
            fromStatus: h.from_status,
            toStatus: h.to_status,
            actorName: h.profiles ? `${h.profiles.first_name || ''} ${h.profiles.last_name || ''}`.trim() : 'System',
            reason: h.reason,
            metadata: h.metadata,
            createdAt: h.created_at,
        }));

        return NextResponse.json({
            success: true,
            data: formatted
        });

    } catch (error: any) {
        console.error("[JOB_HISTORY_GET] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
