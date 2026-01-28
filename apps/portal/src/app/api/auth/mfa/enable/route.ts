import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { generateMFASecret, generateOTPAuthUrl, generateQRCode } from "@/lib/auth/mfa";

export async function POST(req: NextRequest) {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Generate secret
    const secret = generateMFASecret();
    const otpauthUrl = generateOTPAuthUrl(userPayload.email, secret);
    const qrCode = await generateQRCode(otpauthUrl);

    // 2. Save secret temporarily or in profile (mfa_enabled stays false)
    await prisma.profiles.update({
        where: { id: userPayload.userId },
        data: { mfa_secret: secret }
    });

    return NextResponse.json({
        secret,
        qrCode,
        message: "Scan this QR code and verify to enable MFA."
    });
}
