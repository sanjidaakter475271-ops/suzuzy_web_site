import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { verifyPassword, hashPassword, validatePasswordStrength } from "@/lib/auth/password";

export async function POST(req: NextRequest) {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Get user with password hash
    const user = await prisma.profiles.findUnique({
        where: { id: userPayload.userId }
    });

    if (!user || !(user as any).password_hash) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Verify current
    const isValid = await verifyPassword(currentPassword, (user as any).password_hash);
    if (!isValid) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
    }

    // 3. Validate new
    const pwdVal = validatePasswordStrength(newPassword);
    if (!pwdVal.valid) {
        return NextResponse.json({ error: pwdVal.message }, { status: 400 });
    }

    // 4. Update
    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
        prisma.profiles.update({
            where: { id: user.id },
            data: {
                password_hash: hashedPassword,
                password_changed_at: new Date(),
            } as any
        }),
        // Optional: Logout other devices on password change - DISABLED to allow seamless redirect
        // prisma.user_sessions.updateMany({
        //     where: {
        //         user_id: user.id,
        //         is_active: true,
        //     } as any,
        //     data: { is_active: false } as any
        // })
    ]);

    return NextResponse.json({ success: true, message: "Password changed successfully. Please login again." });
}
