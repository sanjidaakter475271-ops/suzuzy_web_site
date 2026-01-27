"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * getPendingDealers: Fetches all dealers with 'pending' status.
 * Restricted to super_admin and showroom_admin.
 */
export async function getPendingDealers() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");
    const user = session.user as any;

    if (user.role !== 'super_admin' && user.role !== 'showroom_admin') {
        throw new Error("Insufficient privileges");
    }

    try {
        const dealers = await prisma.dealers.findMany({
            where: { status: 'pending' },
            include: {
                profiles_dealers_owner_user_idToprofiles: {
                    select: { full_name: true }
                }
            },
            orderBy: { created_at: 'asc' }
        });

        // Map relation for frontend compatibility
        const mappedDealers = dealers.map(d => ({
            ...d,
            profiles: d.profiles_dealers_owner_user_idToprofiles
        }));

        return { success: true, data: mappedDealers };
    } catch (error: any) {
        console.error("Error fetching pending dealers:", error);
        return { success: false, error: "Failed to load admission queue" };
    }
}

/**
 * updateDealerStatus: Approves or rejects a dealer application.
 */
export async function updateDealerStatus(dealerId: string, status: 'active' | 'rejected') {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");
    const user = session.user as any;

    if (user.role !== 'super_admin' && user.role !== 'showroom_admin') {
        throw new Error("Insufficient privileges");
    }

    try {
        await prisma.dealers.update({
            where: { id: dealerId },
            data: { status }
        });

        revalidatePath("/admin/dealers");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Decision commit failed" };
    }
}

/**
 * getAllOrdersAdmin: Fetches all orders for the platform admin.
 */
export async function getAllOrdersAdmin() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");
    const user = session.user as any;

    if (user.role !== 'super_admin' && !user.role?.includes('admin')) {
        throw new Error("Insufficient privileges");
    }

    try {
        const orders = await prisma.orders.findMany({
            include: {
                profiles: {
                    select: { full_name: true, email: true }
                },
                sub_orders: {
                    include: {
                        dealers: {
                            select: { business_name: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return { success: true, data: orders };
    } catch (error: any) {
        return { success: false, error: "Global order synchronization failed" };
    }
}
