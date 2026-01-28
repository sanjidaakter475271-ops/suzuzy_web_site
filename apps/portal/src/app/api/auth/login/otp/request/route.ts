import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { sendOTP } from "@/lib/auth/otp";
import { checkRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 1. Rate Limiting
        const rl = await checkRateLimit(`otp:request:${email}`, 3, 600); // 3 requests per 10 min
        if (!rl.success) {
            return NextResponse.json({
                error: `Too many OTP requests. Please try again in ${Math.ceil(rl.reset / 60)} minutes.`
            }, { status: 429 });
        }

        // 2. Find User
        const user = await prisma.profiles.findUnique({
            where: { email }
        });

        // We don't want to leak user existence, but for internal app it might be okay.
        // For security, we could return success even if user doesn't exist, but here we'll be direct.
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. Send OTP
        await sendOTP(user.id, email, "login");

        return NextResponse.json({ success: true, message: "OTP sent to your email" });

    } catch (error) {
        console.error("OTP request error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
