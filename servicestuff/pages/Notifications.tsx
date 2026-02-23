import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import {
    Bell,
    BellOff,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketService } from '../services/socket';
import { useAuth } from '../lib/auth';
import { Notification } from '../types';

export const Notifications: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Mock initial data
    useEffect(() => {
        setNotifications([
            { id: '1', title: 'New Job Assigned', message: 'Job card #TC-9901 (Suzuki Gixxer) has been assigned to you.', type: 'info', timestamp: new Date(Date.now() - 1000 * 60 * 30), read: false, created_at: new Date().toISOString() },
            { id: '2', title: 'Parts Ready', message: 'Brake pads for Job #TC-8890 are now available at the counter.', type: 'success', timestamp: new Date(Date.now() - 1000 * 60 * 120), read: true, created_at: new Date().toISOString() },
            { id: '3', title: 'QC Failed', message: 'Job #TC-8850 requires rework on engine tuning.', type: 'error', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), read: false, created_at: new Date().toISOString() },
            { id: '4', title: 'Shift Reminder', message: 'Your morning shift starts in 30 minutes. Don\'t forget to clock in.', type: 'warning', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true, created_at: new Date().toISOString() },
        ]);

        // Connect socket for real-time notifications
        const socket = SocketService.getInstance();
        if (user?.id) {
            socket.connect(user.id);
            socket.on('notification:new', (data: Notification) => {
                setNotifications(prev => [data, ...prev]);
            });
        }

        return () => {
            // Optional: socket.off('notification:new') if wanted
        };
    }, [user?.id]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'success': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'error': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'warning': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={18} />;
            case 'error': return <AlertTriangle size={18} />;
            case 'warning': return <AlertTriangle size={18} />;
            default: return <Bell size={18} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar onMenuClick={onMenuClick} title="Notifications" />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Recent Updates
                    </h3>
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 px-2 py-1 rounded-full transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <motion.div
                                    key={n.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => markAsRead(n.id)}
                                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer group hover:bg-slate-900/60 ${n.read
                                        ? 'bg-slate-900/40 border-slate-800/50'
                                        : 'bg-slate-900 border-blue-500/30 shadow-lg shadow-blue-900/10'
                                        }`}
                                >
                                    {!n.read && (
                                        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    )}

                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getTypeStyles(n.type)}`}>
                                            {getTypeIcon(n.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-sm font-bold truncate ${n.read ? 'text-slate-300' : 'text-white'}`}>
                                                    {n.title}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <Clock size={10} className="text-slate-600" />
                                                <span className="text-[10px] font-bold text-slate-600 uppercase">
                                                    {n.timestamp ? n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Reveal on Hover/Swipe simulation */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                        className="absolute right-4 bottom-4 p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-700">
                                <BellOff size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest opacity-20">No Notifications</p>
                                <p className="text-xs mt-1">You're all caught up!</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Notification Settings Prompt */}
                <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-3xl mt-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white">
                            <Bell size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Push Notifications</p>
                            <p className="text-xs text-blue-200/60 font-medium">Get live job alerts even when the app is closed.</p>
                        </div>
                    </div>
                    <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors">
                        Enable Device Alerts
                    </button>
                </div>
            </div>
        </div>
    );
};
