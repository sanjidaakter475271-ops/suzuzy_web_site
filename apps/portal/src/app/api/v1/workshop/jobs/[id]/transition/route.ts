import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { canTransition, JOB_STATUS } from "@/lib/workshop/job-state-machine";
import { z } from "zod";

const transitionSchema = z.object({
    toStatus: z.string(),
    reason: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const parsed = transitionSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        const { toStatus, reason, metadata } = parsed.data;

        // 1. Get current status
        const job = await prisma.job_cards.findUnique({
            where: { id },
            select: { status: true, dealer_id: true }
        });

        if (!job) {
            return NextResponse.json({ error: "Job card not found" }, { status: 404 });
        }

        // Auth: check dealer scoping
        if (job.dealer_id !== user.dealerId && user.role !== 'super_admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const fromStatus: string = job.status || 'created';

        // 2. Validate transition
        if (!canTransition(fromStatus, toStatus)) {
            return NextResponse.json({
                error: `Invalid status transition from ${fromStatus} to ${toStatus}`
            }, { status: 400 });
        }

        // 3. Execute transition in transaction
        const updatedJob = await prisma.$transaction(async (tx) => {
            // Update job status
            const updated = await tx.job_cards.update({
                where: { id },
                data: {
                    status: toStatus,
                    // Auto-set service_end_time if moving to COMPLETED/DELIVERED
                    ...((toStatus === JOB_STATUS.COMPLETED || toStatus === JOB_STATUS.DELIVERED)
                        ? { service_end_time: new Date() } : {})
                }
            });

            // Record history
            await tx.job_state_history.create({
                data: {
                    job_card_id: id,
                    from_status: fromStatus,
                    to_status: toStatus,
                    changed_by: user.userId,
                    reason,
                    metadata: metadata || {}
                }
            });

            // Record event
            await tx.job_events.create({
                data: {
                    job_card_id: id,
                    event_type: 'status_change',
                    description: `Status changed from ${fromStatus} to ${toStatus}${reason ? ': ' + reason : ''}`,
                    actor_id: user.userId,
                    metadata: { fromStatus, toStatus, ...metadata }
                }
            });

            return updated;
        });

        return NextResponse.json({
            success: true,
            status: updatedJob.status,
            message: `Status updated to ${toStatus}`
        });

    } catch (error: any) {
        console.error("[JOB_TRANSITION_POST] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
