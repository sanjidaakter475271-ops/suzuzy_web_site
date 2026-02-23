import React, { useState, useEffect } from 'react';
import { TechnicianAPI } from '../services/api';
import { User, DashboardStats } from '../types';
import { TopBar } from '../components/TopBar';
import {
    User as UserIcon,
    Settings,
    LogOut,
    Award,
    TrendingUp,
    Clock,
    ChevronRight,
    Star,
    Target,
    Shield
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';

export const Profile: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { user, signOut } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await TechnicianAPI.getDashboardStats();
                setStats(res.data.stats);
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = async () => {
        await signOut();
        navigate(RoutePath.LOGIN);
    };

    const stats_cards = [
        { label: 'Efficiency', value: `${stats?.efficiency_score || 0}%`, icon: <TrendingUp size={18} className="text-emerald-500" />, sub: 'Top 10%' },
        { label: 'Avg Rating', value: '4.8', icon: <Star size={18} className="text-amber-500" />, sub: '24 reviews' },
        { label: 'Hours', value: stats?.hours_worked || 0, icon: <Clock size={18} className="text-blue-500" />, sub: 'This week' }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar onMenuClick={onMenuClick} title="Profile" />

            <div className="p-4 space-y-6">
                {/* Header Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl shadow-blue-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />

                    <div className="relative flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <UserIcon size={40} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{user?.name || 'Technician Name'}</h2>
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">
                                {(user as any)?.role?.replace('_', ' ') || 'Senior Technician'}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">
                                    ID: {user?.id?.slice(0, 8).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {stats_cards.map((card, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-center flex flex-col items-center justify-center">
                            <div className="mb-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                                {card.icon}
                            </div>
                            <p className="text-lg font-bold text-slate-100 leading-none">{card.value}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Menu Items */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden divide-y divide-slate-800/50">
                    <MenuItem
                        icon={<Award className="text-amber-500" />}
                        label="Achievements"
                        sub="3 New badges unlocked"
                    />
                    <MenuItem
                        icon={<TrendingUp className="text-emerald-500" />}
                        label="Performance Stats"
                        sub="View detailed metrics"
                        onClick={() => navigate(RoutePath.PERFORMANCE)}
                    />
                    <MenuItem
                        icon={<Target className="text-blue-500" />}
                        label="Work History"
                        sub="Completed jobs log"
                        onClick={() => navigate(RoutePath.WORK_HISTORY)}
                    />

                    <MenuItem
                        icon={<Settings className="text-slate-400" />}
                        label="Account Settings"
                        sub="Security & Preferences"
                        onClick={() => navigate(RoutePath.SETTINGS)}
                    />
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-slate-900 border border-rose-900/50 text-rose-500 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-rose-900/10 transition-colors"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, sub: string, onClick?: () => void }> = ({ icon, label, sub, onClick }) => (
    <button
        onClick={onClick}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors group text-left"
    >
        <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 group-hover:bg-slate-900 transition-colors">
                {icon}
            </div>
            <div>
                <p className="font-bold text-slate-200 text-sm">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-700 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
    </button>
);
