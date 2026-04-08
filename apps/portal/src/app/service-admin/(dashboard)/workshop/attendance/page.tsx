"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Clock, PlayCircle, PauseCircle,
    CheckCircle2, RefreshCw, XCircle, ChevronRight,
    MapPin, Calendar as CalendarIcon, Filter,
    FileText, UserCheck, UserX, Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TechAttendance {
    id: string;
    name: string;
    email: string;
    avatar: string;
    status: 'active' | 'break' | 'checked_out' | 'offline';
    lastSeen: string | null;
    totalWorkTimeMs: number;
    activeSession: {
        id: string;
        clockIn: string;
        isShiftActive: boolean;
    } | null;
}

interface LeaveRequest {
    id: string;
    staffId: string;
    technicianName: string;
    technicianEmail: string;
    technicianAvatar: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    hometown?: string;
    emergencyPhone?: string;
}

const statusConfig = {
    active: { color: "bg-emerald-500", text: "text-emerald-500", label: "Active", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: PlayCircle },
    break: { color: "bg-amber-500", text: "text-amber-500", label: "On Break", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: PauseCircle },
    checked_out: { color: "bg-blue-500", text: "text-blue-500", label: "Checked Out", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CheckCircle2 },
    offline: { color: "bg-slate-400", text: "text-slate-500", label: "Offline", bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", icon: XCircle }
};

const leaveStatusConfig = {
    pending: { color: "bg-amber-500", text: "text-amber-500", label: "Pending", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock },
    approved: { color: "bg-emerald-500", text: "text-emerald-500", label: "Approved", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
    rejected: { color: "bg-rose-500", text: "text-rose-500", label: "Rejected", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: XCircle }
};

export default function AttendanceDashboardPage() {
    const [view, setView] = useState<'attendance' | 'leaves'>('attendance');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Attendance Query
    const { data: attendanceData, isLoading: isAttendanceLoading, isError, refetch: refetchAttendance, isFetching: isAttendanceFetching } = useQuery({
        queryKey: ["workshop-attendance", format(selectedDate, "yyyy-MM-dd")],
        queryFn: async () => {
            const res = await axios.get("/api/v1/workshop/attendance", {
                params: { date: format(selectedDate, "yyyy-MM-dd") }
            });
            setLastUpdated(new Date());
            return res.data.data as TechAttendance[];
        },
        refetchInterval: 30000,
        enabled: view === 'attendance'
    });

    // Leaves Query
    const { data: leavesData, isLoading: isLeavesLoading, refetch: refetchLeaves, isFetching: isLeavesFetching } = useQuery({
        queryKey: ["workshop-leaves"],
        queryFn: async () => {
            const res = await axios.get("/api/v1/workshop/leave");
            return res.data.data as LeaveRequest[];
        },
        enabled: view === 'leaves'
    });

    const handleUpdateLeaveStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const res = await axios.patch("/api/v1/workshop/leave", { id, status });
            if (res.data.success) {
                toast.success(`Leave request ${status} successfully`);
                refetchLeaves();
            }
        } catch (error) {
            toast.error("Failed to update leave status");
        }
    };

    const formatTimeMs = (ms: number) => {
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    const stats = React.useMemo(() => {
        const attendanceStats = {
            total: attendanceData?.length || 0,
            active: attendanceData?.filter(d => d.status === 'active').length || 0,
            break: attendanceData?.filter(d => d.status === 'break').length || 0,
            checked_out: attendanceData?.filter(d => d.status === 'checked_out').length || 0,
            offline: attendanceData?.filter(d => d.status === 'offline').length || 0,
        };

        const leaveStats = {
            pending: leavesData?.filter(l => l.status === 'pending').length || 0,
            approved: leavesData?.filter(l => l.status === 'approved').length || 0,
        };

        return { ...attendanceStats, ...leaveStats };
    }, [attendanceData, leavesData]);

    const filteredAttendance = React.useMemo(() => {
        if (!attendanceData) return [];
        if (filterStatus === 'all') return attendanceData;
        return attendanceData.filter(d => d.status === filterStatus);
    }, [attendanceData, filterStatus]);

    const isLoading = view === 'attendance' ? isAttendanceLoading : isLeavesLoading;
    const filteredData = view === 'attendance' ? filteredAttendance : (leavesData || []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Workshop Management</p>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 italic uppercase">
                        Staff <span className="text-brand">{view === 'attendance' ? 'Attendance' : 'Leave Requests'}</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-slate-500 text-sm font-medium">
                            {view === 'attendance' ? 'Real-time workshop staff monitoring' : 'Review and manage technician leave applications'}
                        </p>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Updated {format(lastUpdated, "hh:mm:ss a")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Switcher */}
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                        <button
                            onClick={() => setView('attendance')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                view === 'attendance' ? "bg-white dark:bg-slate-800 text-brand shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <Users size={14} />
                            Attendance
                        </button>
                        <button
                            onClick={() => setView('leaves')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative",
                                view === 'leaves' ? "bg-white dark:bg-slate-800 text-brand shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <FileText size={14} />
                            Leaves
                            {stats.pending > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[8px] text-white">
                                    {stats.pending}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => view === 'attendance' ? refetchAttendance() : refetchLeaves()}
                            className={cn(
                                "rounded-xl border-slate-200 dark:border-slate-800 hover:border-brand/50 transition-all duration-300",
                                (isAttendanceFetching || isLeavesFetching) && "opacity-50"
                            )}
                            disabled={isAttendanceFetching || isLeavesFetching}
                        >
                            <RefreshCw size={18} className={cn("text-slate-500", (isAttendanceFetching || isLeavesFetching) && "animate-spin")} />
                        </Button>

                        {view === 'attendance' && (
                            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm transition-all duration-500 hover:border-brand/30">
                                <div className="flex items-center">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="flex items-center px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                                                <CalendarIcon size={18} className="text-slate-400 mr-2 group-hover:text-brand transition-colors" />
                                                <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                                                    {format(selectedDate, "MMM dd, yyyy")}
                                                </span>
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="end">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={(date) => date && setSelectedDate(date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

                                <div className="flex items-center gap-1 px-1">
                                    {['all', 'active', 'break', 'offline'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                                filterStatus === status
                                                    ? "bg-brand text-white shadow-lg shadow-brand/20 scale-105"
                                                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Techs", value: stats.total, icon: Users, color: "text-brand", bg: "bg-brand/10", border: "border-brand/20" },
                    { label: "Active Now", value: stats.active, icon: PlayCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", pulse: true },
                    { label: "On Break", value: stats.break, icon: PauseCircle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                    { label: "Offline/Done", value: stats.offline + stats.checked_out, icon: Clock, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-brand/30 transition-all duration-500"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 blur-3xl -mr-12 -mt-12 group-hover:bg-brand/10 transition-colors" />
                        <div className="flex items-center justify-between relative z-10">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                            <div className={cn("p-2.5 rounded-xl transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:rotate-3", stat.bg, stat.color)}>
                                <stat.icon size={20} className={cn(stat.pulse && "animate-pulse")} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mt-4 relative z-10">
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{stat.value}</h3>
                            <div className={cn("w-1.5 h-1.5 rounded-full mb-2", stat.pulse ? "bg-emerald-500 animate-pulse" : "bg-slate-200 dark:bg-slate-800")} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Technician List */}
            <div className="bg-white dark:bg-[#0D0D0F] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                                {view === 'attendance' ? (
                                    <>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Agent Profile</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Current Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Initial Contact</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Active Cycle</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Stream</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Technician</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Leave Details</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Duration</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Reason</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Status / Action</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center text-slate-500 italic">
                                        <RefreshCw size={40} className="animate-spin mx-auto mb-6 text-brand/20" />
                                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Synchronizing Attendance Data...</p>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center text-slate-500">
                                        <XCircle size={40} className="mx-auto mb-6 text-slate-200 dark:text-slate-800" />
                                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">No active agents detected</p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredData.map((item: any, i) => {
                                        if (view === 'attendance') {
                                            const tech = item as TechAttendance;
                                            const cfg = statusConfig[tech.status as keyof typeof statusConfig];
                                            const StatusIcon = cfg.icon;

                                            return (
                                                <motion.tr
                                                    key={tech.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="border-b border-slate-50/50 dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all duration-500 group"
                                                >
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-5">
                                                            <div className="relative shrink-0">
                                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center font-black text-slate-400 border border-slate-200 dark:border-white/10 group-hover:border-brand/30 transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 shadow-inner">
                                                                    {tech.avatar ? (
                                                                        <img src={tech.avatar} alt={tech.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        tech.name.substring(0, 2).toUpperCase()
                                                                    )}
                                                                </div>
                                                                <span className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white dark:border-[#0D0D0F] shadow-xl z-10 transition-all duration-500", cfg.color)}></span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-black text-slate-900 dark:text-white italic uppercase tracking-tight group-hover:text-brand transition-colors duration-500 truncate">{tech.name}</h4>
                                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{tech.email || 'NO COMMS LINK'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all duration-500 group-hover:shadow-md", cfg.bg, cfg.text, cfg.border)}>
                                                            <StatusIcon size={12} className={cn(tech.status === 'active' && "animate-pulse")} />
                                                            {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-bold tabular-nums">
                                                            {tech.lastSeen ? (
                                                                <>
                                                                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:border-brand/20 transition-all">
                                                                        <Clock size={14} className="text-slate-400 group-hover:text-brand transition-colors" />
                                                                    </div>
                                                                    <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                                        {format(new Date(tech.lastSeen), "hh:mm a")}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-300 dark:text-slate-700 uppercase tracking-widest italic font-black">NO ACTIVITY DATA</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-black tabular-nums bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-inner group-hover:border-brand/20 transition-all">
                                                                {formatTimeMs(tech.totalWorkTimeMs)}
                                                            </span>
                                                            {tech.status === 'active' && (
                                                                <div className="flex gap-0.5">
                                                                    {[0, 1, 2].map(j => (
                                                                        <motion.div
                                                                            key={j}
                                                                            animate={{ height: [4, 12, 4] }}
                                                                            transition={{ repeat: Infinity, duration: 0.8, delay: j * 0.2 }}
                                                                            className="w-1 bg-emerald-500/40 rounded-full"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <Link
                                                            href={`/service-admin/workshop/technicians`}
                                                            className="inline-flex w-10 h-10 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-white hover:bg-brand hover:shadow-lg hover:shadow-brand/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-slate-200 dark:border-white/10 hover:border-brand"
                                                        >
                                                            <ChevronRight size={20} />
                                                        </Link>
                                                    </td>
                                                </motion.tr>
                                            );
                                        } else {
                                            const leave = item as LeaveRequest;
                                            const cfg = leaveStatusConfig[leave.status as keyof typeof leaveStatusConfig];
                                            const StatusIcon = cfg.icon;

                                            return (
                                                <motion.tr
                                                    key={leave.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="border-b border-slate-50/50 dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all duration-500 group"
                                                >
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-5">
                                                            <div className="relative shrink-0">
                                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center font-black text-slate-400 border border-slate-200 dark:border-white/10 group-hover:border-brand/30 transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 shadow-inner">
                                                                    {leave.technicianAvatar ? (
                                                                        <img src={leave.technicianAvatar} alt={leave.technicianName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        leave.technicianName.substring(0, 2).toUpperCase()
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-black text-slate-900 dark:text-white italic uppercase tracking-tight group-hover:text-brand transition-colors duration-500 truncate">{leave.technicianName}</h4>
                                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{leave.technicianEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <Badge variant="secondary" className="w-fit text-[10px] font-black uppercase tracking-widest bg-brand/5 text-brand border-brand/10">
                                                                {leave.leaveType}
                                                            </Badge>
                                                            {leave.hometown && (
                                                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                                    <Home size={10} />
                                                                    {leave.hometown}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                                                                {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd")}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-black">
                                                                {format(new Date(leave.startDate), "yyyy")}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 max-w-[200px] leading-relaxed italic">
                                                            "{leave.reason}"
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {leave.status === 'pending' ? (
                                                                <>
                                                                    <Button
                                                                        onClick={() => handleUpdateLeaveStatus(leave.id, 'approved')}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 rounded-lg border-emerald-500/20 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest"
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => handleUpdateLeaveStatus(leave.id, 'rejected')}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 rounded-lg border-rose-500/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-widest"
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", cfg.bg, cfg.text, cfg.border)}>
                                                                    <StatusIcon size={10} />
                                                                    {cfg.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        }
                                    })}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
