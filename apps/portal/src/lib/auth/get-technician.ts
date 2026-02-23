import { headers, cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma/client";

/**
 * Get current technician from Authorization header or cookies
 */
export async function getCurrentTechnician() {
    // 1. Check Authorization Header (Bearer token)
    const headersList = await headers();
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

    // Verify user exists and is active
    const user = await prisma.profiles.findUnique({
        where: { id: payload.userId },
        include: {
            service_staff: true, // Include service staff profile
        }
    });

    if (!user || (user.status !== 'approved' && user.status !== 'active' && user.status !== 'pending')) return null;

    // Check if user is a technician or admin
    // Adjust roles based on your actual roles
    const allowedRoles = ['technician', 'service_stuff', 'service_technician', 'service_admin', 'super_admin'];

    // Simple role check
    if (!allowedRoles.includes(payload.role)) {
        console.warn(`[AUTH] User ${user.id} has role '${payload.role}', but expected one of: ${allowedRoles.join(', ')}`);
        return null;
    }

    const staffMember = user.service_staff?.[0];
    if (!staffMember) {
        console.warn(`[AUTH] User ${user.id} has role '${payload.role}' but no service_staff record found.`);
    }

    return {
        userId: user.id,
        email: user.email,
        name: user.full_name,
        role: payload.role,
        serviceStaffId: staffMember?.id, // Important for linking to jobs
        dealerId: user.dealer_id,
        user
    };
}
