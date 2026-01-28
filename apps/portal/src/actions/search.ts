"use server";

import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { getRoleLevel } from "@/middlewares/checkRole";

/**
 * searchProtocol: Unified search action for Command Menu.
 * Scopes results based on user role (Admin vs Dealer).
 */
export async function searchProtocol(query: string) {
    if (!query || query.trim().length < 2) return { success: true, data: [] };

    const user = await getCurrentUser();

    if (!user) return { success: true, data: [] };
    const roleLevel = getRoleLevel(user.role);
    const dealerId = user.dealerId;

    const isAdmin = roleLevel <= 7;
    const isDealer = roleLevel >= 10 && roleLevel <= 15;

    // Parallel search execution
    try {
        const results = [];

        // 1. Orders Search
        if (isAdmin) {
            const orders = await prisma.orders.findMany({
                where: {
                    OR: [
                        { order_number: { contains: query, mode: 'insensitive' } },
                        { shipping_name: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 3,
                select: { id: true, order_number: true, shipping_name: true }
            });
            results.push(...orders.map(o => ({
                id: o.id,
                type: 'order',
                title: `Order #${o.order_number}`,
                subtitle: o.shipping_name,
                url: `/admin/orders/${o.id}`
            })));
        } else if (isDealer && dealerId) {
            // Search sub_orders for dealers
            const subOrders = await prisma.sub_orders.findMany({
                where: {
                    dealer_id: dealerId,
                    orders: {
                        OR: [
                            { order_number: { contains: query, mode: 'insensitive' } },
                            { shipping_name: { contains: query, mode: 'insensitive' } }
                        ]
                    }
                },
                take: 3,
                include: {
                    orders: { select: { order_number: true, shipping_name: true } }
                }
            });
            results.push(...subOrders.map(so => ({
                id: so.id,
                type: 'order',
                title: `Order #${so.orders?.order_number}`,
                subtitle: so.orders?.shipping_name || 'Unknown',
                url: `/dealer/orders/${so.id}`
            })));
        }

        // 2. Products Search
        const productFilter: any = {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { sku: { contains: query, mode: 'insensitive' } }
            ]
        };

        if (isDealer && dealerId) {
            productFilter.dealer_id = dealerId;
        }

        const products = await prisma.products.findMany({
            where: productFilter,
            take: 3,
            select: { id: true, name: true, sku: true }
        });

        results.push(...products.map(p => ({
            id: p.id,
            type: 'product',
            title: p.name,
            subtitle: p.sku,
            url: isAdmin ? `/admin/catalog` : `/dealer/products/${p.id}`
        })));

        // 3. Dealers Search (Admin Only)
        if (isAdmin) {
            const dealers = await prisma.dealers.findMany({
                where: {
                    OR: [
                        { business_name: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 3,
                select: { id: true, business_name: true, email: true }
            });
            results.push(...dealers.map(d => ({
                id: d.id,
                type: 'dealer',
                title: d.business_name,
                subtitle: d.email,
                url: `/admin/dealers/${d.id}` // Placeholder or real route
            })));
        }

        return { success: true, data: results };

    } catch (error) {
        console.error("Search protocol failed:", error);
        return { success: false, data: [] };
    }
}
