import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        const pwdVal = validatePasswordStrength(password);
        if (!pwdVal.valid) {
            return NextResponse.json({ error: pwdVal.message }, { status: 400 });
        }

        // 1. Verify token
        const resetRecord = await prisma.password_resets.findUnique({
            where: { token },
            include: { profiles: true }
        });

        if (!resetRecord || resetRecord.expires_at < new Date()) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // 2. Hash and Update
        const hashedPassword = await hashPassword(password);

        await prisma.$transaction([
            prisma.profiles.update({
                where: { id: resetRecord.user_id! },
                data: {
                    password_hash: hashedPassword,
                    password_changed_at: new Date(),
                    failed_login_attempts: 0,
                    locked_until: null,
                }
            }),
            prisma.password_resets.delete({
                where: { id: resetRecord.id }
            })
        ]);

        return NextResponse.json({ success: true, message: "Password reset successful" });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
