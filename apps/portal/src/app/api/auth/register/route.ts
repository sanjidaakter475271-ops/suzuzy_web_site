import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, name, businessName, phone } = body;

        // 1. Validation
        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const pwdVal = validatePasswordStrength(password);
        if (!pwdVal.valid) {
            return NextResponse.json({ error: pwdVal.message }, { status: 400 });
        }

        // 2. Check if user exists
        const existingUser = await prisma.profiles.findUnique({
            where: { email }
        });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // 3. Create Dealer and Profile in Transaction
        const hashedPassword = await hashPassword(password);

        const result = await prisma.$transaction(async (tx) => {
            // Create dealer if businessName provided
            let dealer = null;
            if (businessName) {
                const slug = businessName.toLowerCase().replace(/ /g, "-") + "-" + Math.floor(Math.random() * 1000);
                dealer = await tx.dealers.create({
                    data: {
                        business_name: businessName,
                        slug,
                        email,
                        phone: phone || "",
                        status: "pending",
                    }
                });
            }

            const CUSTOMER_ROLE_ID = "43498ddd-6416-4836-8590-17e4294bdd97";

            const profile = await tx.profiles.create({
                data: {
                    id: crypto.randomUUID(),
                    email,
                    full_name: name,
                    password_hash: hashedPassword,
                    role_id: CUSTOMER_ROLE_ID,
                    dealer_id: dealer?.id,
                    status: "active",
                },
                include: { roles: true }
            });

            return { profile, dealer };
        });

        // 4. Create Session
        const payload = {
            userId: result.profile.id,
            email: result.profile.email || "",
            role: (result.profile as any).roles?.name || "customer",
            dealerId: result.profile.dealer_id,
        };

        const session = await createSession(result.profile.id, payload, {
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
            userAgent: req.headers.get("user-agent") || "unknown",
        });

        const response = NextResponse.json({ success: true, user: result.profile });

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
            maxAge: 3 * 24 * 60 * 60, // 3 days
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
