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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const { id: invoiceId } = await params;
        const body = await req.json();
        const { amount, paymentMethod, referenceNumber, notes } = body;

        if (!amount || Number(amount) <= 0) {
            return NextResponse.json({ success: false, error: "Invalid payment amount" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const invoice = await tx.service_invoices.findFirst({
                where: {
                    id: invoiceId,
                    dealer_id: dealerId
                }
            });

            if (!invoice) throw new Error("Invoice not found or access denied");
            if (invoice.payment_status === 'paid') throw new Error("Invoice is already fully paid");

            const currentDue = Number(invoice.due_amount);
            const paymentAmount = Number(amount);

            if (paymentAmount > (currentDue + 0.01)) { // Allow minor rounding difference
                throw new Error(`Payment amount exceeds due amount. Due: Tk ${currentDue.toFixed(2)}`);
            }

            const newPaid = Number(invoice.paid_amount) + paymentAmount;
            const newDue = Math.max(0, currentDue - paymentAmount);
            let paymentStatus = 'partial';

            if (newDue <= 0.01) {
                paymentStatus = 'paid';
            }

            // 1. Create Payment Record
            await tx.service_payments.create({
                data: {
                    invoice_id: invoiceId,
                    dealer_id: dealerId,
                    amount: paymentAmount,
                    payment_method: paymentMethod || 'cash',
                    reference_no: referenceNumber || null,
                    notes: notes || null,
                    received_by: user.userId,
                    payment_date: new Date()
                }
            });

            // 2. Update Invoice
            const updatedInvoice = await tx.service_invoices.update({
                where: { id: invoiceId },
                data: {
                    paid_amount: newPaid,
                    due_amount: newDue,
                    payment_status: paymentStatus,
                    status: paymentStatus === 'paid' ? 'completed' : invoice.status
                }
            });

            return updatedInvoice;
        });

        await broadcastEvent('invoice:payment_received', {
            invoiceId: result.id,
            invoiceNumber: result.invoice_number,
            amount: Number(amount),
            newDue: Number(result.due_amount),
            status: result.payment_status,
            dealerId: dealerId
        });

        return NextResponse.json({ success: true, data: serialize(result) });

    } catch (error: any) {
        console.error("Payment processing error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
