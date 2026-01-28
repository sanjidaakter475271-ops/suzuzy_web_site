import { prisma } from "@/lib/prisma/client";
import { generateAccessToken, generateRefreshToken, TokenPayload } from "./jwt";
import { v4 as uuidv4 } from "uuid";

interface DeviceInfo {
    deviceId?: string;
    deviceName?: string;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Create a new session and return tokens
 */
export async function createSession(
    userId: string,
    payload: TokenPayload,
    device: DeviceInfo,
    rememberMe: boolean = false
) {
    const sessionId = uuidv4();
    const familyId = uuidv4();
    const refreshToken = await generateRefreshToken(payload, rememberMe);

    // Hash the token for DB storage
    // Note: We could use a simpler hash like SHA256 since refresh tokens are already random JWTs
    const tokenHash = refreshToken; // For now, we'll store the full token or a subset

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 3));

    return await prisma.$transaction(async (tx) => {
        // 1. Create the session
        const session = await tx.user_sessions.create({
            data: {
                id: sessionId,
                user_id: userId,
                token: uuidv4(), // Legacy field compatibility
                refresh_token: refreshToken,
                device_id: device.deviceId,
                device_name: device.deviceName,
                ip_address: device.ipAddress,
                user_agent: device.userAgent,
                expires_at: expiresAt,
                is_active: true,
                login_method: "password",
            }
        });

        // 2. Create the refresh token record
        await (tx as any).refresh_tokens_public.create({
            data: {
                user_id: userId,
                token_hash: tokenHash,
                session_id: sessionId,
                family_id: familyId,
                expires_at: expiresAt,
            }
        });

        const accessToken = await generateAccessToken(payload);

        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes
        };
    });
}

/**
 * Rotate refresh tokens
 */
export async function refreshTokens(oldRefreshToken: string) {
    // 1. Find the refresh token in DB
    const rtRecord = await (prisma as any).refresh_tokens_public.findUnique({
        where: { token_hash: oldRefreshToken },
        include: { user_sessions: true }
    });

    if (!rtRecord || rtRecord.is_revoked || rtRecord.expires_at < new Date()) {
        // Potential reuse attack! Revoke all tokens in family if reuse detected
        if (rtRecord?.is_revoked) {
            await (prisma as any).refresh_tokens_public.updateMany({
                where: { family_id: rtRecord.family_id },
                data: { is_revoked: true, revoked_reason: "Reuse detected" }
            });
        }
        throw new Error("Invalid or expired refresh token");
    }

    // 2. Revoke old token
    await (prisma as any).refresh_tokens_public.update({
        where: { id: rtRecord.id },
        data: { is_revoked: true, revoked_at: new Date(), revoked_reason: "Rotated" }
    });

    // 3. Generate new tokens
    const user = await prisma.profiles.findUnique({
        where: { id: rtRecord.user_id },
        include: { roles: true }
    });

    if (!user) throw new Error("User not found");

    const payload: TokenPayload = {
        userId: user.id,
        email: user.email || "",
        role: user.roles?.name || "customer",
        dealerId: user.dealer_id,
    };

    const newRefreshToken = await generateRefreshToken(payload);
    const newAccessToken = await generateAccessToken(payload);

    // 4. Create new refresh token record in same family
    await (prisma as any).refresh_tokens_public.create({
        data: {
            user_id: user.id,
            token_hash: newRefreshToken,
            session_id: rtRecord.session_id,
            family_id: rtRecord.family_id,
            expires_at: rtRecord.expires_at, // Keep original expiry
        }
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900
    };
}

/**
 * Revoke a session
 */
export async function revokeSession(sessionId: string) {
    await prisma.user_sessions.update({
        where: { id: sessionId },
        data: { is_active: false }
    });

    await (prisma as any).refresh_tokens_public.updateMany({
        where: { session_id: sessionId },
        data: { is_revoked: true, revoked_at: new Date(), revoked_reason: "Logout" }
    });
}
