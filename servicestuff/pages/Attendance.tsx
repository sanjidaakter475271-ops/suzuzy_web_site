import React, { useState, useEffect } from 'react';
import { TechnicianAPI } from '../services/api';
import { LocationService } from '../services/location';
import { TechnicianAttendance } from '../types';
import { TopBar } from '../components/TopBar';
import {
    Clock,
    PlayCircle,
    StopCircle,
    Calendar,
    MapPin,
    RefreshCw,
    History,
    Timer
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Attendance: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const [attendance, setAttendance] = useState<TechnicianAttendance[]>([]);
    const [currentStatus, setCurrentStatus] = useState<TechnicianAttendance | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsRes = await TechnicianAPI.getDashboardStats();
            setCurrentStatus(statsRes.data.attendance);

            const historyRes = await TechnicianAPI.getAttendanceHistory();
            setAttendance(historyRes.data.data || []);
        } catch (err) {
            console.error("Attendance fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (ms: number) => {
        if (!ms || ms <= 0) return '---';
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleClockIn = async () => {
        try {
            const location = await LocationService.getInstance().getCurrentLocation();
            await TechnicianAPI.clockIn(location);
            fetchData();
        } catch (e: any) {
            const msg = e.response?.data?.error || "Failed to clock in";
            alert(msg);
        }
    };

    const handleClockOut = async () => {
        try {
            const location = await LocationService.getInstance().getCurrentLocation();
            await TechnicianAPI.clockOut(location);
            fetchData();
        } catch (e: any) {
            const msg = e.response?.data?.error || "Failed to clock out";
            alert(msg);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar onMenuClick={onMenuClick} title="Attendance" />

            <div className="p-4 space-y-6">
                {/* Active Status Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 transition-colors ${currentStatus && !currentStatus.clockOut ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                            <Clock size={32} />
                        </div>

                        <h2 className="text-xl font-bold text-slate-100">
                            {currentStatus && !currentStatus.clockOut ? 'Currently Clocked In' : 'Currently Clocked Out'}
                        </h2>

                        {currentStatus && !currentStatus.clockOut && (
                            <div className="mt-2 flex flex-col items-center">
                                <p className="text-sm text-slate-400">Shift started at</p>
                                <p className="text-2xl font-mono font-bold text-blue-400 mt-1">
                                    {new Date(currentStatus.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 w-full flex gap-3">
                            <button
                                onClick={handleClockIn}
                                disabled={!!(currentStatus && !currentStatus.clockOut)}
                                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${currentStatus && !currentStatus.clockOut
                                    ? 'bg-slate-800 text-slate-600 border border-slate-700'
                                    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 active:scale-95'
                                    }`}
                            >
                                <PlayCircle size={20} />
                                Clock In
                            </button>

                            <button
                                onClick={handleClockOut}
                                disabled={!currentStatus || !!currentStatus.clockOut}
                                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${!currentStatus || currentStatus.clockOut
                                    ? 'bg-slate-800 text-slate-600 border border-slate-700'
                                    : 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 hover:bg-rose-500 active:scale-95'
                                    }`}
                            >
                                <StopCircle size={20} />
                                Clock Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <History size={16} className="text-blue-500" />
                            Recent History
                        </h3>
                        {loading && <RefreshCw size={14} className="animate-spin text-slate-600" />}
                    </div>

                    <div className="space-y-3">
                        {attendance.length > 0 ? (
                            attendance.slice(0, 7).map((record, i) => (
                                <div key={record.id || i} className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200 text-sm">
                                                {new Date(record.clockIn).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <PlayCircle size={10} className="text-emerald-500" />
                                                    {new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {record.clockOut && (
                                                    <span className="flex items-center gap-1">
                                                        <StopCircle size={10} className="text-rose-500" />
                                                        {new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-400">
                                            <Timer size={12} className="text-blue-500" />
                                            {record.clockOut ? formatDuration((record as any).durationMs) : 'Active'}
                                        </div>
                                        <p className="text-[10px] text-slate-600 uppercase mt-0.5 tracking-tighter">Total Duration</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                                <p className="text-slate-600 text-sm">No attendance records found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
