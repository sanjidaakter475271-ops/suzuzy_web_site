import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { prisma } from "@/lib/prisma/client";

/**
 * Get current user from session in Server Actions or API routes
 * Returns JWT payload enriched with dealerId from profiles table
 */
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return null;

    // Fetch dealerId from profiles table (JWT payload may not have it)
    const profile = await prisma.profiles.findUnique({
        where: { id: payload.userId },
        select: { dealer_id: true, full_name: true }
    });

    return {
        ...payload,
        dealerId: profile?.dealer_id || payload.dealerId || null,
        fullName: profile?.full_name || null
    };
}
