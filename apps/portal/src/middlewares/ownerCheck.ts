import { prisma } from "@/lib/prisma/client";

interface OwnerContext {
    user_id: string;
    role: string;
    dealer_id?: string | null;
}

/**
 * canAccessProduct: Checks if the user is authorized to modify a product.
 * Policy: Super Admins can access all; Dealers can only access their own.
 */
export async function canAccessProduct(productId: string, ctx: OwnerContext) {
    if (ctx.role === "super_admin" || ctx.role === "showroom_admin") return true;

    if (ctx.dealer_id) {
        const product = await prisma.products.findFirst({
            where: {
                id: productId,
                dealer_id: ctx.dealer_id,
            },
        });
        return !!product;
    }

    return false;
}

/**
 * canAccessOrder: Base logic for order access.
 * Policy: Admins access all; Dealers access their own; Customers access their own.
 */
export async function canAccessOrder(orderId: string, ctx: OwnerContext) {
    if (ctx.role === "super_admin" || ctx.role.includes("admin")) return true;

    if (ctx.dealer_id) {
        const subOrder = await prisma.sub_orders.findFirst({
            where: {
                order_id: orderId,
                dealer_id: ctx.dealer_id,
            },
        });
        return !!subOrder;
    }

    const order = await prisma.orders.findFirst({
        where: {
            id: orderId,
            user_id: ctx.user_id,
        },
    });
    return !!order;
}

/**
 * getScopedFilter: Returns a Prisma 'where' clause to automatically isolate data.
 */
export function getScopedFilter(ctx: OwnerContext) {
    if (ctx.role === "super_admin" || ctx.role.includes("admin")) return {};
    if (ctx.dealer_id) {
        return {
            sub_orders: {
                some: {
                    dealer_id: ctx.dealer_id
                }
            }
        };
    }
    return { user_id: ctx.user_id };
}
