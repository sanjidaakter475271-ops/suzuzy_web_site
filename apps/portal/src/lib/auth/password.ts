import argon2 from "argon2";

/**
 * Hash a plain text password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64MB
        timeCost: 3,
        parallelism: 1,
    });
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    // Check if it's a legacy Better Auth hash (contains colon)
    if (hash.includes(":")) {
        // We'll need to implement legacy verification here if we want to avoid password resets
        // For now, let's just log it and return false (forcing a reset or handled separately)
        console.warn("Legacy Better Auth hash detected. Manual verification or reset required.");
        return false;
    }

    try {
        return await argon2.verify(hash, password);
    } catch (error) {
        console.error("Error verifying password:", error);
        return false;
    }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
        return { valid: false, message: "Password must be at least 8 characters long" };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: "Password must contain at least one number" };
    }
    return { valid: true };
}
