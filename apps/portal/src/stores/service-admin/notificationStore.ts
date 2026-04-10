import { create } from 'zustand';

export interface Notification {
    id: string;
    user_id: string | null;
    title: string;
    message: string;
    type: string | null;
    is_read: boolean | null;
    link_url: string | null;
    created_at: string | null;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    fetchNotifications: () => Promise<void>;
    markAsRead: (id?: string) => Promise<void>;
    deleteNotification: (id?: string) => Promise<void>;
    addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/v1/workshop/notifications');
            const data = await res.json();
            if (data.success) {
                const notifications = data.data;
                const unreadCount = notifications.filter((n: Notification) => !n.is_read).length;
                set({ notifications, unreadCount, isLoading: false });
            } else {
                set({ error: data.error, isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            const res = await fetch('/api/v1/workshop/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                if (id) {
                    const notifications = get().notifications.map(n =>
                        n.id === id ? { ...n, is_read: true } : n
                    );
                    const unreadCount = notifications.filter(n => !n.is_read).length;
                    set({ notifications, unreadCount });
                } else {
                    const notifications = get().notifications.map(n => ({ ...n, is_read: true }));
                    set({ notifications, unreadCount: 0 });
                }
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },

    deleteNotification: async (id) => {
        try {
            const res = await fetch('/api/v1/workshop/notifications', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                if (id) {
                    const notifications = get().notifications.filter(n => n.id !== id);
                    const unreadCount = notifications.filter(n => !n.is_read).length;
                    set({ notifications, unreadCount });
                } else {
                    set({ notifications: [], unreadCount: 0 });
                }
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    },

    addNotification: (notification) => {
        const notifications = [notification, ...get().notifications].slice(0, 50);
        const unreadCount = notifications.filter(n => !n.is_read).length;
        set({ notifications, unreadCount });
    }
}));
