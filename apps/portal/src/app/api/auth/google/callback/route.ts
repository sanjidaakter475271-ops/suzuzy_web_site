import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=no_code", req.url));
    }

    try {
        // 1. Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenResponse.json();
        if (tokens.error) throw new Error(tokens.error_description);

        // 2. Get user info
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser = await userResponse.json();

        // 3. Find or Create User
        let user = await prisma.profiles.findUnique({
            where: { email: googleUser.email },
            include: { roles: true }
        });

        if (!user) {
            // Create user
            const CUSTOMER_ROLE_ID = "43498ddd-6416-4836-8590-17e4294bdd97";
            user = await prisma.profiles.create({
                data: {
                    id: crypto.randomUUID(),
                    email: googleUser.email,
                    full_name: googleUser.name,
                    email_verified: true,
                    role_id: CUSTOMER_ROLE_ID,
                    status: "active",
                },
                include: { roles: true }
            });
        }

        // 4. Update/Create Auth Provider
        await (prisma as any).auth_providers.upsert({
            where: {
                provider_provider_user_id: {
                    provider: "google",
                    provider_user_id: googleUser.sub
                }
            },
            update: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
                raw_user_data: googleUser as any
            },
            create: {
                user_id: user.id,
                provider: "google",
                provider_user_id: googleUser.sub,
                provider_email: googleUser.email,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
                raw_user_data: googleUser as any
            }
        });

        // 5. Create Session
        const session = await createSession(user.id, {
            userId: user.id,
            email: user.email!,
            role: user.roles?.name || "customer",
            dealerId: user.dealer_id,
        }, {
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
            userAgent: req.headers.get("user-agent") || "unknown",
        });

        const response = NextResponse.redirect(new URL("/", req.url));
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
        console.error("Google OAuth error:", error);
        return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
    }
}
