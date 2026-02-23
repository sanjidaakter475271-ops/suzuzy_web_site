import React, { useState, useEffect } from 'react';
import { TechnicianAPI } from '../services/api';
import { DashboardStats } from '../types';
import { TopBar } from '../components/TopBar';
import {
    TrendingUp,
    Target,
    Award,
    Zap,
    Clock,
    CheckCircle,
    ChevronRight,
    Trophy,
    Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OfflineService } from '../services/offline';
import { WifiOff } from 'lucide-react';

export const Performance: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const offlineService = OfflineService.getInstance();
    const [isOnline, setIsOnline] = useState(offlineService.getOnlineStatus());

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (!offlineService.getOnlineStatus()) {
                    const cached = await offlineService.getCachedStats();
                    if (cached) {
                        setStats(cached);
                        setLoading(false);
                        return;
                    }
                }

                const res = await TechnicianAPI.getDashboardStats();
                setStats(res.data.stats);
                await offlineService.cacheStats(res.data.stats);
            } catch (err) {
                console.error("Error fetching stats:", err);
                const cached = await offlineService.getCachedStats();
                if (cached) setStats(cached);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        const interval = setInterval(() => {
            setIsOnline(offlineService.getOnlineStatus());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const badges = [
        { id: 1, name: 'Speed Demon', icon: <Flame className="text-orange-500" />, desc: 'Finished 5 jobs under estimated time', unlocked: true },
        { id: 2, name: 'Precision Pro', icon: <Target className="text-blue-500" />, desc: 'Zero QC failures this month', unlocked: true },
        { id: 3, name: 'Customer Hero', icon: <Award className="text-amber-500" />, desc: 'Maintain 4.8+ rating', unlocked: false },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar onMenuClick={onMenuClick} title="Performance" />

            {!isOnline && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 justify-center">
                    <WifiOff size={14} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Offline - Showing Cached Progress</span>
                </div>
            )}

            <div className="p-4 space-y-6">
                {/* Efficiency Score Hero */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Overall Efficiency</p>
                    <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                                cx="64" cy="64" r="58"
                                stroke="currentColor" strokeWidth="8"
                                fill="transparent"
                                className="text-slate-800"
                            />
                            <motion.circle
                                cx="64" cy="64" r="58"
                                stroke="currentColor" strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={364}
                                initial={{ strokeDashoffset: 364 }}
                                animate={{ strokeDashoffset: 364 - (364 * (stats?.efficiency_score || 0) / 100) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-blue-500"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">{stats?.efficiency_score || 0}%</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-500 text-sm font-bold">
                        <TrendingUp size={16} />
                        <span>+4% vs last week</span>
                    </div>
                </div>

                {/* Performance History Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Flame size={18} className="text-orange-500" />
                            Activity History
                        </h3>
                    </div>

                    <div className="flex items-end justify-between h-24 gap-3 px-1">
                        {(stats?.daily_performance || [
                            { day: 'M', jobs: 4, efficiency: 90 },
                            { day: 'T', jobs: 6, efficiency: 95 },
                            { day: 'W', jobs: 3, efficiency: 85 },
                            { day: 'T', jobs: 8, efficiency: 98 },
                            { day: 'F', jobs: 5, efficiency: 92 },
                            { day: 'S', jobs: 2, efficiency: 80 },
                            { day: 'S', jobs: 0, efficiency: 0 },
                        ]).map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full relative flex items-end justify-center bg-slate-950 rounded-full h-full border border-slate-800/50">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.jobs / 10) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full relative"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-400 transition-colors">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-3 border border-blue-500/20">
                            <Clock size={20} />
                        </div>
                        <p className="text-2xl font-bold text-white leading-none">{stats?.hours_worked || 0}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Hours Logged</p>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-3 border border-emerald-500/20">
                            <CheckCircle size={20} />
                        </div>
                        <p className="text-2xl font-bold text-white leading-none">{stats?.completed || 0}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Jobs Completed</p>
                    </div>
                </div>

                {/* Targets Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Target size={18} className="text-rose-500" />
                            Weekly Targets
                        </h3>
                        <span className="text-xs text-slate-500">2/3 Complete</span>
                    </div>

                    <div className="space-y-4">
                        <TargetProgress label="Total Jobs" current={stats?.completed || 0} target={20} color="bg-blue-500" />
                        <TargetProgress label="Work Hours" current={stats?.hours_worked || 0} target={40} color="bg-indigo-500" />
                        <TargetProgress label="Efficiency" current={stats?.efficiency_score || 0} target={90} color="bg-emerald-500" />
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="space-y-4 pb-10">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-2">
                        <Trophy size={16} className="text-amber-500" />
                        Achievements
                    </h3>

                    <div className="space-y-3">
                        {badges.map(badge => (
                            <div key={badge.id} className={`bg-slate-900/40 border p-4 rounded-2xl flex items-center gap-4 transition-all ${badge.unlocked ? 'border-slate-800' : 'border-slate-800 opacity-50 grayscale'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${badge.unlocked ? 'bg-slate-900 border-slate-700' : 'bg-slate-950 border-slate-900'}`}>
                                    {badge.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-100 text-sm">{badge.name}</h4>
                                    <p className="text-xs text-slate-500">{badge.desc}</p>
                                </div>
                                {badge.unlocked ? (
                                    <CheckCircle size={16} className="text-emerald-500" />
                                ) : (
                                    <Zap size={16} className="text-slate-700" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TargetProgress: React.FC<{ label: string, current: number, target: number, color: string }> = ({ label, current, target, color }) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">{label}</span>
                <span className="text-slate-200">{current}/{target}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
};
