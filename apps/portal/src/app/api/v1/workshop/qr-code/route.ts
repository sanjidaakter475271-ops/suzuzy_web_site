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

        const qrCodes = await (prisma as any).workshop_qr_codes.findMany({
            where: { dealer_id: user.dealerId as string },
            orderBy: { created_at: 'desc' },
        });

        const mappedCodes = qrCodes.map((code: any) => ({
            ...code,
            qr_content: `SUZUKY-WS-${user.dealerId}-${code.qr_secret}`
        }));

        return NextResponse.json({ success: true, data: mappedCodes });
    } catch (error: any) {
        console.error('[QR_CODE_GET] Error:', error);
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

        // Optionally deactivate old ones if making a new primary one
        await (prisma as any).workshop_qr_codes.updateMany({
            where: { dealer_id: user.dealerId as string, is_active: true },
            data: { is_active: false }
        });

        const newQrCode = await (prisma as any).workshop_qr_codes.create({
            data: {
                dealer_id: user.dealerId as string,
                qr_secret,
                label: label || 'Main Workshop',
                is_active: true
            }
        });

        // The format we agreed on
        const qrContent = `SUZUKY-WS-${user.dealerId}-${qr_secret}`;

        return NextResponse.json({
            success: true,
            data: { ...newQrCode, qr_content: qrContent }
        });

    } catch (error: any) {
        console.error('[QR_CODE_POST] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
