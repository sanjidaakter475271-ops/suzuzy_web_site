import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

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

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const outstandingInvoices = await prisma.service_invoices.findMany({
            where: {
                dealer_id: dealerId,
                due_amount: { gt: 0 },
                status: { not: 'cancelled' }
            },
            include: {
                profiles: { select: { full_name: true, phone: true } },
                service_vehicles: { include: { bike_models: true } }
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + Number(inv.due_amount), 0);

        return NextResponse.json({
            success: true,
            data: serialize({
                totalOutstanding,
                count: outstandingInvoices.length,
                invoices: outstandingInvoices.map(inv => ({
                    id: inv.id,
                    invoiceNumber: inv.invoice_number,
                    customerName: inv.profiles?.full_name,
                    customerPhone: inv.profiles?.phone,
                    vehicle: inv.service_vehicles?.bike_models?.name,
                    grandTotal: inv.grand_total,
                    dueAmount: inv.due_amount,
                    createdAt: inv.created_at,
                    daysPending: Math.floor((Date.now() - new Date(inv.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
                }))
            })
        });

    } catch (error: any) {
        console.error("[FINANCE_OUTSTANDING] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
