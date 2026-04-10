'use client';

import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import { useNotificationStore, Notification } from '@/stores/service-admin/notificationStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

/**
 * useNotificationSync: Listens for Socket.io events and refreshes notifications
 */
export function useNotificationSync() {
    const { fetchNotifications, addNotification } = useNotificationStore();
    const { user } = useAuth();

    useEffect(() => {
        // useAuth returns user.id, but JWT payload sometimes has userId. We'll check both.
        const currentUserId = user?.id || (user as any)?.userId;
        if (!currentUserId) return;

        if (!socket.connected) {
            socket.connect();
        }

        // Join personal user room
        socket.emit('join:user', currentUserId);

        const handleNewNotification = (data: any) => {
            console.log("[NOTIFICATION_SYNC] New notification received:", data);

            // If the notification is for this user
            if (data.user_id === currentUserId || !data.user_id) {
                if (data.notification && data.notification.id) {
                    addNotification(data.notification);
                    toast(data.notification.title, {
                        description: data.notification.message,
                    });
                } else {
                    // Fallback to full fetch if payload is partial
                    fetchNotifications();
                }
            }
        };

        socket.on('notification:new', handleNewNotification);

        // Also refresh on generic workshop events that might generate notifications
        const handleGenericRefresh = () => {
            fetchNotifications();
        };

        socket.on('job_cards:changed', handleGenericRefresh);
        socket.on('requisition:created', handleGenericRefresh);

        return () => {
            socket.off('notification:new', handleNewNotification);
            socket.off('job_cards:changed', handleGenericRefresh);
            socket.off('requisition:created', handleGenericRefresh);
        };
    }, [user, fetchNotifications, addNotification]);
}
