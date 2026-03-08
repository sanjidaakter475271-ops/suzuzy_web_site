import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Wrench, Clock, User, Settings } from 'lucide-react';
import { RoutePath } from '../types';

export const BottomBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: RoutePath.DASHBOARD, icon: Home, label: 'Home' },
        { path: RoutePath.MY_JOBS, icon: Wrench, label: 'Jobs' },
        { path: RoutePath.ATTENDANCE, icon: Clock, label: 'Work' },
        { path: RoutePath.PROFILE, icon: User, label: 'Me' },
        { path: RoutePath.SETTINGS, icon: Settings, label: 'Set' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-4 pt-2 pointer-events-none">
            <div className="max-w-md mx-auto bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.5)] p-2 flex items-center justify-around pointer-events-auto relative overflow-visible">
                {/* Visual Glass Effect Overlay */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="relative flex flex-col items-center justify-center py-2 px-4 transition-all active:scale-90 outline-none"
                        >
                            {/* Glow Effect */}
                            {active && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500/20 blur-xl rounded-full"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            {/* Animated Active Circle */}
                            {active && (
                                <motion.div
                                    layoutId="nav-active"
                                    className="absolute inset-x-1 inset-y-0.5 bg-blue-500/10 rounded-[1.5rem] border border-blue-500/20 shadow-inner"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <div className={`relative z-10 transition-all duration-300 ${active ? 'text-blue-400 scale-110' : 'text-slate-500'}`}>
                                <item.icon
                                    size={24}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={active ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}
                                />
                            </div>

                            <motion.span
                                animate={{
                                    opacity: active ? 1 : 0,
                                    y: active ? 0 : 2,
                                    scale: active ? 1 : 0.9
                                }}
                                transition={{ duration: 0.2 }}
                                className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400 mt-1.5 relative z-10 h-0 overflow-visible whitespace-nowrap"
                            >
                                {item.label}
                            </motion.span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
