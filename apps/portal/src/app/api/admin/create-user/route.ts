import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route for Super Admins to create new personnel/users.
 * This route standardizes on Better Auth for identity management,
 * while maintaining the profile record in the public schema.
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Verify caller session
        const session = await auth.api.getSession({
            headers: req.headers
        });

        // 2. Authorization Check: Only Super Admin can authorize new personnel
        const userRole = (session?.user as any)?.role;
        if (!session?.user || userRole !== "super_admin") {
            return NextResponse.json(
                { error: "Unauthorized: Super Admin clearance required" },
                { status: 401 }
            );
        }

        // 3. Extract and Validate Parameters
        const body = await req.json();
        const { email, full_name, role, role_id, phone } = body;

        if (!email || !full_name || !role) {
            return NextResponse.json(
                { error: "Missing required personnel parameters" },
                { status: 400 }
            );
        }

        // Generate a temporary secure password
        const tempPassword = `RC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // 4. Create User in Better Auth System
        // This will create the record in the 'user' table via Prisma adapter
        const newUser = await auth.api.signUpEmail({
            body: {
                email,
                password: tempPassword,
                name: full_name,
            }
        });

        if (!newUser || !newUser.user) {
            throw new Error("Failed to initialize authentication record");
        }

        const userId = newUser.user.id;

        // 5. Synchronize with Profiles & Better Auth additional fields
        await prisma.$transaction(async (tx) => {
            // A. Create/Update Profile in public.profiles
            await tx.profiles.upsert({
                where: { id: userId },
                create: {
                    id: userId,
                    email: email,
                    full_name: full_name,
                    phone: phone || null,
                    role: role,
                    role_id: role_id,
                    status: "active",
                    temp_password: tempPassword // Store encrypted or temp for first login
                },
                update: {
                    full_name: full_name,
                    phone: phone || null,
                    role: role,
                    role_id: role_id,
                    status: "active",
                }
            });

            // B. Update Better Auth 'user' table with role metadata 
            // (Used by Better Auth for session population)
            await (tx as any).user.update({
                where: { id: userId },
                data: {
                    role: role,
                    roleId: role_id
                }
            });
        });

        return NextResponse.json({
            success: true,
            message: "Personnel authorized and initialized",
            userId,
            tempPassword // In production, this should be emailed securely
        });

    } catch (error: any) {
        console.error("Critical Protocol Failure during User Creation:", error);

        // Handle common Better Auth errors (e.g. email already exists)
        if (error.message?.includes("already exists")) {
            return NextResponse.json({ error: "Email already registered in system" }, { status: 409 });
        }

        return NextResponse.json({
            error: error.message || "Internal System Protocol Error"
        }, { status: 500 });
    }
}
