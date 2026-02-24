import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcast } from "@/lib/socket-server";

/**
 * PATCH: Approve/Reject individual requisition item
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        // Permission check
        if (!user || !(['service_admin', 'super_admin'].includes(user.role as string))) {
            return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 });
        }

        const body = await req.json();
        const { status, reason } = body; // status: 'approved' | 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const { id: requisitionId } = await params;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get current requisition
            const reqItem = await tx.service_requisitions.findUnique({
                where: { id: requisitionId },
                include: { products: true }
            });

            if (!reqItem) throw new Error("Requisition item not found");
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

            // 3. If approved, handle stock deduction
            if (status === 'approved' && reqItem.product_id) {
                const product = reqItem.products;

                if (!product) throw new Error("Product data not found in requisition");

                // Dealer authorization check
                if (product.dealer_id && product.dealer_id !== user.dealerId) {
                    throw new Error("Unauthorized: Product belongs to another dealer");
                }

                const oldStock = product.stock_quantity || 0;
                if (oldStock < reqItem.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${oldStock}`);
                }

                const newStock = oldStock - reqItem.quantity;

                // Update stock
                await tx.products.update({
                    where: { id: reqItem.product_id },
                    data: {
                        stock_quantity: newStock,
                        stock_status: newStock <= 0 ? 'out_of_stock' : (newStock <= (product.low_stock_threshold || 5) ? 'low_stock' : 'in_stock')
                    }
                });

                // Create inventory movement
                const movementDealerId = product.dealer_id || user.dealerId;
                if (!movementDealerId) throw new Error("Cannot determine dealer_id for inventory movement. Ensure product or user has a valid dealer association.");

                await tx.inventory_movements.create({
                    data: {
                        dealer_id: movementDealerId,
                        product_id: reqItem.product_id,
                        movement_type: 'stock_out',
                        quantity_before: oldStock,
                        quantity_change: -reqItem.quantity,
                        quantity_after: newStock,
                        reference_type: 'requisition',
                        reference_id: reqItem.id,
                        reason: `Service Requisition Approved`,
                        notes: `Job Card ID: ${reqItem.job_card_id}`,
                        performed_by: user.userId
                    }
                });
            }

            return updated;
        });

        // 4. Notify via Real-time
        // Fetch job number and group ID for context
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
            dealerId: user.dealerId
        };

        const eventName = status === 'approved' ? 'requisition:approved' : 'requisition:rejected';
        await broadcast(eventName, broadcastData);
        await broadcast('requisition:status_changed', broadcastData);

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("Requisition update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
