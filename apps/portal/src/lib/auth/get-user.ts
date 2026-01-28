import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

/**
 * Get current user from session in Server Actions or API routes
 */
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) return null;

    const payload = await verifyToken(token);
    return payload;
}
