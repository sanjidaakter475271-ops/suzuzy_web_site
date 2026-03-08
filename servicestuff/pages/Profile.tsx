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
    Shield,
    Store
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';

export const Profile: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { user, signOut } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, profileRes] = await Promise.all([
                    TechnicianAPI.getDashboardStats(),
                    TechnicianAPI.getProfile()
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.data.stats);
                }

                if (profileRes.data.success) {
                    setProfile(profileRes.data.data);
                }
            } catch (err) {
                console.error("Error fetching profile data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <TopBar
                onMenuClick={onMenuClick}
                onBack={() => navigate(RoutePath.DASHBOARD)}
                breadcrumbs={[{ label: 'Profile' }]}
            />

            <div className="p-4 space-y-6">
                {loading ? (
                    <div className="space-y-6 animate-pulse">
                        {/* Header Skeleton */}
                        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-[2rem] bg-slate-800" />
                            <div className="w-48 h-8 bg-slate-800 rounded-lg" />
                            <div className="w-32 h-4 bg-slate-800/50 rounded-md" />
                            <div className="flex gap-2">
                                <div className="w-20 h-6 bg-slate-800/30 rounded-full mt-2" />
                                <div className="w-20 h-6 bg-slate-800/20 rounded-full mt-2" />
                            </div>
                        </div>

                        {/* Stats Grid Skeleton */}
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 h-28" />
                            ))}
                        </div>

                        {/* Menu Skeleton */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] divide-y divide-slate-800">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="p-6 h-20" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header Card */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-800/20 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/10 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -translate-y-32 translate-x-32 group-hover:bg-blue-500/20 transition-all duration-1000" />

                            <div className="relative flex flex-col items-center text-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
                                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 relative z-10">
                                        <div className="w-full h-full rounded-[1.8rem] bg-slate-900 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={40} className="text-blue-400 opacity-80" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight font-display">{profile?.name || user?.name || 'Technician'}</h2>
                                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 bg-blue-500/10 px-3 py-1 rounded-full inline-block border border-blue-500/20 leading-none">
                                        {(profile?.role || user?.role || 'TECHNICIAN').replace('_', ' ')}
                                    </p>
                                    <div className="mt-4 flex flex-col items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white/5 backdrop-blur-md text-slate-300 text-[9px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase border border-white/5 shadow-xl">
                                                ID: {(profile?.id || user?.id || '00000000').slice(0, 8).toUpperCase()}
                                            </span>
                                        </div>

                                        {profile?.dealer && (
                                            <div className="flex flex-col items-center gap-1.5 pt-3 border-t border-white/5 w-full">
                                                <div className="flex items-center gap-2 text-blue-400/80">
                                                    <Store size={12} />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] shrink-0">Official Dealer</span>
                                                </div>
                                                <p className="text-white font-black text-sm tracking-tight">{profile.dealer.name}</p>
                                                <span className="text-slate-500 text-[8px] font-bold tracking-widest uppercase">
                                                    DEALER-ID: {profile.dealer.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {stats_cards.map((card, i) => (
                                <div key={i} className="bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl text-center flex flex-col items-center justify-center shadow-xl shadow-black/20 border border-white/5 hover:border-blue-500/30 transition-all duration-500 group">
                                    <div className="mb-3 p-2 bg-blue-500/5 rounded-2xl border border-blue-500/10 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                                        {card.icon}
                                    </div>
                                    <p className="text-xl font-black text-white leading-none font-display italic tracking-tight">{card.value}</p>
                                    <p className="text-[8px] text-slate-500 font-black uppercase mt-2 tracking-[0.15em] opacity-80 group-hover:opacity-100">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Menu Items */}
                        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden divide-y divide-white/5 border border-white/5 shadow-2xl">
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
                            className="w-full bg-rose-500/5 border border-rose-500/20 text-rose-500 py-5 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] hover:bg-rose-500/10 transition-all active:scale-95 shadow-xl shadow-rose-950/10 group"
                        >
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Terminate Session
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, sub: string, onClick?: () => void }> = ({ icon, label, sub, onClick }) => (
    <button
        onClick={onClick}
        className="w-full px-8 py-5 flex items-center justify-between hover:bg-white/5 transition-all group text-left active:bg-blue-500/5"
    >
        <div className="flex items-center gap-5">
            <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                {icon}
            </div>
            <div>
                <p className="font-black text-slate-100 text-sm tracking-wide">{label}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tight mt-0.5">{sub}</p>
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
    </button>
);
