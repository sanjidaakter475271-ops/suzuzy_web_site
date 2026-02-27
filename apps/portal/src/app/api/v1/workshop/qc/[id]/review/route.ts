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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const body = await request.json();
        const parsed = reviewSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ success: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        const { status, notes, checklist } = parsed.data;

        // 1. Get QC request and check dealer scoping
        const qcRequest = await prisma.qc_requests.findUnique({
            where: { id },
            include: {
                job_cards: {
                    select: { id: true, dealer_id: true, status: true }
                }
            }
        });

        if (!qcRequest || (qcRequest.job_cards.dealer_id !== dealerId && user.role !== 'super_admin')) {
            return NextResponse.json({ success: false, error: "QC request not found or access denied" }, { status: 404 });
        }

        const nextJobStatus = status === 'approved' ? JOB_STATUS.QC_APPROVED : JOB_STATUS.QC_REJECTED;

        // 2. Perform transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update QC Request
            const updatedQc = await tx.qc_requests.update({
                where: { id },
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
                        qc_request_id: id,
                        ...item
                    }))
                });
            }

            // Update Job Card status
            await tx.job_cards.update({
                where: { id: qcRequest.job_card_id },
                data: { status: nextJobStatus }
            });

            // Log Job History
            await tx.job_state_history.create({
                data: {
                    job_card_id: qcRequest.job_card_id,
                    from_status: qcRequest.job_cards.status,
                    to_status: nextJobStatus,
                    changed_by: user.userId,
                    reason: `QC ${status}: ${notes || ''}`
                }
            });

            return updatedQc;
        });

        return NextResponse.json({
            success: true,
            data: serialize(result),
            message: `QC review submitted as ${status}`
        });

    } catch (error: any) {
        console.error("[QC_REVIEW_POST] Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
