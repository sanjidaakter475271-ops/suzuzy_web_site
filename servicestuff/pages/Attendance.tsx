import React, { useState, useEffect, useRef } from 'react';
import { TechnicianAPI } from '../services/api';
import { LocationService } from '../services/location';
import { TechnicianAttendance, AttendanceStatus, AttendanceShift } from '../types';
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
    X,
    QrCode,
    Coffee,
    Zap,
    LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { BarcodeScannerComponent } from '../components/BarcodeScanner';

export const Attendance: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const [history, setHistory] = useState<TechnicianAttendance[]>([]);
    const [status, setStatus] = useState<AttendanceStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [scanPurpose, setScanPurpose] = useState<'clock_in' | 'clock_out' | null>(null);
    const [operationLoading, setOperationLoading] = useState(false);

    // Live Timer State
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const navigate = useNavigate();

    const fetchStatus = async () => {
        try {
            const res = await TechnicianAPI.getAttendanceStatus();
            setStatus(res.data.data);

            // Re-sync history as well
            const historyRes = await TechnicianAPI.getAttendanceHistory();
            setHistory(historyRes.data.data || []);
        } catch (err) {
            console.error("Status fetch error:", err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        await fetchStatus();
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Live Timer Effect
    useEffect(() => {
        if (status?.currentState === 'SHIFT_ACTIVE' && status.currentShiftStartedAt) {
            const startTime = new Date(status.currentShiftStartedAt).getTime();

            const updateTimer = () => {
                const now = new Date().getTime();
                setElapsedTime(now - startTime);
            };

            updateTimer(); // initial call
            timerRef.current = setInterval(updateTimer, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setElapsedTime(0);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status?.currentState, status?.currentShiftStartedAt]);

    const formatElapsedTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    };

    const handleClockInClick = () => {
        setScanPurpose('clock_in');
        setIsScanning(true);
    };

    const handleClockOutClick = () => {
        setScanPurpose('clock_out');
        setIsScanning(true);
    };

    const handleStartShift = async () => {
        setOperationLoading(true);
        try {
            await TechnicianAPI.startShift();
            await fetchStatus();
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to start work");
        } finally {
            setOperationLoading(false);
        }
    };

    const handleEndShift = async () => {
        setOperationLoading(true);
        try {
            await TechnicianAPI.endShift();
            await fetchStatus();
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to stop work");
        } finally {
            setOperationLoading(false);
        }
    };

    const handleScan = async (result: string) => {
        setIsScanning(false);
        const purpose = scanPurpose;
        setScanPurpose(null);

        setOperationLoading(true);
        try {
            const location = await LocationService.getInstance().getCurrentLocation();
            if (purpose === 'clock_in') {
                await TechnicianAPI.clockIn(location, result);
            } else if (purpose === 'clock_out') {
                await TechnicianAPI.clockOut(location, result);
            }
            await fetchStatus();
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to process QR code");
        } finally {
            setOperationLoading(false);
        }
    };

    // Calendar logic (unchanged)
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
        const records = history.filter(a => a.clockIn.startsWith(dateStr));
        if (records.length === 0) return null;
        if (records.some(a => a.status === 'sick_leave')) return 'sick_leave';
        if (records.some(a => a.status === 'leave')) return 'leave';
        return 'present';
    };

    const renderActionButtons = () => {
        if (!status) return null;

        switch (status.currentState) {
            case 'NOT_CHECKED_IN':
                return (
                    <button
                        onClick={handleClockInClick}
                        className="w-full py-6 rounded-[2.5rem] bg-orange-600 text-white shadow-2xl shadow-orange-900/40 hover:bg-orange-500 active:scale-95 flex items-center justify-center gap-4 transition-all"
                    >
                        <QrCode size={32} />
                        <div className="text-left">
                            <p className="text-sm font-black uppercase tracking-widest opacity-80">Workspace Arrival</p>
                            <p className="text-2xl font-black">Scan QR to Login</p>
                        </div>
                    </button>
                );
            case 'CHECKED_IN_IDLE':
            case 'SHIFT_PAUSED':
                return (
                    <div className="w-full space-y-4">
                        <button
                            onClick={handleStartShift}
                            disabled={operationLoading}
                            className="w-full py-6 rounded-[2.5rem] bg-blue-600 text-white shadow-2xl shadow-blue-900/40 hover:bg-blue-500 active:scale-95 flex items-center justify-center gap-4 transition-all"
                        >
                            <Zap size={32} />
                            <div className="text-left">
                                <p className="text-sm font-black uppercase tracking-widest opacity-80">Work Status</p>
                                <p className="text-2xl font-black">Start Active Shift</p>
                            </div>
                        </button>
                        <button
                            onClick={handleClockOutClick}
                            className="w-full py-3 text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            <LogOut size={16} /> Finish Day & Logout
                        </button>
                    </div>
                );
            case 'SHIFT_ACTIVE':
                return (
                    <div className="w-full space-y-4">
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 italic">Active Work Duration</p>
                            <p className="text-6xl font-mono font-black text-gray-900 dark:text-white tracking-tighter">
                                {formatElapsedTime(elapsedTime)}
                            </p>
                        </div>
                        <button
                            onClick={handleEndShift}
                            disabled={operationLoading}
                            className="w-full py-6 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl hover:opacity-90 active:scale-95 flex items-center justify-center gap-4 transition-all mt-4"
                        >
                            <Coffee size={32} />
                            <div className="text-left">
                                <p className="text-sm font-black uppercase tracking-widest opacity-50">Work Status</p>
                                <p className="text-2xl font-black">Take a Break</p>
                            </div>
                        </button>
                    </div>
                );
            case 'CHECKED_OUT':
                return (
                    <div className="text-center space-y-6">
                        <div className="py-4">
                            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Work Ended</h3>
                            <p className="text-slate-500 font-bold text-sm mt-1">Great job today! See you tomorrow.</p>
                        </div>

                        <button
                            onClick={handleClockInClick}
                            className="w-full py-6 rounded-[2.5rem] bg-orange-600 text-white shadow-2xl shadow-orange-900/40 hover:bg-orange-500 active:scale-95 flex items-center justify-center gap-4 transition-all"
                        >
                            <QrCode size={32} />
                            <div className="text-left">
                                <p className="text-sm font-black uppercase tracking-widest opacity-80">Workspace Re-entry</p>
                                <p className="text-2xl font-black">Scan QR to Login</p>
                            </div>
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest"
                        >
                            Sync Records
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 pb-20">
            {isScanning && (
                <BarcodeScannerComponent
                    onScan={handleScan}
                    onClose={() => { setIsScanning(false); setScanPurpose(null); }}
                    message={`Scan Workshop QR to ${scanPurpose === 'clock_in' ? 'Clock In' : 'Clock Out'}`}
                />
            )}
            <TopBar
                onMenuClick={onMenuClick}
                onBack={() => navigate(RoutePath.DASHBOARD)}
                breadcrumbs={[{ label: 'Attendance' }]}
            />

            <div className="p-4 space-y-6">
                {/* Main Action Card */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] p-8 relative overflow-hidden shadow-2xl shadow-blue-900/5">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/5 blur-[100px] rounded-full" />
                    <div className="relative z-10">
                        {renderActionButtons()}
                    </div>
                </div>

                {/* Daily Total Mini Stats */}
                {status && status.totalWorkTimeMs > 0 && (
                    <div className="flex gap-4 px-2">
                        <div className="flex-1 bg-white dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Worked Today</p>
                            <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">
                                {Math.floor(status.totalWorkTimeMs / (1000 * 60 * 60))}h {Math.floor((status.totalWorkTimeMs % (1000 * 60 * 60)) / (1000 * 60))}m
                            </p>
                        </div>
                        <div className="flex-1 bg-white dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sessions</p>
                            <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">
                                {status.sessions.length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Calendar Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic">Activity History</h3>
                            <h4 className="text-lg font-black text-gray-900 dark:text-slate-100">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h4>
                        </div>
                        <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-100 dark:border-slate-800">
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors rotate-180"><ChevronLeft size={18} /></button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 backdrop-blur-sm shadow-xl shadow-blue-900/5">
                        <div className="grid grid-cols-7 mb-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black text-slate-400">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-3">
                            {getDaysInMonth(currentMonth).map((day, idx) => {
                                const dayStatus = day ? getDayStatus(day) : null;
                                return (
                                    <div key={idx} className="aspect-square flex items-center justify-center">
                                        {day && (
                                            <button
                                                onClick={() => fetchDateStats(day)}
                                                className={`relative w-full h-full flex items-center justify-center rounded-2xl text-xs font-black transition-all ${dayStatus === 'present'
                                                    ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                                                    : dayStatus === 'leave'
                                                        ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                        : dayStatus === 'sick_leave'
                                                            ? 'bg-yellow-500 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                                            : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4 bg-white dark:bg-slate-900/30 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 mx-1">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                        Attended
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        Leave
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        Sick Leave
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                        Off Day
                    </div>
                </div>
            </div>

            {/* Summary Modal */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setSelectedDate(null)}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-8 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-600 to-amber-500" />

                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 italic">Daily Activity Report</h3>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="p-3 bg-slate-50 dark:bg-slate-800 hover:scale-110 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {statsLoading ? (
                            <div className="py-16 flex flex-col items-center justify-center gap-6">
                                <RefreshCw className="animate-spin text-orange-600" size={40} />
                                <p className="text-[10px] font-black text-slate-400 animate-pulse uppercase tracking-[0.3em]">Synching Data...</p>
                            </div>
                        ) : dayStats ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Hrs Worked</p>
                                        <p className="text-3xl font-mono font-black text-slate-900 dark:text-white">{dayStats.hoursWorked}<span className="text-xs ml-1 text-slate-400 font-sans">h</span></p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Jobs Closed</p>
                                        <p className="text-3xl font-mono font-black text-slate-900 dark:text-white">{dayStats.completedJobs}</p>
                                    </div>
                                </div>

                                <div className="bg-orange-600/5 p-6 rounded-[2.5rem] border border-orange-600/10 flex flex-col items-center gap-2">
                                    <p className="text-[10px] text-orange-600 font-black uppercase tracking-[0.2em]">Service Quality</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-orange-600 tracking-tighter">{dayStats.averageRating}</span>
                                        <span className="text-sm font-black text-orange-600/30">/ 5.0</span>
                                    </div>
                                </div>

                                <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest leading-loose">
                                    verified activity from <br />authorised workshop session.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <History size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No records found</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

