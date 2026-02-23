import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";
import crypto from "crypto";
import { hashPassword } from "@/lib/auth/password";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const users = await prisma.profiles.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json(users);
    } catch (error: any) {
        console.error("User List Fetch Error:", error);
        return NextResponse.json({ error: "Failed to retrieve personnel registry" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await req.json();
        const { email, full_name, phone, role_id, business_unit_id, role } = body;

        // Generate random temporary password
        const generatedPassword = crypto.randomBytes(6).toString('hex'); // 12 characters
        const hashedPassword = await hashPassword(generatedPassword);

        // Normalization: Ensure empty strings or whitespace are converted to null
        // This is critical for unique constraints in Postgres
        const normalizedEmail = email?.trim()?.toLowerCase() || null;
        const normalizedPhone = phone?.trim() || null;

        // Before creating, check if email or phone already exists
        if (normalizedEmail || normalizedPhone) {
            const existingUser = await prisma.profiles.findFirst({
                where: {
                    OR: [
                        normalizedEmail ? { email: { equals: normalizedEmail, mode: 'insensitive' } } : undefined,
                        normalizedPhone ? { phone: normalizedPhone } : undefined
                    ].filter(Boolean) as any
                }
            });

            if (existingUser) {
                const field = existingUser.email === normalizedEmail ? 'email' : 'phone';
                return NextResponse.json(
                    { error: `A user with this ${field} already exists` },
                    { status: 409 }
                );
            }
        }

        // Create profile and link to business unit in a transaction
        const newUser = await prisma.$transaction(async (tx) => {
            const profile = await tx.profiles.create({
                data: {
                    id: crypto.randomUUID(), // Required by schema (no default)
                    email: normalizedEmail,
                    full_name,
                    phone: normalizedPhone,
                    role: role || body.role || 'dealer_staff',
                    role_id: role_id || null,
                    status: 'pending',
                    password_hash: hashedPassword,
                    temp_password: generatedPassword,
                    password_changed_at: null // Explicitly null to enforce change
                }
            });

            if (business_unit_id) {
                await tx.business_unit_users.create({
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
            ...newUser,
            generatedPassword // Send to admin to share with user
        });
    } catch (error: any) {
        console.error("User Creation Error:", error);

        // Handle specific Prisma errors for better client feedback
        if (error.code === 'P2002') {
            const targets = error.meta?.target || [];
            return NextResponse.json(
                { error: `Database Constraint Error: Unique values required for ${targets.join(', ')}` },
                { status: 409 }
            );
        }

        return NextResponse.json({
            error: "Personnel Registry Failure",
            details: error.message
        }, { status: 500 });
    }
}
