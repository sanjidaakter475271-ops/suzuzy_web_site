import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyOTP } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
        }

        // 1. Verify OTP
        const otpResult = await verifyOTP(email, code, "login");
        if (!otpResult.valid) {
            return NextResponse.json({ error: otpResult.message }, { status: 401 });
        }

        // 2. Find User
        const user = await prisma.profiles.findUnique({
            where: { email },
            include: { roles: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. Create Session
        const payload = {
            userId: user.id,
            email: user.email || "",
            role: user.roles?.name || "customer",
            dealerId: user.dealer_id,
        };

        const session = await createSession(user.id, payload, {
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
            userAgent: req.headers.get("user-agent") || "unknown",
        });

        // 4. Log success
        await prisma.login_history.create({
            data: {
                user_id: user.id,
                email,
                login_type: "otp",
                status: "success",
                ip_address: req.headers.get("x-forwarded-for") || "127.0.0.1",
                user_agent: req.headers.get("user-agent") || "unknown",
            }
        });

        const response = NextResponse.json({ success: true, user });

        // Set cookies
        response.cookies.set("access_token", session.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 900,
            path: "/",
        });
        response.cookies.set("refresh_token", session.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3 * 24 * 60 * 60,
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("OTP verify error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
