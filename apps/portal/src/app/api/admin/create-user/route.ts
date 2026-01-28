import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, full_name, role_id, business_unit_id, phone } = body;

        console.log("Creating user with data:", { email, full_name, role_id, business_unit_id });

        if (!email || !full_name || !role_id) {
            return NextResponse.json({ error: "Missing required fields (email, name, or role)" }, { status: 400 });
        }

        // 1. Check if user already exists
        const existingUser = await prisma.profiles.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
        }

        // 2. Hash a default password
        // In a real app, you'd send an invite email with a reset link
        const defaultPassword = "Password123!";
        const hashedPassword = await hashPassword(defaultPassword);

        // 3. Create user profile and business unit mapping in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the profile
            const profile = await tx.profiles.create({
                data: {
                    id: crypto.randomUUID(),
                    email,
                    full_name,
                    phone: phone || "",
                    password_hash: hashedPassword,
                    role_id,
                    status: "active",
                    onboarding_completed: false,
                    temp_password: defaultPassword // Store temporarily for the admin to share
                }
            });

            // If business unit is provided, create the mapping
            if (business_unit_id) {
                await (tx as any).business_unit_users.create({
                    data: {
                        business_unit_id,
                        user_id: profile.id,
                        is_primary: true
                    }
                });
            }

            return profile;
        });

        return NextResponse.json({
            success: true,
            message: "Personnel authorized successfully",
            user: {
                id: result.id,
                email: result.email,
                full_name: result.full_name,
                temp_password: defaultPassword
            }
        });
    } catch (error: any) {
        console.error("Create user API error:", error);
        return NextResponse.json({ error: error.message || "Internal server error during user creation" }, { status: 500 });
    }
}
