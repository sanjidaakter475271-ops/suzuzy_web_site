import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.profiles.findUnique({
            where: { email }
        });

        if (!user) {
            // Return success even if user not found for security (obscure existence)
            return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.password_resets.create({
            data: {
                user_id: user.id,
                token,
                expires_at: expiresAt,
            }
        });

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

        await sendEmail({
            to: email,
            subject: "Reset your Royal Suzuki password",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Reset Password</h2>
                    <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
                    <a href="${resetUrl}" style="padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p style="margin-top: 20px; color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        });

        return NextResponse.json({ success: true, message: "Reset link sent" });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
