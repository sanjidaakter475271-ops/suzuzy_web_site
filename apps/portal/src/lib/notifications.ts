import { prisma } from "@/lib/prisma/client";
import { broadcast } from "@/lib/socket-server";

export async function createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'job';
    linkUrl?: string;
}, tx?: any) {
    try {
        const db = tx || prisma;
        const notification = await db.notifications.create({
            data: {
                user_id: params.userId,
                title: params.title,
                message: params.message,
                type: params.type || 'info',
                link_url: params.linkUrl,
                is_read: false
            }
        });

        // Only broadcast if not in transaction or after transaction success?
        // Usually safer to broadcast outside.
        if (!tx) {
            await broadcast('notification:new', {
                user_id: params.userId,
                notification
            });
        }

        return notification;
    } catch (error) {
        console.error("[NOTIFICATION_CREATE_ERROR]", error);
        return null;
    }
}

