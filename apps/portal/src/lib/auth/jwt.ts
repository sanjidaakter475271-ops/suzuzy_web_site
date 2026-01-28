import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-at-least-32-chars-long-!!!123"
);

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    dealerId?: string | null;
    [key: string]: any;
}

/**
 * Generate an Access Token (valid for 15 minutes)
 */
export async function generateAccessToken(payload: TokenPayload): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(JWT_SECRET);
}

/**
 * Generate a Refresh Token (valid for 3 days or 30 days)
 */
export async function generateRefreshToken(payload: TokenPayload, rememberMe: boolean = false): Promise<string> {
    const expiresAt = rememberMe ? "30d" : "3d";
    return await new SignJWT({ ...payload, type: "refresh" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresAt)
        .sign(JWT_SECRET);
}

/**
 * General purpose Sign JWT
 */
export async function signJWT(payload: any, expiresIn: string | number): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(JWT_SECRET);
}

/**
 * Verify a token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as TokenPayload;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

/**
 * Alias for verifyToken for consistency
 */
export const verifyJWT = verifyToken;
