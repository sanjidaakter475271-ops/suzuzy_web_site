import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, rememberMe } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
        }

        // 1. Rate Limiting
        const rl = await checkRateLimit(`login:${email}`, 5, 900); // 5 attempts per 15 min
        if (!rl.success) {
            return NextResponse.json({
                error: `Too many login attempts. Please try again in ${Math.ceil(rl.reset / 60)} minutes.`
            }, { status: 429 });
        }

        // 2. Find User
        const user = await prisma.profiles.findUnique({
            where: { email },
            include: { roles: true }
        });

        if (!user || !(user as any).password_hash) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // 3. Verify Account Lockout
        if ((user as any).locked_until && (user as any).locked_until > new Date()) {
            return NextResponse.json({
                error: `Account is temporarily locked. Try again after ${new Date((user as any).locked_until).toLocaleTimeString()}`
            }, { status: 403 });
        }

        // 4. Verify Password
        const isValid = await verifyPassword(password, (user as any).password_hash);

        if (!isValid) {
            // Increment failed attempts
            const attempts = ((user as any).failed_login_attempts || 0) + 1;
            let lockedUntil = null;
            if (attempts >= 10) {
                lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h lockout
            }

            await prisma.profiles.update({
                where: { id: user.id },
                data: {
                    failed_login_attempts: attempts,
                    locked_until: lockedUntil
                }
            });

            // Log failure
            await (prisma as any).login_history.create({
                data: {
                    user_id: user.id,
                    email,
                    login_type: "password",
                    status: "failed",
                    failure_reason: "Invalid password",
                    ip_address: req.headers.get("x-forwarded-for") || "127.0.0.1",
                    user_agent: req.headers.get("user-agent") || "unknown",
                }
            });

            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // 5. Success - Reset failed attempts
        await prisma.profiles.update({
            where: { id: user.id },
            data: {
                failed_login_attempts: 0,
                locked_until: null,
                last_login_at: new Date()
            } as any
        });
        await resetRateLimit(`login:${email}`);

        const payload = {
            userId: user.id,
            email: user.email || "",
            role: user.roles?.name || "customer",
            dealerId: user.dealer_id,
        };

        // 6. Check MFA
        if (user.mfa_enabled) {
            // Generate temporary MFA ticket (valid for 5 mins)
            const { signJWT } = await import("@/lib/auth/jwt");
            const mfaTicket = await signJWT({ ...payload, type: "mfa_challenge", rememberMe }, "5m");

            return NextResponse.json({
                mfaRequired: true,
                mfaTicket,
                message: "MFA verification required"
            });
        }

        // 7. No MFA - Create session
        const session = await createSession(user.id, payload, {
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
            userAgent: req.headers.get("user-agent") || "unknown",
        }, rememberMe);

        // Log success
        await (prisma as any).login_history.create({
            data: {
                user_id: user.id,
                email,
                login_type: "password",
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
            maxAge: 900, // 15m
            path: "/",
        });
        response.cookies.set("refresh_token", session.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: (rememberMe ? 30 : 3) * 24 * 60 * 60,
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
