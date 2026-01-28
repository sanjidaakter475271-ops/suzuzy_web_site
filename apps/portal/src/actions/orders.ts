"use server";

import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

/**
 * getDealerOrders: Fetches sub-orders for the current dealer
 */
export async function getDealerOrders() {
    const user = await getCurrentUser();

    if (!user) throw new Error("Unauthorized");

    if (!user.dealerId && user.role !== 'super_admin' && !user.role?.includes('admin')) {
        return { success: true, data: [] };
    }

    try {
        const orders = await prisma.sub_orders.findMany({
            where: {
                ...(user.role !== 'super_admin' && !user.role?.includes('admin') ? { dealer_id: user.dealerId } : {})
            },
            include: {
                orders: {
                    select: {
                        order_number: true,
                        shipping_name: true
                    }
                },
                order_items: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return { success: true, data: orders };
    } catch (error: any) {
        console.error("Error fetching orders:", error);
        return { success: false, error: "Fulfillment synchronization failed" };
    }
}

/**
 * getOrderDetails: Fetches detailed info for a single sub-order
 */
export async function getOrderDetails(subOrderId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        const order = await prisma.sub_orders.findFirst({
            where: {
                id: subOrderId,
                ...(user.role !== 'super_admin' && !user.role?.includes('admin') ? { dealer_id: user.dealerId } : {})
            },
            include: {
                orders: true,
                order_items: {
                    include: {
                        products: true
                    }
                },
                dealers: true
            }
        });

        if (!order) return { success: false, error: "Order not found" };
        return { success: true, data: order };
    } catch (error: any) {
        return { success: false, error: "Failed to load order details" };
    }
}
