import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

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

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !(['service_admin', 'super_admin'].includes(user.role as string))) {
            return NextResponse.json({ success: false, error: "Access denied. Admin only." }, { status: 403 });
        }
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const body = await req.json();
        const { adjustmentId, status, reason } = body; // status: 'approved' | 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        const adjustment = await prisma.$transaction(async (tx) => {
            const adj = await tx.stock_adjustments.findFirst({
                where: {
                    id: adjustmentId,
                    dealer_id: dealerId
                },
                include: { stock_adjustment_items: true }
            });

            if (!adj) throw new Error("Adjustment not found or access denied");
            if (adj.status !== 'pending') throw new Error("Adjustment is already " + adj.status);

            if (status === 'rejected') {
                return await tx.stock_adjustments.update({
                    where: { id: adjustmentId },
                    data: {
                        status: 'rejected',
                        rejection_reason: reason,
                        approved_by: user.userId,
                        approved_at: new Date()
                    }
                });
            }

            // If Approved, apply changes
            for (const item of adj.stock_adjustment_items) {
                if (item.batch_id) {
                    const batch = await tx.inventory_batches.findUnique({
                        where: { id: item.batch_id }
                    });
                    if (batch) {
                        // Security check: batch belongs to dealer
                        if (batch.dealer_id !== dealerId) throw new Error(`Unauthorized: Batch ${item.batch_id} belongs to another dealer`);

                        const newBatchQty = item.actual_quantity;
                        await tx.inventory_batches.update({
                            where: { id: batch.id },
                            data: { current_quantity: newBatchQty }
                        });

                        // Create movement for Batch
                        await tx.inventory_movements.create({
                            data: {
                                dealer_id: dealerId,
                                product_id: item.product_id!,
                                batch_id: batch.id,
                                movement_type: (item.difference || 0) > 0 ? 'stock_in' : 'stock_out',
                                quantity_before: item.system_quantity || 0,
                                quantity_change: item.difference || 0,
                                quantity_after: newBatchQty,
                                reference_type: 'adjustment',
                                reference_id: adj.id,
                                reason: `Stock Adjustment Approved: ${adj.reason || 'Manual Adjustment'}`,
                                performed_by: user.userId
                            }
                        });
                    }
                }

                // Update Overall Product Stock
                if (item.product_id) {
                    const product = await tx.products.findUnique({
                        where: { id: item.product_id }
                    });
                    if (product) {
                        // Security check: product belongs to dealer
                        if (product.dealer_id && product.dealer_id !== dealerId) throw new Error(`Unauthorized: Product ${item.product_id} belongs to another dealer`);

                        const newStock = (product.stock_quantity || 0) + (item.difference || 0);
                        await tx.products.update({
                            where: { id: item.product_id },
                            data: {
                                stock_quantity: newStock,
                                stock_status: newStock <= 0 ? 'out_of_stock' : (newStock <= (product.low_stock_threshold || 5) ? 'low_stock' : 'in_stock')
                            }
                        });
                    }
                }
            }

            return await tx.stock_adjustments.update({
                where: { id: adjustmentId },
                data: {
                    status: 'approved',
                    approved_by: user.userId,
                    approved_at: new Date()
                }
            });
        });

        return NextResponse.json({ success: true, data: serialize(adjustment) });

    } catch (error: any) {
        console.error("Adjustment approval error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
