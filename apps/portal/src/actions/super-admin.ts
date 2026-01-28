"use server";

import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { getRoleLevel } from "@/middlewares/checkRole";

// Extended session user type
interface SessionUser {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    roleId?: string;
    dealerId?: string;
}

/**
 * getSuperAdminStats: Aggregates global platform statistics.
 */
export async function getSuperAdminStats() {
    const user = await getCurrentUser();

    if (!user) throw new Error("Unauthorized");
    const userRole = user.role || "customer";
    if (getRoleLevel(userRole) > 7) {
        return { success: false, error: "Insufficient privileges" };
    }

    try {
        const [
            revenueResult,
            activeDealers,
            pendingApprovals,
            totalProducts
        ] = await Promise.all([
            prisma.orders.aggregate({
                _sum: { grand_total: true },
                where: { payment_status: 'paid' }
            }),
            prisma.dealers.count({
                where: { status: 'active' }
            }),
            prisma.dealers.count({
                where: { status: 'pending' }
            }),
            prisma.products.count()
        ]);

        return {
            success: true,
            data: {
                totalRevenue: Number(revenueResult._sum.grand_total || 0),
                activeDealers,
                pendingApprovals,
                totalProducts
            }
        };
    } catch (error) {
        console.error("Super Admin stats error:", error);
        return { success: false, error: "Failed to aggregate platform stats" };
    }
}

/**
 * getUsers: Fetches all user profiles for the management terminal.
 */
export async function getUsers() {
    const user = await getCurrentUser();

    if (!user || user?.role !== 'super_admin') {
        throw new Error("Unauthorized access to user registry");
    }

    try {
        const users = await prisma.profiles.findMany({
            orderBy: { created_at: 'desc' }
        });
        return { success: true, data: JSON.parse(JSON.stringify(users)) };
    } catch (error) {
        return { success: false, error: "Registry synchronization failed" };
    }
}

/**
 * updateUserStatusAction: Updates a user's status (active/suspended).
 */
export async function updateUserStatusAction(userId: string, status: string) {
    const user = await getCurrentUser();

    if (!user || user?.role !== 'super_admin') {
        throw new Error("Unauthorized status modification");
    }

    try {
        await prisma.profiles.update({
            where: { id: userId },
            data: { status }
        });
        revalidatePath("/super-admin/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Status transition failed" };
    }
}

/**
 * resetUserPasswordAction: Forces a password reset for a user.
 */
export async function resetUserPasswordAction(userId: string) {
    const user = await getCurrentUser();

    if (!user || user?.role !== 'super_admin') {
        throw new Error("Unauthorized security modification");
    }

    try {
        const newTempPassword = `RC-RESET-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Better Auth password change removed as we are using custom auth
        // In the new system, this should likely hash and store in a custom table if needed,
        // but for now we just update the profile's temp_password.

        // Synchronize with Profile
        await prisma.profiles.update({
            where: { id: userId },
            data: {
                temp_password: newTempPassword,
                onboarding_completed: false
            }
        });

        revalidatePath("/super-admin/users");
        return { success: true, newPassword: newTempPassword };
    } catch (error: unknown) {
        console.error("Security reset protocol failure:", error);
        const message = error instanceof Error ? error.message : "Security reset failed";
        return { success: false, error: message };
    }
}

/**
 * deleteUserAction: Permanently removes a user from the platform.
 */
export async function deleteUserAction(userId: string) {
    const user = await getCurrentUser();

    if (!user || user?.role !== 'super_admin') {
        throw new Error("Unauthorized account eradication");
    }

    try {
        // Delete from profiles (Better Auth user table is being removed)
        await prisma.profiles.delete({ where: { id: userId } });

        revalidatePath("/super-admin/users");
        return { success: true };
    } catch (error) {
        console.error("User eradication failed:", error);
        return { success: false, error: "Account eradication failed" };
    }
}

/**
 * updateUserRoleAction: Atomic role synchronization across system layers.
 */
export async function updateUserRoleAction(userId: string, newRole: string) {
    const user = await getCurrentUser();

    if (!user || user?.role !== 'super_admin') {
        throw new Error("Unauthorized role modification");
    }

    try {
        await prisma.profiles.update({
            where: { id: userId },
            data: { role: newRole }
        });

        revalidatePath("/super-admin/users");
        return { success: true };
    } catch (error) {
        console.error("Role synchronization failure:", error);
        return { success: false, error: "Critical authorization sync failure" };
    }
}
