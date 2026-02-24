import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcast } from "@/lib/socket-server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user || !(['service_admin', 'super_admin'].includes(user.role as string))) {
            return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 });
        }

        const { id: requisitionId } = await params;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get requisition details
            const reqItem = await tx.service_requisitions.findUnique({
                where: { id: requisitionId },
                include: { products: true }
            });

            if (!reqItem) throw new Error("Requisition not found");
            if (reqItem.status !== 'approved') throw new Error(`Cannot return requisition in ${reqItem.status} status`);

            // 2. Revert stock
            if (reqItem.product_id) {
                const product = await tx.products.findUnique({
                    where: { id: reqItem.product_id }
                });

                if (product) {
                    const oldStock = product.stock_quantity || 0;
                    const newStock = oldStock + reqItem.quantity;

                    // Validate dealer_id before creating movement
                    const movementDealerId = product.dealer_id || user.dealerId;
                    if (!movementDealerId) throw new Error("Cannot determine dealer_id for inventory movement.");

                    await tx.products.update({
                        where: { id: reqItem.product_id },
                        data: {
                            stock_quantity: newStock,
                            stock_status: newStock <= 0 ? 'out_of_stock' : (newStock <= (product.low_stock_threshold || 5) ? 'low_stock' : 'in_stock')
                        }
                    });

                    // 3. Log movement
                    await tx.inventory_movements.create({
                        data: {
                            dealer_id: movementDealerId,
                            product_id: reqItem.product_id,
                            movement_type: 'stock_in',
                            quantity_before: oldStock,
                            quantity_change: reqItem.quantity,
                            quantity_after: newStock,
                            reference_type: 'requisition_return',
                            reference_id: reqItem.id,
                            reason: `Requisition Return (POS Removal)`,
                            notes: `Job Card ID: ${reqItem.job_card_id}`,
                            performed_by: user.userId
                        }
                    });
                }
            }

            // 4. Update status
            return await tx.service_requisitions.update({
                where: { id: requisitionId },
                data: {
                    status: 'returned',
                    notes: reqItem.notes ? `${reqItem.notes}\nReturned at POS.` : "Returned at POS."
                }
            });
        });

        // 5. Broadcast changes
        await broadcast('inventory:changed', { triggeredBy: user.userId, dealerId: user.dealerId });
        await broadcast('inventory:adjusted', { triggeredBy: user.userId, dealerId: user.dealerId });
        await broadcast('requisition:status_changed', { id: requisitionId, status: 'returned', dealerId: user.dealerId });

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("Return order error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
