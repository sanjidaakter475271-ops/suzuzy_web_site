import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyJWT } from "@/lib/auth/jwt";
import { verifyTOTP } from "@/lib/auth/mfa";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
    try {
        const { mfaTicket, token } = await req.json();

        if (!mfaTicket || !token) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Verify Ticket
        const payload = await verifyJWT(mfaTicket);
        if (!payload || payload.type !== "mfa_challenge") {
            return NextResponse.json({ error: "Invalid or expired MFA ticket" }, { status: 401 });
        }

        // 2. Get User MFA Secret
        const user = await prisma.profiles.findUnique({
            where: { id: payload.userId as string }
        });

        if (!user || !(user as any).mfa_secret || !user.mfa_enabled) {
            return NextResponse.json({ error: "MFA not enabled for this user" }, { status: 400 });
        }

        // 3. Verify TOTP
        const isValid = verifyTOTP(token, (user as any).mfa_secret);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid MFA token" }, { status: 401 });
        }

        // 4. Create Session
        const sessionPayload = {
            userId: user.id,
            email: user.email!,
            role: payload.role as string,
            dealerId: user.dealer_id,
        };

        const session = await createSession(user.id, sessionPayload, {
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
            userAgent: req.headers.get("user-agent") || "unknown",
        }, payload.rememberMe as boolean);

        // 5. Log success
        await (prisma as any).login_history.create({
            data: {
                user_id: user.id,
                email: user.email!,
                login_type: "mfa",
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
            maxAge: (payload.rememberMe ? 30 : 3) * 24 * 60 * 60,
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("MFA Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
