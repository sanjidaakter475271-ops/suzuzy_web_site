import React, { useState, useEffect } from 'react';
import { TechnicianAPI } from '../services/api'; // Import API service
import { JobCard, DashboardStats, TechnicianAttendance } from '../types';
import {
  Clock, CheckCircle, AlertCircle, Calendar, RefreshCw,
  Loader2, PlayCircle, StopCircle, ClipboardList, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TopBar } from '../components/TopBar';
import { BarcodeScannerComponent } from '../components/BarcodeScanner';
import { LocationService } from '../services/location';
import { Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoutePath, JobStatus } from '../types';
import { SocketService } from '../services/socket';
// import { toast } from 'sonner';

export const Dashboard: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const [tasks, setTasks] = useState<JobCard[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendance, setAttendance] = useState<TechnicianAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get Dashboard Stats & Attendance
      const statsRes = await TechnicianAPI.getDashboardStats();
      setStats(statsRes.data.stats);
      setAttendance(statsRes.data.attendance);

      // 2. Get Recent Jobs
      const jobsRes = await TechnicianAPI.getJobs({ limit: 5 }); // Default sort is created_at desc
      setTasks(jobsRes.data.data);

    } catch (err) {
      console.error("Fetch error:", err);
      // toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for realtime updates
    const socket = SocketService.getInstance();
    const handleUpdate = () => {
      console.log("[REALTIME] Update received, refreshing dashboard...");
      fetchData();
    };

    socket.on('order:update', handleUpdate);
    socket.on('job_cards:changed', handleUpdate);
    socket.on('inventory:changed', handleUpdate);

    return () => {
      socket.off('order:update', handleUpdate);
      socket.off('job_cards:changed', handleUpdate);
      socket.off('inventory:changed', handleUpdate);
    };
  }, []);

  const handleClockInOut = async () => {
    if (attendanceLoading) return;
    setAttendanceLoading(true);
    try {
      const location = await LocationService.getInstance().getCurrentLocation();
      if (attendance && !attendance.clockOut) {
        await TechnicianAPI.clockOut(location);
      } else {
        await TechnicianAPI.clockIn(location);
      }
      await fetchData();
    } catch (err: any) {
      console.error("Attendance error details:", err.response?.data || err);
      const msg = err.response?.data?.error || err.message || "Failed to update attendance";
      alert(`Attendance Error: ${msg}`);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="mr-1" />;
      case 'in_progress': return <Clock size={16} className="mr-1" />;
      default: return <AlertCircle size={16} className="mr-1" />;
    }
  };

  const handleScan = async (result: string) => {
    setIsScanning(false);
    console.log("Scanned VIN/Job Card:", result);
    // Ideally call an API to find job by scanner result
    alert(`Scanned: ${result}. feature coming soon.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      {isScanning && (
        <BarcodeScannerComponent
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
        />
      )}
      <TopBar onMenuClick={onMenuClick} title="Dashboard" />

      {/* Attendance Widget */}
      <div className="p-4 pb-0 animate-slide-up">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Attendance</p>
            <h3 className="text-xl font-bold">
              {attendance && !attendance.clockOut ? 'Clocked In' : 'Clocked Out'}
            </h3>
            {attendance && !attendance.clockOut && (
              <p className="text-sm text-blue-100 mt-1 flex items-center">
                <Clock size={14} className="mr-1" />
                Since {new Date(attendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          <button
            onClick={handleClockInOut}
            disabled={attendanceLoading}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${attendance && !attendance.clockOut
              ? 'bg-white text-red-500 hover:bg-red-50'
              : 'bg-white text-green-600 hover:bg-green-50'
              } ${attendanceLoading ? 'opacity-50' : ''}`}
          >
            {attendanceLoading ? (
              <RefreshCw size={24} className="animate-spin" />
            ) : (
              attendance && !attendance.clockOut ? <StopCircle size={24} /> : <PlayCircle size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-4 grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors flex items-center justify-between col-span-2 active:scale-95 cursor-pointer group" onClick={() => setIsScanning(true)}>
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
          onClick={() => navigate(RoutePath.MY_JOBS)}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors active:scale-95 cursor-pointer"
        >
          <p className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pending</p>
          <p className="text-3xl font-bold text-amber-500 mt-2 font-display">
            {stats?.pending || 0}
          </p>
        </div>
        <div
          onClick={() => navigate(RoutePath.MY_JOBS)}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors active:scale-95 cursor-pointer"
        >
          <p className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Active</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2 font-display">
            {stats?.active || 0}
          </p>
        </div>

        <div
          onClick={() => navigate(RoutePath.PERFORMANCE)}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-all col-span-2 flex justify-between items-center active:scale-[0.98] cursor-pointer group"
        >
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

      {loading && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      )}

      {/* Task List */}
      <div className="px-4 space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            onClick={() => navigate(RoutePath.JOB_CARD.replace(':id', task.id))}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 active:scale-[0.98] cursor-pointer hover:border-blue-500/30 transition-all duration-100 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 dark:text-slate-100">{task.vehicle?.model_name || 'Unknown Model'}</h3>
              <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center border ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                {task.status === 'in_progress' ? 'Active' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1 font-mono bg-gray-100 dark:bg-slate-800 inline-block px-1.5 py-0.5 rounded text-xs tracking-wider">{task.vehicle?.license_plate || 'N/A'}</p>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-3 line-clamp-2">{task.vehicle?.issue_description || 'No Description'}</p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center text-xs text-gray-400 dark:text-slate-500">
                <Calendar size={12} className="mr-1" />
                {new Date(task.created_at).toLocaleDateString()}
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-slate-400">Owner: {task.vehicle?.customer_name || 'Unknown'}</p>
            </div>
          </div>
        ))}
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