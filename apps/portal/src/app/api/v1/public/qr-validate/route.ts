import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ success: false, error: 'QR Code is required' }, { status: 400 });
        }

        // Search for the QR code in the customer_registration_qr table
        const qrRecord = await (prisma as any).customer_registration_qr.findFirst({
            where: {
                qr_secret: code,
                is_active: true
            },
            include: {
                dealers: {
                    select: {
                        id: true,
                        business_name: true,
                        logo_url: true,
                        city: true
                    }
                }
            }
        });

        if (!qrRecord) {
            return NextResponse.json({ success: false, error: 'Invalid or inactive QR code' }, { status: 404 });
        }

        // Increment scan count
        await (prisma as any).customer_registration_qr.update({
            where: { id: qrRecord.id },
            data: { scan_count: (qrRecord.scan_count || 0) + 1 }
        });

        return NextResponse.json({
            success: true,
            data: {
                dealer: qrRecord.dealers,
                qrLabel: qrRecord.label
            }
        });

    } catch (error: any) {
        console.error('[QR_VALIDATE_API] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
