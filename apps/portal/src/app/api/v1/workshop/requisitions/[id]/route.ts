import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcastEvent } from "@/lib/socket-server";

// Local recursive Decimal-to-Number serializer
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

/**
 * PATCH: Approve/Reject individual requisition item
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        // Permission check
        if (!user || !(['service_admin', 'super_admin'].includes(user.role as string))) {
            return NextResponse.json({ success: false, error: "Access denied. Admin only." }, { status: 403 });
        }
        const dealerId = user.dealerId;
        if (!dealerId) {
            return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });
        }

        const body = await req.json();
        const { status, reason } = body; // status: 'approved' | 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        const { id: requisitionId } = await params;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get current requisition with dealer scoping
            const reqItem = await tx.service_requisitions.findFirst({
                where: {
                    id: requisitionId,
                    job_cards: {
                        dealer_id: dealerId
                    }
                },
                include: { products: true }
            });

            if (!reqItem) throw new Error("Requisition item not found or access denied");
            if (reqItem.status !== 'pending') throw new Error("Item is already " + reqItem.status);

            // 2. Update status
            const updated = await tx.service_requisitions.update({
                where: { id: requisitionId },
                data: {
                    status: status,
                    approved_at: status === 'approved' ? new Date() : null,
                    approved_by: status === 'approved' ? user.userId : null,
                    notes: reason ? `${reqItem.notes || ''}\nReason: ${reason}` : reqItem.notes
                }
            });

            // 3. If approved, handle stock deduction with FIFO Batches
            if (status === 'approved' && reqItem.product_id) {
                const product = reqItem.products;
                if (!product) throw new Error("Product data not found in requisition");

                // Product dealer check
                if (product.dealer_id && product.dealer_id !== dealerId) {
                    throw new Error("Unauthorized: Product belongs to another dealer");
                }

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
                if (totalAvailable < requestedQuantity) {
                    throw new Error(`Insufficient batch stock for ${product.name}. Available: ${totalAvailable}`);
                }

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
                            reason: `Requisition FIFO Deduction`,
                            performed_by: user.userId
                        }
                    });

                    remainingToDeduct -= deduction;
                }

                // Update Overall Product Stock
                const oldStock = product.stock_quantity || 0;
                const newStock = oldStock - requestedQuantity;

                await tx.products.update({
                    where: { id: reqItem.product_id },
                    data: {
                        stock_quantity: newStock,
                        stock_status: newStock <= 0 ? 'out_of_stock' : (newStock <= (product.low_stock_threshold || 5) ? 'low_stock' : 'in_stock')
                    }
                });
            }

            return updated;
        });

        // 4. Notify via Real-time
        const context = await prisma.service_requisitions.findUnique({
            where: { id: result.id },
            include: {
                job_cards: {
                    include: { service_tickets: { select: { service_number: true } } }
                }
            }
        });

        const jobNo = context?.job_cards?.service_tickets?.service_number || "N/A";
        const groupId = context?.requisition_group_id;

        const broadcastData = {
            id: result.id,
            status: result.status,
            jobId: result.job_card_id,
            jobNo: jobNo,
            groupId: groupId,
            requisitionGroupId: groupId,
            technicianId: result.staff_id,
            dealerId: dealerId
        };

        const eventName = status === 'approved' ? 'requisition:approved' : 'requisition:rejected';
        await broadcastEvent(eventName, broadcastData);
        await broadcastEvent('requisition:status_changed', broadcastData);

        return NextResponse.json({ success: true, data: serialize(result) });

    } catch (error: any) {
        console.error("Requisition update error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
