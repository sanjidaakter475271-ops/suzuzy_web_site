import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { verifyTOTP } from "@/lib/auth/mfa";

export async function POST(req: NextRequest) {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const user = await prisma.profiles.findUnique({
        where: { id: userPayload.userId }
    });

    if (!user || !(user as any).mfa_secret) {
        return NextResponse.json({ error: "MFA not initiated" }, { status: 400 });
    }

    const isValid = verifyTOTP(token, (user as any).mfa_secret);

    if (!isValid) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Enable MFA
    await prisma.profiles.update({
        where: { id: user.id },
        data: { mfa_enabled: true }
    });

    return NextResponse.json({ success: true, message: "MFA enabled successfully" });
}
