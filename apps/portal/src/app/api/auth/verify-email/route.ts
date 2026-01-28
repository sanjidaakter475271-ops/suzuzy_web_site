import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyOTP } from "@/lib/auth/otp";

export async function POST(req: NextRequest) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
        }

        const result = await verifyOTP(email, code, "email_verification");
        if (!result.valid) {
            return NextResponse.json({ error: result.message }, { status: 400 });
        }

        await prisma.profiles.update({
            where: { email },
            data: { email_verified: true }
        });

        return NextResponse.json({ success: true, message: "Email verified successfully" });

    } catch (error) {
        console.error("Email verification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
