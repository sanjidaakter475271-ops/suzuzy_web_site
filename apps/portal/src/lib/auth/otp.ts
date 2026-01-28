import { prisma } from "@/lib/prisma/client";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

/**
 * Generate a 6-digit random OTP
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to email
 */
export async function sendOTP(userId: string | null, email: string, purpose: string = "login") {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB
    await prisma.otp_verifications.create({
        data: {
            user_id: userId,
            phone_or_email: email,
            otp_code: otp,
            purpose,
            expires_at: expiresAt,
            is_used: false,
        }
    });

    // Send via email
    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Your OTP Code</h2>
            <p>Your verification code for Royal Suzuki is:</p>
            <div style="font-size: 32px; font-weight: bold; padding: 10px; background: #f4f4f4; border-radius: 5px; text-align: center; color: #000;">
                ${otp}
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">This code will expire in 10 minutes.</p>
        </div>
    `;

    return await sendEmail({
        to: email,
        subject: `Verification Code: ${otp}`,
        html,
    });
}

/**
 * Verify OTP
 */
export async function verifyOTP(email: string, code: string, purpose: string = "login") {
    const record = await prisma.otp_verifications.findFirst({
        where: {
            phone_or_email: email,
            otp_code: code,
            purpose,
            is_used: false,
            expires_at: {
                gt: new Date()
            }
        }
    });

    if (!record) {
        return { valid: false, message: "Invalid or expired OTP" };
    }

    // Mark as used
    await prisma.otp_verifications.update({
        where: { id: record.id },
        data: { is_used: true }
    });

    return { valid: true };
}
