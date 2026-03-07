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
    Timer,
    ChevronLeft,
    X
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
            setCurrentStatus(statsRes.data.data.attendance);

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

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dayStats, setDayStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    const fetchDateStats = async (day: number) => {
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${formattedDay}`;

        setSelectedDate(dateStr);
        setStatsLoading(true);
        try {
            const res = await TechnicianAPI.getDateStats(dateStr);
            setDayStats(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    };

    const getDayStatus = (day: number) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const records = attendance.filter(a => a.clockIn.startsWith(dateStr));
        if (records.length === 0) return null;

        // Priority: sick_leave > leave > present
        if (records.some(a => a.status === 'sick_leave')) return 'sick_leave';
        if (records.some(a => a.status === 'leave')) return 'leave';
        return 'present';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
            <TopBar onMenuClick={onMenuClick} title="Attendance" />

            <div className="p-4 space-y-6">
                {/* Active Status Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 transition-all duration-500 ${currentStatus && !currentStatus.clockOut ? 'bg-orange-500/20 border-orange-500/50 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                            <Clock size={32} className={currentStatus && !currentStatus.clockOut ? 'animate-pulse' : ''} />
                        </div>

                        <h2 className="text-xl font-bold text-slate-100 font-display">
                            {currentStatus && !currentStatus.clockOut ? 'Currently Working' : 'Currently Offline'}
                        </h2>

                        {currentStatus && !currentStatus.clockOut && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex flex-col items-center">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Shift started at</p>
                                <p className="text-3xl font-mono font-bold text-orange-500 mt-1">
                                    {new Date(currentStatus.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </motion.div>
                        )}

                        <div className="mt-6 w-full flex gap-3">
                            <button
                                onClick={handleClockIn}
                                disabled={!!(currentStatus && !currentStatus.clockOut)}
                                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${currentStatus && !currentStatus.clockOut
                                    ? 'bg-slate-800 text-slate-600 border border-slate-700 opacity-50'
                                    : 'bg-orange-600 text-white shadow-lg shadow-orange-900/40 hover:bg-orange-500 active:scale-95'
                                    }`}
                            >
                                <PlayCircle size={20} />
                                Start Shift
                            </button>

                            <button
                                onClick={handleClockOut}
                                disabled={!currentStatus || !!currentStatus.clockOut}
                                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${!currentStatus || currentStatus.clockOut
                                    ? 'bg-slate-800 text-slate-600 border border-slate-700 opacity-50'
                                    : 'bg-slate-100 text-slate-900 shadow-lg hover:bg-white active:scale-95'
                                    }`}
                            >
                                <StopCircle size={20} />
                                End Shift
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic">Performance Calendar</h3>
                            <h4 className="text-lg font-bold text-slate-100">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h4>
                        </div>
                        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-slate-800 rounded-lg transition-colors rotate-180"><ChevronLeft size={18} /></button>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 backdrop-blur-sm">
                        <div className="grid grid-cols-7 mb-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black text-slate-600">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {getDaysInMonth(currentMonth).map((day, idx) => {
                                const status = day ? getDayStatus(day) : null;
                                return (
                                    <div key={idx} className="aspect-square flex items-center justify-center">
                                        {day && (
                                            <button
                                                onClick={() => fetchDateStats(day)}
                                                className={`relative w-full h-full flex items-center justify-center rounded-xl text-xs font-bold transition-all ${status === 'present'
                                                    ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                                                    : status === 'leave'
                                                        ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                        : status === 'sick_leave'
                                                            ? 'bg-yellow-500 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                                            : 'bg-slate-800/40 text-slate-500 hover:bg-slate-800'
                                                    }`}
                                            >
                                                {day}
                                                {status && (
                                                    <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${status === 'sick_leave' ? 'bg-slate-900' : 'bg-white'}`} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800 mx-2">
                    <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,1)]" />
                        Attended
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,1)]" />
                        Leave
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,1)]" />
                        Sick Leave
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                        Off Day
                    </div>
                </div>
            </div>

            {/* Summary Modal/Popup */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setSelectedDate(null)}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1 italic">Daily Summary</h3>
                                <p className="text-2xl font-bold text-white font-display">
                                    {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {statsLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-4">
                                <RefreshCw className="animate-spin text-orange-500" size={32} />
                                <p className="text-xs font-bold text-slate-500 animate-pulse uppercase tracking-widest">Gathering Stats...</p>
                            </div>
                        ) : dayStats ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/50 p-4 rounded-3xl border border-slate-700">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Hours</p>
                                        <p className="text-2xl font-mono font-bold text-white">{dayStats.hoursWorked}<span className="text-xs ml-1 text-slate-500 font-sans">h</span></p>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-3xl border border-slate-700">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Jobs Done</p>
                                        <p className="text-2xl font-mono font-bold text-white">{dayStats.completedJobs}</p>
                                    </div>
                                </div>

                                <div className="bg-orange-500/10 p-5 rounded-3xl border border-orange-500/20 flex flex-col items-center gap-2">
                                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Quality Rating</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-orange-500">{dayStats.averageRating}</span>
                                        <span className="text-sm font-bold text-orange-500/50">/ 5.0</span>
                                    </div>
                                </div>

                                <p className="text-[10px] text-slate-600 text-center uppercase tracking-tighter leading-relaxed">
                                    Performance metrics calculated based on <br />completed workspace tasks.
                                </p>
                            </div>
                        ) : (
                            <p className="text-center py-10 text-slate-500 font-bold">No data found for this date.</p>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};
