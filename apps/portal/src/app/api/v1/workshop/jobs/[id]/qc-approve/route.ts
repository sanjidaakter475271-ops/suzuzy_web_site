import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { JOB_STATUS } from "@/lib/workshop/job-state-machine";
import { z } from "zod";

const serialize = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(serialize);
    if (typeof obj === 'object') {
        if (obj.constructor && obj.constructor.name === 'Decimal') {
            return Number(obj);
        }
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = serialize(obj[key]);
        }
        return newObj;
    }
    return obj;
};

const reviewSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    notes: z.string().optional(),
    checklist: z.array(z.object({
        item_name: z.string(),
        category: z.string().optional(),
        is_passed: z.boolean(),
        notes: z.string().optional(),
        photo_url: z.string().optional(),
    })).optional(),
});

/**
 * DIRECT QC APPROVAL BY JOB ID
 * This API is designed to heal "broken" states where a job is in qc_pending
 * but missing a corresponding qc_requests entry.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        // Role check: Only admins/owners/super-admins can review QC
        if (!['service_admin', 'dealer_owner', 'super_admin'].includes(user.role)) {
            return NextResponse.json({ success: false, error: "Forbidden: Access denied" }, { status: 403 });
        }

        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const body = await request.json();
        const parsed = reviewSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ success: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        const { status, notes, checklist } = parsed.data;

        // 1. Get Job Card and verify scoping
        const jobCard = await prisma.job_cards.findUnique({
            where: { id: jobId },
            include: {
                qc_requests: {
                    where: { status: 'pending' },
                    orderBy: { created_at: 'desc' },
                    take: 1
                }
            }
        });

        if (!jobCard || (jobCard.dealer_id !== dealerId && user.role !== 'super_admin')) {
            return NextResponse.json({ success: false, error: "Job card not found or access denied" }, { status: 404 });
        }

        const nextJobStatus = status === 'approved' ? JOB_STATUS.QC_APPROVED : JOB_STATUS.QC_REJECTED;

        // 2. Perform Transaction
        const result = await prisma.$transaction(async (tx) => {
            let qcId: string;

            // Heal missing QC request if necessary
            if (jobCard.qc_requests.length === 0) {
                console.log(`[QC_HEAL] Creating missing QC request for Job: ${jobId}`);
                const newQcRequest = await tx.qc_requests.create({
                    data: {
                        job_card_id: jobId,
                        requested_by: user.userId, // Use current user's profile ID to avoid foreign key violations
                        status: 'pending',
                        notes: "Auto-created to heal missing record during direct approval."
                    }
                });
                qcId = newQcRequest.id;
            } else {
                qcId = jobCard.qc_requests[0].id;
            }

            // Update QC Request
            const updatedQc = await tx.qc_requests.update({
                where: { id: qcId },
                data: {
                    status,
                    notes,
                    reviewer_id: user.userId,
                    reviewed_at: new Date(),
                }
            });

            // Save checklist items
            if (checklist && checklist.length > 0) {
                await tx.qc_checklist_items.createMany({
                    data: checklist.map(item => ({
                        qc_request_id: qcId,
                        ...item
                    }))
                });
            }

            // Update Job Card status
            await tx.job_cards.update({
                where: { id: jobId },
                data: { status: nextJobStatus }
            });

            // Log Job History
            await tx.job_state_history.create({
                data: {
                    job_card_id: jobId,
                    from_status: jobCard.status,
                    to_status: nextJobStatus,
                    changed_by: user.userId,
                    reason: `Direct QC ${status}: ${notes || ''}`
                }
            });

            return updatedQc;
        });

        // Broadcast realtime event
        try {
            const { broadcastEvent } = await import('@/lib/socket-server');
            await broadcastEvent('job_cards:changed', {
                id: jobId,
                status: nextJobStatus,
                type: `qc_${status}`,
                jobId,
            });
        } catch (e) {
            console.error("[REALTIME] Broadcast failed", e);
        }

        return NextResponse.json({
            success: true,
            data: serialize(result),
            message: `QC direct review submitted as ${status}`
        });

    } catch (error: any) {
        console.error("[QC_DIRECT_REVIEW_POST] Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
