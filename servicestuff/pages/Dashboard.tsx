import React, { useState, useEffect, Suspense, lazy } from 'react';
import { TechnicianAPI } from '../services/api'; // Import API service
import { JobCard, DashboardStats, TechnicianAttendance, AttendanceStatus } from '../types';
import {
  Clock, CheckCircle, AlertCircle, Calendar, RefreshCw,
  Loader2, PlayCircle, StopCircle, ClipboardList, ChevronRight, X, QrCode, Scan, LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TopBar } from '../components/TopBar';
import { BarcodeScannerComponent } from '../components/BarcodeScanner';
import { LocationService } from '../services/location';
import { useNavigate } from 'react-router-dom';
import { RoutePath, JobStatus } from '../types';
import { SocketService } from '../services/socket';
import { DashboardSkeleton } from '../components/Skeleton';
const DashboardJobCards = lazy(() => import('../components/DashboardJobCards'));
// import { toast } from 'sonner';

export const Dashboard: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const [tasks, setTasks] = useState<JobCard[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPurpose, setScanPurpose] = useState<'attendance_in' | 'attendance_out' | 'job_card' | null>(null);
  const [newAlert, setNewAlert] = useState<{ message: string, type: 'info' | 'success' } | null>(null);

  // Timer for active shift
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const fetchTimeoutReq = React.useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsResult, statusResult, jobsResult] = await Promise.allSettled([
        TechnicianAPI.getDashboardStats(),
        TechnicianAPI.getAttendanceStatus(),
        TechnicianAPI.getJobs({ limit: 5 }),
      ]);

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data?.data?.stats || null);
      } else {
        console.error("[DASHBOARD] Stats fetch failed:", statsResult.reason);
      }

      if (statusResult.status === 'fulfilled') {
        setAttendanceStatus(statusResult.value.data?.data || null);
      } else {
        console.error("[DASHBOARD] Attendance status fetch failed:", statusResult.reason);
      }

      if (jobsResult.status === 'fulfilled') {
        setTasks(jobsResult.value.data?.data || []);
      } else {
        console.error("[DASHBOARD] Jobs fetch failed:", jobsResult.reason);
      }

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for realtime updates
    const socket = SocketService.getInstance();

    // Debounced fetch to prevent API storms from socket events

    const debouncedFetchData = () => {
      if (fetchTimeoutReq.current) clearTimeout(fetchTimeoutReq.current);
      fetchTimeoutReq.current = setTimeout(() => {
        fetchData();
      }, 300);
    };

    const handleUpdate = (data?: any) => {
      console.log("[REALTIME] Update received:", data);

      // Notify user if needed
      if (data?.action === 'created') {
        setNewAlert({ message: "New Job Card Assigned! 🚀", type: 'success' });
        setTimeout(() => setNewAlert(null), 5000);
      } else if (data?.action === 'deleted') {
        setNewAlert({ message: "Job card deleted or unassigned.", type: 'info' });
        setTimeout(() => setNewAlert(null), 5000);
      }

      // Refresh data (debounced)
      debouncedFetchData();
    };

    const events = [
      'job_cards:changed', 'order:update', 'inventory:changed',
      'attendance:changed', 'attendance:shift_start', 'attendance:shift_end'
    ];
    events.forEach(e => socket.on(e, handleUpdate));

    return () => {
      events.forEach(e => socket.off(e, handleUpdate));
      if (timerRef.current) clearInterval(timerRef.current);
      if (fetchTimeoutReq.current) clearTimeout(fetchTimeoutReq.current);
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    if (attendanceStatus?.currentState === 'SHIFT_ACTIVE' && attendanceStatus?.currentShiftStartedAt) {
      const startTime = new Date(attendanceStatus.currentShiftStartedAt).getTime();
      const update = () => setElapsedTime(Date.now() - startTime);
      update();
      timerRef.current = setInterval(update, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [attendanceStatus?.currentState, attendanceStatus?.currentShiftStartedAt]);

  const handleClockInOut = async () => {
    if (operationLoading) return;

    if (!attendanceStatus || attendanceStatus?.currentState === 'NOT_CHECKED_IN' || attendanceStatus?.currentState === 'CHECKED_OUT') {
      setScanPurpose('attendance_in');
      setIsScanning(true);
    } else {
      setScanPurpose('attendance_out');
      setIsScanning(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'qc_passed':
      case 'verified':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'qc_pending':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'qc_failed':
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      default: return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'qc_passed':
      case 'verified':
        return <CheckCircle size={16} className="mr-1" />;
      case 'in_progress':
        return <Clock size={16} className="mr-1" />;
      case 'qc_pending':
        return <AlertCircle size={16} className="mr-1 animate-pulse" />;
      case 'qc_failed':
        return <X size={16} className="mr-1" />;
      default: return <AlertCircle size={16} className="mr-1" />;
    }
  };

  const handleScan = async (result: string) => {
    setIsScanning(false);
    const purpose = scanPurpose;
    setScanPurpose(null);

    if (purpose === 'attendance_in' || purpose === 'attendance_out') {
      setOperationLoading(true);
      try {
        const location = await LocationService.getInstance().getCurrentLocation();
        if (purpose === 'attendance_in') {
          await TechnicianAPI.clockIn(location, result);
          setNewAlert({ message: "Successfully Clocked In! ✅", type: 'success' });
        } else {
          await TechnicianAPI.clockOut(location, result);
          setNewAlert({ message: "Successfully Clocked Out! 👋", type: 'success' });
        }
        await fetchData();
        setTimeout(() => setNewAlert(null), 3000);
      } catch (err: any) {
        alert("Action failed: " + (err.response?.data?.error || err.message));
      } finally {
        setOperationLoading(false);
      }
    } else {
      // General scanning (VIN/Job Card)
      console.log("Scanned VIN/Job Card:", result);
      const matchedIdx = tasks.findIndex(t => t.vehicle?.license_plate === result || t.id === result);
      if (matchedIdx !== -1) {
        navigate(RoutePath.JOB_CARD.replace(':id', tasks[matchedIdx].id));
      } else {
        alert(`Scanned: ${result}. Feature coming soon.`);
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {isScanning && (
        <BarcodeScannerComponent
          onScan={handleScan}
          onClose={() => { setIsScanning(false); setScanPurpose(null); }}
          message={scanPurpose === 'attendance_in' ? "Scan Workshop QR to Clock In" : scanPurpose === 'attendance_out' ? "Scan Workshop QR to Clock Out" : "Scan VIN or Job Ticket"}
        />
      )}
      <TopBar onMenuClick={onMenuClick} title="Dashboard" />

      {/* Real-time Alert Banner */}
      {newAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mx-4 mt-4 p-4 rounded-3xl shadow-2xl shadow-blue-900/20 backdrop-blur-xl border border-white/10 flex items-center justify-between z-10 ${newAlert.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-blue-600/20 text-blue-400'
            }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <p className="text-sm font-bold">{newAlert.message}</p>
          </div>
          <button onClick={() => setNewAlert(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* Attendance Widget */}
      <div className="p-4 pb-0">
        <div
          onClick={() => navigate(RoutePath.ATTENDANCE)}
          className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-600/20 dark:to-indigo-700/20 backdrop-blur-md rounded-[2.5rem] p-6 shadow-xl shadow-blue-900/10 dark:shadow-blue-950/20 border border-white/50 dark:border-white/5 flex justify-between items-center relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-blue-500/20 transition-all duration-700" />

          <div className="relative z-10">
            <p className="text-blue-600 dark:text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">
              Workshop Status
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">
              {attendanceStatus?.currentState === 'SHIFT_ACTIVE' ? 'Working Active' :
                attendanceStatus?.currentState === 'SHIFT_PAUSED' ? 'On Break' :
                  attendanceStatus?.currentState === 'CHECKED_IN_IDLE' ? 'Logged In' :
                    attendanceStatus?.currentState === 'CHECKED_OUT' ? 'Day Finished' : 'Offline'}
            </h3>
            {attendanceStatus?.currentState && attendanceStatus.currentState !== 'NOT_CHECKED_IN' && attendanceStatus.currentState !== 'CHECKED_OUT' && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-[10px] font-bold text-blue-800 dark:text-blue-400 flex items-center bg-white/40 dark:bg-black/20 px-3 py-1 rounded-full w-fit">
                  <Clock size={12} className="mr-1.5" />
                  {attendanceStatus?.currentState === 'SHIFT_ACTIVE' ? formatTime(elapsedTime) : 'Session Idle'}
                </p>
                {attendanceStatus?.currentState === 'SHIFT_ACTIVE' && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={(e) => { e.stopPropagation(); handleClockInOut(); }}
              disabled={operationLoading}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 ${attendanceStatus?.currentState === 'NOT_CHECKED_IN'
                ? 'bg-blue-600 text-white shadow-blue-900/30'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-black/20'
                } ${operationLoading ? 'opacity-50' : 'hover:scale-105'}`}
            >
              {operationLoading ? (
                <RefreshCw size={24} className="animate-spin" />
              ) : (
                attendanceStatus?.currentState === 'NOT_CHECKED_IN' ? <QrCode size={24} /> : <Scan size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div
          className="glass p-5 rounded-3xl shadow-xl shadow-blue-950/20 flex items-center justify-between col-span-2 active:scale-95 cursor-pointer group"
          onClick={() => { setScanPurpose('job_card'); setIsScanning(true); }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Scan size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Scanner</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Scan VIN or Ticket</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-700" />
        </div>

        <div
          onClick={() => navigate(RoutePath.MY_JOBS, { state: { status: JobStatus.PENDING } })}
          className="glass p-5 rounded-3xl shadow-lg shadow-black/20 active:scale-95 cursor-pointer"
        >
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Pending</p>
          <p className="text-4xl font-black text-amber-400 mt-2 font-display italic">
            {stats?.pending || 0}
          </p>
        </div>
        <div
          onClick={() => navigate(RoutePath.MY_JOBS, { state: { status: JobStatus.IN_PROGRESS } })}
          className="glass p-5 rounded-3xl shadow-lg shadow-black/20 active:scale-95 cursor-pointer"
        >
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Active</p>
          <p className="text-4xl font-black text-blue-400 mt-2 font-display italic">
            {stats?.active || 0}
          </p>
        </div>

        <div
          onClick={() => navigate(RoutePath.PERFORMANCE)}
          className="glass p-6 rounded-[2rem] shadow-2xl shadow-blue-950/20 col-span-2 flex justify-between items-center active:scale-[0.98] cursor-pointer group overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                <motion.circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={150} initial={{ strokeDashoffset: 150 }} animate={{ strokeDashoffset: 150 - (150 * (stats?.efficiency_score || 0) / 100) }} transition={{ duration: 1 }} className="text-emerald-500" />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">{stats?.efficiency_score || 0}%</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Efficiency</p>
              <p className="text-sm font-bold text-emerald-500">Above Average</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Work Hours</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{stats?.hours_worked || 0}h</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-2 mt-2 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-3 font-display">Recent Tasks</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && stats === null && tasks.length === 0 && (
        <DashboardSkeleton />
      )}

      {/* Task List */}
      <div className="px-4 space-y-4">
        <Suspense fallback={
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass border border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 rounded-3xl h-36 animate-pulse shadow-sm" />
            ))}
          </div>
        }>
          <DashboardJobCards
            tasks={tasks}
            onCardClick={(id) => navigate(RoutePath.JOB_CARD.replace(':id', id))}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        </Suspense>
        {!loading && tasks.length === 0 && (
          <div className="text-center py-10">
            <ClipboardList className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">No recent tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
};