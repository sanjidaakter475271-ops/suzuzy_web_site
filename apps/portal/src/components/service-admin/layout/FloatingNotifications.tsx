'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Info, CheckCircle, AlertTriangle, AlertCircle, Trash2, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore, Notification } from '@/stores/service-admin/notificationStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const FloatingNotifications = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [activePop, setActivePop] = useState<Notification | null>(null);
    const { notifications, unreadCount, fetchNotifications, markAsRead, deleteNotification, isLoading } = useNotificationStore();
    const panelRef = useRef<HTMLDivElement>(null);
    const prevCountRef = useRef(unreadCount);

    // Initial fetch and set up interval for refreshes
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Fetch every minute
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Messenger Head Logic: Detect new notifications
    useEffect(() => {
        if (unreadCount > prevCountRef.current) {
            // New notification arrived
            const newOnes = notifications.filter(n => !n.is_read);
            if (newOnes.length > 0) {
                setActivePop(newOnes[0]);
                // Auto hide after 8 seconds
                const timer = setTimeout(() => {
                    setActivePop(null);
                }, 8000);
                return () => clearTimeout(timer);
            }
        }
        prevCountRef.current = unreadCount;
    }, [unreadCount, notifications]);

    const handleNotificationClick = (notification: Notification | null) => {
        if (!notification) return;

        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        if (notification.link_url) {
            router.push(notification.link_url);
            setIsOpen(false);
            setActivePop(null);
        } else {
            setIsOpen(true);
            setActivePop(null);
        }
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const getIcon = (type: string | null, size = 16) => {
        switch (type?.toLowerCase()) {
            case 'success': return <CheckCircle size={size} className="text-emerald-500" />;
            case 'warning': return <AlertTriangle size={size} className="text-amber-500" />;
            case 'error': return <AlertCircle size={size} className="text-red-500" />;
            case 'job': return <Bell size={size} className="text-white" />;
            default: return <Info size={size} className="text-blue-500" />;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
            <AnimatePresence>
                {/* Messenger Style Head Popup */}
                {activePop && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.5, rotate: -20 }}
                        animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, x: 50, scale: 0.5, transition: { duration: 0.2 } }}
                        className="flex items-center gap-3 pr-2"
                    >
                        {/* Text Bubble */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-dark-card border border-brand/20 shadow-2xl rounded-2xl p-3 max-w-[200px] relative after:content-[''] after:absolute after:top-1/2 after:-right-2 after:-translate-y-1/2 after:border-8 after:border-transparent after:border-l-white dark:after:border-l-dark-card"
                        >
                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">{activePop.title}</p>
                            <p className="text-[11px] text-ink-body dark:text-gray-300 line-clamp-2 leading-tight">{activePop.message}</p>
                        </motion.div>

                        {/* The "Head" */}
                        <div className="relative group">
                            <motion.button
                                drag
                                dragConstraints={{ left: -300, right: 0, top: -500, bottom: 0 }}
                                dragElastic={0.1}
                                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9, cursor: 'grabbing' }}
                                onClick={() => handleNotificationClick(activePop)}
                                className="w-16 h-16 rounded-full bg-brand text-white shadow-[0_0_30px_rgba(199,91,18,0.3)] flex items-center justify-center border-4 border-white dark:border-dark-page relative overflow-hidden cursor-grab active:cursor-grabbing"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                                {getIcon(activePop.type, 28)}
                                <div className="absolute inset-0 bg-brand/10 animate-pulse" />
                            </motion.button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePop(null);
                                }}
                                className="absolute -top-1 -left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-dark-page shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} strokeWidth={3} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {isOpen && (
                    <motion.div
                        ref={panelRef}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-surface-border dark:border-dark-border flex items-center justify-between bg-surface-page/50 dark:bg-dark-page/50">
                            <h3 className="font-bold text-sm text-ink-heading dark:text-white flex items-center gap-2">
                                <Bell size={16} className="text-brand" />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="bg-brand text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                                        {unreadCount}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => markAsRead()}
                                        className="text-[10px] font-bold text-brand hover:underline uppercase tracking-wider"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-surface-hover dark:hover:bg-dark-border rounded-lg text-ink-muted transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 min-h-[100px]">
                            {notifications.length === 0 ? (
                                <div className="h-40 flex flex-col items-center justify-center text-center p-6 opacity-50">
                                    <Bell size={40} className="text-slate-200 dark:text-slate-800 mb-2" strokeWidth={1} />
                                    <p className="text-xs font-medium text-ink-muted uppercase tracking-widest">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "relative p-3 rounded-xl border transition-all duration-300 flex gap-3 group cursor-pointer",
                                            notification.is_read
                                                ? "bg-transparent border-transparent grayscale-[0.5] opacity-80 hover:opacity-100 hover:bg-surface-hover dark:hover:bg-dark-border"
                                                : "bg-brand/5 border-brand/10 shadow-sm hover:border-brand/30 hover:bg-brand/10"
                                        )}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h4 className={cn(
                                                    "text-xs font-bold truncate pr-4",
                                                    notification.is_read ? "text-ink-heading dark:text-white" : "text-brand"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[10px] text-ink-muted whitespace-nowrap">
                                                    {notification.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }) : ''}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-ink-body dark:text-gray-400 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                            {notification.link_url && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-brand mt-2 uppercase tracking-wider group-hover:underline">
                                                    View Details <ExternalLink size={10} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-1 bg-white dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-md text-emerald-500 hover:bg-emerald-50 shadow-sm"
                                                    title="Mark as read"
                                                >
                                                    <Check size={12} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-1 bg-white dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-md text-red-500 hover:bg-red-50 shadow-sm"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-surface-border dark:border-dark-border bg-surface-page/50 dark:bg-dark-page/50 flex items-center justify-center">
                                <button
                                    onClick={() => deleteNotification()}
                                    className="text-[10px] font-bold text-ink-muted hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
                                >
                                    Clear All Notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative transition-all duration-300",
                    unreadCount > 0
                        ? "bg-brand text-white ring-4 ring-brand/20 animate-none"
                        : "bg-white dark:bg-dark-card text-brand border border-surface-border dark:border-dark-border"
                )}
            >
                <Bell size={24} className={unreadCount > 0 ? "animate-swing" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-dark-card shadow-lg animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </motion.button>
        </div>
    );
};

export default FloatingNotifications;
