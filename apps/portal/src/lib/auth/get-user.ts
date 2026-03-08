import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { prisma } from "@/lib/prisma/client";
import { requiresDealerId } from "./roles";

/**
 * Get current user from session in Server Actions or API routes
 * Returns JWT payload enriched with dealerId from profiles table
 */
export async function getCurrentUser() {
    // 1. Check Authorization Header (Bearer token)
    const { headers: nextHeaders } = await import("next/headers");
    const headersList = await nextHeaders();
    const authHeader = headersList.get("authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    // 2. Fallback to Cookie
    if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get("access_token")?.value ?? null;
    }

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return null;

    // Fetch dealerId from profiles table (JWT payload may not have it)
    const profile = await prisma.profiles.findUnique({
        where: { id: payload.userId },
        select: { dealer_id: true, full_name: true }
    });

    const dealerId = profile?.dealer_id || payload.dealerId || null;

    // Enforce dealer_id for dealer-scoped roles
    if (requiresDealerId(payload.role) && !dealerId) {
        console.error(`[AUTH] User ${payload.userId} has role ${payload.role} but no dealer_id`);
        return null; // Block access
    }

    return {
        ...payload,
        dealerId,
        fullName: profile?.full_name || null,
        isDealerScoped: requiresDealerId(payload.role),
    };
}
