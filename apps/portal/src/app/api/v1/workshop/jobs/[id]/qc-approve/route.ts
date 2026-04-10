import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { JOB_STATUS } from "@/lib/workshop/job-state-machine";
import { createNotification } from "@/lib/notifications";
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

        const nextJobStatus = status === 'approved' ? JOB_STATUS.COMPLETED : JOB_STATUS.QC_REJECTED;

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

            // If approved, handle comprehensive completion logic
            if (status === 'approved') {
                // A. Handle Pending Requisitions (Auto-Issue Parts)
                const pendingRequisitions = await tx.service_requisitions.findMany({
                    where: {
                        job_card_id: jobId,
                        status: 'pending'
                    },
                    include: { products: true }
                });

                for (const reqItem of pendingRequisitions) {
                    if (reqItem.product_id) {
                        const product = reqItem.products;
                        const requestedQuantity = reqItem.quantity;

                        // Fetch available batches (FIFO)
                        const batches = await tx.inventory_batches.findMany({
                            where: {
                                product_id: reqItem.product_id,
                                dealer_id: dealerId,
                                current_quantity: { gt: 0 },
                                status: 'active'
                            },
                            orderBy: { received_date: 'asc' }
                        });

                        const totalAvailable = batches.reduce((sum, b) => sum + b.current_quantity, 0);

                        // We deduct whatever is available, even if insufficient, to "finish" the job
                        // or we could throw error. In this "Heal & Finish" mode, we'll deduct max possible.
                        let remainingToDeduct = requestedQuantity;

                        for (const batch of batches) {
                            if (remainingToDeduct <= 0) break;

                            const deduction = Math.min(batch.current_quantity, remainingToDeduct);
                            const newBatchQty = batch.current_quantity - deduction;

                            // Update Batch
                            await tx.inventory_batches.update({
                                where: { id: batch.id },
                                data: {
                                    current_quantity: newBatchQty,
                                    sold_quantity: (batch.sold_quantity || 0) + deduction
                                }
                            });

                            // Create Movement record
                            await tx.inventory_movements.create({
                                data: {
                                    dealer_id: dealerId,
                                    product_id: reqItem.product_id!,
                                    batch_id: batch.id,
                                    movement_type: 'stock_out',
                                    quantity_before: batch.current_quantity,
                                    quantity_change: -deduction,
                                    quantity_after: newBatchQty,
                                    reference_type: 'requisition',
                                    reference_id: reqItem.id,
                                    reason: `QC Auto-Approval Deduction`,
                                    performed_by: user.userId
                                }
                            });

                            remainingToDeduct -= deduction;
                        }

                        // Update Overall Product Stock
                        const actualDeducted = requestedQuantity - remainingToDeduct;
                        const oldStock = product?.stock_quantity || 0;
                        const newStock = oldStock - actualDeducted;

                        if (product) {
                            await tx.products.update({
                                where: { id: reqItem.product_id },
                                data: {
                                    stock_quantity: newStock,
                                    stock_status: newStock <= 0 ? 'out_of_stock' : (newStock <= (product.low_stock_threshold || 5) ? 'low_stock' : 'in_stock')
                                }
                            });
                        }

                        // Mark requisition as approved/issued
                        await tx.service_requisitions.update({
                            where: { id: reqItem.id },
                            data: {
                                status: 'approved',
                                approved_at: new Date(),
                                approved_by: user.userId,
                                notes: (reqItem.notes || '') + "\nAuto-approved during QC pass."
                            }
                        });
                    }
                }

                // B. Mark all tasks as completed
                await tx.service_tasks.updateMany({
                    where: { job_card_id: jobId },
                    data: { status: 'completed' }
                });

                // C. Release any occupied ramps
                await tx.service_ramps.updateMany({
                    where: { current_ticket_id: jobCard.ticket_id, dealer_id: dealerId },
                    data: { status: 'idle', current_ticket_id: null }
                });
            }

            // Update Job Card status and end time if approved
            await tx.job_cards.update({
                where: { id: jobId },
                data: {
                    status: nextJobStatus,
                    ...(status === 'approved' ? { service_end_time: new Date() } : {})
                }
            });

            // --- ADVANCED SERVICE TRACKING LOGIC ---
            if (status === 'approved') {
                const ticket = await tx.service_tickets.findUnique({
                    where: { id: jobCard.ticket_id as string },
                    select: { vehicle_id: true }
                });

                if (ticket?.vehicle_id) {
                    const vehicleId = ticket.vehicle_id;

                    // 1. Get service sequence
                    const historyCount = await tx.service_history.count({
                        where: { vehicle_id: vehicleId }
                    });
                    const nextSequence = historyCount + 1;

                    // 2. Check for free service plan
                    const servicePlan = await tx.customer_service_plans.findFirst({
                        where: {
                            vehicle_id: vehicleId,
                            is_active: true
                        }
                    });

                    let isFree = false;
                    if (servicePlan && servicePlan.used_free_services < servicePlan.total_free_services) {
                        isFree = true;
                        // Increment used free services if not already handled by billing
                        // We check if history for this job card already has is_free_service set to avoid double counting
                        const existingHistory = await tx.service_history.findFirst({
                            where: { job_card_id: jobId }
                        });

                        if (!existingHistory || !existingHistory.is_free_service) {
                            await tx.customer_service_plans.update({
                                where: { id: servicePlan.id },
                                data: { used_free_services: { increment: 1 } }
                            });
                        }
                    }

                    // 3. Create or Update Service History
                    const existingHistory = await tx.service_history.findFirst({
                        where: { job_card_id: jobId }
                    });

                    if (existingHistory) {
                        await tx.service_history.update({
                            where: { id: existingHistory.id },
                            data: {
                                service_sequence: nextSequence,
                                is_free_service: isFree,
                                service_type: isFree ? 'free' : 'paid',
                                dealer_id: dealerId
                            }
                        });
                    } else {
                        await tx.service_history.create({
                            data: {
                                vehicle_id: vehicleId,
                                ticket_id: jobCard.ticket_id,
                                job_card_id: jobId,
                                service_date: new Date(),
                                service_sequence: nextSequence,
                                is_free_service: isFree,
                                service_type: isFree ? 'free' : 'paid',
                                dealer_id: dealerId,
                                summary: `Service completed via QC approval. Sequence #${nextSequence}`
                            }
                        });
                    }
                }
            }
            // --- END ADVANCED SERVICE TRACKING ---

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

            // Notify Technician about QC result
            if (jobCard.technician_id) {
                const staff = await tx.service_staff.findUnique({
                    where: { id: jobCard.technician_id },
                    select: { profile_id: true }
                });

                if (staff?.profile_id) {
                    await createNotification({
                        userId: staff.profile_id,
                        title: status === 'approved' ? "Job QC Passed" : "Job QC Rejected",
                        message: status === 'approved'
                            ? `Your work on Job Card has passed Quality Check.`
                            : `QC rejected: ${notes || 'Please check and fix issues.'}`,
                        type: status === 'approved' ? 'success' : 'error',
                        linkUrl: `/job/${jobId}` // Technician mobile app link
                    }, tx);
                }
            }

            return updatedQc;
        }, {
            timeout: 30000 // High timeout for inventory operations
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
