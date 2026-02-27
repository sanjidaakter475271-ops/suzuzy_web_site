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

        const dateStr = new URL(req.url).searchParams.get('date') || new Date().toISOString().split('T')[0];

        const payments = await prisma.service_payments.findMany({
            where: {
                dealer_id: dealerId,
                payment_date: new Date(dateStr)
            },
            include: {
                service_invoices: {
                    include: {
                        service_tickets: {
                            include: { profiles: { select: { full_name: true } } }
                        }
                    }
                }
            }
        });

        const summary = payments.reduce((acc: any, p) => {
            const method = (p.payment_method || 'unknown').toLowerCase();
            acc.methods[method] = (acc.methods[method] || 0) + Number(p.amount);
            acc.total += Number(p.amount);
            return acc;
        }, { total: 0, methods: {} });

        return NextResponse.json({
            success: true,
            data: serialize({
                date: dateStr,
                totalCollected: summary.total,
                byMethod: summary.methods,
                transactions: payments.map(p => ({
                    id: p.id,
                    invoiceNo: p.service_invoices?.invoice_number,
                    customer: p.service_invoices?.service_tickets?.profiles?.full_name,
                    amount: p.amount,
                    method: p.payment_method,
                    time: p.created_at
                }))
            })
        });

    } catch (error: any) {
        console.error("[FINANCE_DAILY_SUMMARY] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
