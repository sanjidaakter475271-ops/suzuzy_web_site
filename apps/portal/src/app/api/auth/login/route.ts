import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
    let email = "";
    let password = "";
    let rememberMe = false;

    try {
        // Parse request body
        const body = await req.json();
        email = body.email;
        password = body.password;
        rememberMe = body.rememberMe;

        if (!email || !password) {
            return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
        }
    } catch (parseError: any) {
        console.error("Body parse error:", parseError?.message);
        return NextResponse.json({ error: "Invalid request body", details: parseError?.message }, { status: 400 });
    }

    try {
        // 1. Rate Limiting
        const rl = await checkRateLimit(`login:${email}`, 5, 900);
        if (!rl.success) {
            return NextResponse.json({
                error: `Too many login attempts. Please try again in ${Math.ceil(rl.reset / 60)} minutes.`
            }, { status: 429 });
        }
    } catch (rateLimitError: any) {
        console.error("Rate limit error:", rateLimitError?.message);
        // Continue even if rate limit check fails
    }

    let user: any;
    try {
        // 2. Find User
        user = await prisma.profiles.findUnique({
            where: { email },
            include: {
                roles: true,
                // @ts-ignore - business_unit_users is in the schema but Prisma client types are stale in IDE
                business_unit_users: {
                    include: {
                        business_units: true
                    }
                }
            }
        });
    } catch (dbError: any) {
        console.error("Database error finding user:", dbError?.message);
        console.error("Database error stack:", dbError?.stack);
        return NextResponse.json({ error: "Database connection error", details: dbError?.message }, { status: 500 });
    }

    if (!user || !user.password_hash) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // 3. Verify Account Lockout
    if (user.locked_until && user.locked_until > new Date()) {
        return NextResponse.json({
            error: `Account is temporarily locked. Try again after ${new Date(user.locked_until).toLocaleTimeString()}`
        }, { status: 403 });
    }

    let isValid = false;
    try {
        // 4. Verify Password
        isValid = await verifyPassword(password, user.password_hash);
    } catch (passwordError: any) {
        console.error("Password verification error:", passwordError?.message);
        console.error("Password verification stack:", passwordError?.stack);
        return NextResponse.json({ error: "Password verification failed", details: passwordError?.message }, { status: 500 });
    }

    if (!isValid) {
        try {
            // Increment failed attempts
            const attempts = (user.failed_login_attempts || 0) + 1;
            let lockedUntil = null;
            if (attempts >= 10) {
                lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
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
        } catch (updateError: any) {
            console.error("Failed to update login attempts:", updateError?.message);
        }

        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    try {
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
    } catch (resetError: any) {
        console.error("Reset attempts error:", resetError?.message);
        // Continue even if reset fails
    }

    const primaryUnit = user.business_unit_users?.[0]?.business_units;

    const payload = {
        userId: user.id,
        email: user.email || "",
        role: user.roles?.name || "customer",
        dealerId: user.dealer_id,
        unitId: primaryUnit?.id,
        unitType: primaryUnit?.unit_type
    };

    // 6. Check MFA
    if (user.mfa_enabled) {
        try {
            const { signJWT } = await import("@/lib/auth/jwt");
            const mfaTicket = await signJWT({ ...payload, type: "mfa_challenge", rememberMe }, "5m");

            return NextResponse.json({
                mfaRequired: true,
                mfaTicket,
                message: "MFA verification required"
            });
        } catch (mfaError: any) {
            console.error("MFA ticket generation error:", mfaError?.message);
            return NextResponse.json({ error: "MFA setup error", details: mfaError?.message }, { status: 500 });
        }
    }

    let session: any;
    try {
        // 7. No MFA - Create session
        session = await createSession(user.id, payload, {
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
            userAgent: req.headers.get("user-agent") || "unknown",
        }, rememberMe);
    } catch (sessionError: any) {
        console.error("Session creation error:", sessionError?.message);
        console.error("Session creation stack:", sessionError?.stack);
        return NextResponse.json({ error: "Session creation failed", details: sessionError?.message }, { status: 500 });
    }

    try {
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
    } catch (logError: any) {
        console.error("Login history logging error:", logError?.message);
        // Continue even if logging fails
    }

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
        maxAge: (rememberMe ? 30 : 3) * 24 * 60 * 60,
        path: "/",
    });

    return response;
}
