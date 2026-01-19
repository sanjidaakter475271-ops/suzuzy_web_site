"use client";

import { useEffect, useState } from "react";
import {
    Bell,
    Check,
    Trash2,
    ExternalLink,
    Inbox,
    Clock,
    AlertCircle,
    Info,
    Package,
    ShoppingCart,
    CreditCard,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    link_url?: string;
    created_at: string;
}

export default function DealerNotifications() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (filter === 'unread') {
                query = query.eq('is_read', false);
            }

            const { data, error } = await query;
            if (error) throw error;
            setNotifications(data || []);
        } catch (error: any) {
            console.error("Error fetching notifications:", error);
            toast.error("Failed to load news feed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user, filter]);

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error: any) {
            toast.error("Update failed");
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success("Command log cleared");
        } catch (error: any) {
            toast.error("Operation failed");
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error: any) {
            toast.error("Purge failed");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingCart className="w-4 h-4" />;
            case 'product': return <Package className="w-4 h-4" />;
            case 'payment': return <CreditCard className="w-4 h-4" />;
            case 'alert': return <AlertCircle className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="h-full w-full min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-5xl font-display font-black italic tracking-tighter text-[#F8F8F8]">
                        SYSTEM <span className="text-[#D4AF37]">COMMS</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.4em] font-black opacity-60">
                        Operational Intel & Network Updates
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={markAllAsRead}
                        className="text-[#D4AF37] hover:bg-[#D4AF37]/10 font-bold uppercase tracking-widest text-[9px] h-11 px-6 rounded-2xl"
                    >
                        <Check className="mr-2 w-3.5 h-3.5" /> Acknowledge All
                    </Button>
                </div>
            </div>

            {/* Filter */}
            <div className="flex bg-white/5 border border-white/10 p-1 w-fit rounded-2xl">
                <Button
                    variant="ghost"
                    onClick={() => setFilter('all')}
                    className={`rounded-xl px-8 font-black uppercase tracking-widest text-[9px] h-10 ${filter === 'all' ? 'bg-[#D4AF37] text-[#0D0D0F]' : 'text-[#A1A1AA]'}`}
                >
                    Registry
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setFilter('unread')}
                    className={`rounded-xl px-8 font-black uppercase tracking-widest text-[9px] h-10 ${filter === 'unread' ? 'bg-[#D4AF37] text-[#0D0D0F]' : 'text-[#A1A1AA]'}`}
                >
                    Active Alerts
                </Button>
            </div>

            {/* Content */}
            <div className="space-y-4 max-w-4xl">
                {notifications.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-[#141417] rounded-[2.5rem] border border-white/5">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Inbox className="w-8 h-8 text-[#A1A1AA]/20" />
                        </div>
                        <p className="text-[#A1A1AA] text-xs font-black uppercase tracking-widest italic opacity-50">Signal Silence - No Active Comms</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {notifications.map((notif, index) => (
                            <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className={`group p-6 rounded-[2rem] border transition-all ${notif.is_read
                                        ? "bg-[#141417]/50 border-white/5 opacity-60"
                                        : "bg-[#1A1A1C] border-[#D4AF37]/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                                    }`}
                            >
                                <div className="flex gap-6">
                                    <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${notif.is_read
                                            ? "bg-white/5 border-white/10 text-white/20"
                                            : "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]"
                                        }`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className={`font-bold tracking-tight text-sm ${notif.is_read ? 'text-[#A1A1AA]' : 'text-[#F8F8F8]'}`}>
                                                    {notif.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="w-3 h-3 text-[#A1A1AA]/50" />
                                                    <span className="text-[10px] text-[#A1A1AA] font-mono tracking-tighter uppercase">
                                                        {new Date(notif.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {!notif.is_read && (
                                                <div className="flex h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
                                            )}
                                        </div>
                                        <p className={`text-xs leading-relaxed ${notif.is_read ? 'text-[#A1A1AA]/70' : 'text-[#A1A1AA]'}`}>
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {notif.link_url && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    className="h-8 text-[9px] font-black uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10"
                                                >
                                                    <a href={notif.link_url}>
                                                        Access Intel <ExternalLink className="ml-2 w-3 h-3" />
                                                    </a>
                                                </Button>
                                            )}
                                            {!notif.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="h-8 text-[9px] font-black uppercase tracking-widest text-green-500/70 hover:bg-green-500/10"
                                                >
                                                    Acknowledge
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteNotification(notif.id)}
                                                className="h-8 text-[9px] font-black uppercase tracking-widest text-red-500/30 hover:text-red-500 hover:bg-red-500/10"
                                            >
                                                Purge Log
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
