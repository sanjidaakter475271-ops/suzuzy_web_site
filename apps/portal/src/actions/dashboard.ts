"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { headers } from "next/headers";

/**
 * getDealerDashboardData: Aggregates stats for the dealer dashboard
 */
export async function getDealerDashboardData() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) throw new Error("Unauthorized");
    const user = session.user as any;
    const dealerId = user.dealerId;

    if (!dealerId && user.role !== 'super_admin' && !user.role?.includes('admin')) {
        return { success: true, data: null };
    }

    // Role-based filtering
    const filter = (dealerId && user.role !== 'super_admin' && !user.role?.includes('admin'))
        ? { dealer_id: dealerId }
        : {};

    try {
        const [
            deliveredOrders,
            activeCount,
            prodCount,
            lowStockProducts,
            topProducts,
            recentOrders
        ] = await Promise.all([
            // 1. Delivered revenue
            prisma.sub_orders.findMany({
                where: { ...filter, status: 'delivered' },
                select: { dealer_amount: true, created_at: true }
            }),
            // 2. Active orders count
            prisma.sub_orders.count({
                where: { ...filter, status: { in: ['pending', 'processing'] } }
            }),
            // 3. Total products count
            prisma.products.count({
                where: filter
            }),
            // 4. Low stock products
            prisma.products.findMany({
                where: { ...filter, stock_quantity: { lt: 5 } },
                select: { id: true }
            }),
            // 5. Top products
            prisma.products.findMany({
                where: filter,
                select: { name: true, total_sold: true },
                orderBy: { total_sold: 'desc' },
                take: 5
            }),
            // 6. Recent orders
            prisma.sub_orders.findMany({
                where: filter,
                include: {
                    orders: {
                        select: { order_number: true, shipping_name: true }
                    }
                },
                orderBy: { created_at: 'desc' },
                take: 5
            })
        ]);

        return {
            success: true,
            data: {
                deliveredOrders,
                activeCount,
                prodCount,
                lowStockCount: lowStockProducts.length,
                topProducts: topProducts.map(p => ({ name: p.name, value: p.total_sold || 0 })),
                recentOrders
            }
        };
    } catch (error: any) {
        console.error("Dashboard data aggregation error:", error);
        return { success: false, error: "System failed to aggregate fleet intelligence" };
    }
}
