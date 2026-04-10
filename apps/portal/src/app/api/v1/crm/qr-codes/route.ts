import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !['service_admin', 'super_admin', 'dealer_owner'].includes(user.role)) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const qrCodes = await (prisma as any).customer_registration_qr.findMany({
            where: { dealer_id: user.dealerId as string },
            orderBy: { created_at: 'desc' },
        });

        const mappedCodes = qrCodes.map((code: any) => ({
            ...code,
            qr_content: `SUZUKY-REG-${user.dealerId}-${code.qr_secret}`
        }));

        return NextResponse.json({ success: true, data: mappedCodes });
    } catch (error: any) {
        console.error('[CUST_QR_GET] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !['service_admin', 'super_admin', 'dealer_owner'].includes(user.role)) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { label } = body;

        const qr_secret = crypto.randomUUID();

        const newQrCode = await (prisma as any).customer_registration_qr.create({
            data: {
                dealer_id: user.dealerId as string,
                qr_secret,
                label: label || 'Reception',
                is_active: true
            }
        });

        const qrContent = `SUZUKY-REG-${user.dealerId}-${qr_secret}`;

        return NextResponse.json({
            success: true,
            data: { ...newQrCode, qr_content: qrContent }
        });

    } catch (error: any) {
        console.error('[CUST_QR_POST] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
