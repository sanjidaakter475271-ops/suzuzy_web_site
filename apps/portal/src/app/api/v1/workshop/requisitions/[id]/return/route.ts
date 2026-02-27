import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcastEvent } from "@/lib/socket-server";

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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user || !(['service_admin', 'super_admin'].includes(user.role as string))) {
            return NextResponse.json({ success: false, error: "Access denied. Admin only." }, { status: 403 });
        }
        const dealerId = user.dealerId;
        if (!dealerId) {
            return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });
        }

        const { id: requisitionId } = await params;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get requisition details with dealer scoping
            const reqItem = await tx.service_requisitions.findFirst({
                where: {
                    id: requisitionId,
                    job_cards: {
                        dealer_id: dealerId
                    }
                },
                include: { products: true }
            });

            if (!reqItem) throw new Error("Requisition not found or access denied");
            if (reqItem.status !== 'approved') throw new Error(`Cannot return requisition in ${reqItem.status} status`);

            // 2. Revert stock
            if (reqItem.product_id) {
                const product = await tx.products.findUnique({
                    where: { id: reqItem.product_id }
                });

                if (product) {
                    // Safety check on product dealer
                    if (product.dealer_id && product.dealer_id !== dealerId) {
                        throw new Error("Unauthorized: Product belongs to another dealer");
                    }

                    const oldStock = product.stock_quantity || 0;
                    const newStock = oldStock + reqItem.quantity;

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
                            dealer_id: dealerId,
                            product_id: reqItem.product_id,
                            movement_type: 'stock_in',
                            quantity_before: oldStock,
                            quantity_change: reqItem.quantity,
                            quantity_after: newStock,
                            reference_type: 'requisition_return',
                            reference_id: reqItem.id,
                            reason: `Requisition Return (Workshop Admin)`,
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
                    notes: reqItem.notes ? `${reqItem.notes}\nReturned/Cancelled by Admin.` : "Returned/Cancelled by Admin."
                }
            });
        });

        // 5. Broadcast changes
        await broadcastEvent('inventory:changed', { triggeredBy: user.userId, dealerId: dealerId });
        await broadcastEvent('inventory:adjusted', { triggeredBy: user.userId, dealerId: dealerId });
        await broadcastEvent('requisition:status_changed', { id: requisitionId, status: 'returned', dealerId: dealerId });

        return NextResponse.json({ success: true, data: serialize(result) });

    } catch (error: any) {
        console.error("Return requisition error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
