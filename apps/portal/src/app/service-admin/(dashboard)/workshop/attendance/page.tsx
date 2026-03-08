"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Clock, PlayCircle, PauseCircle,
    CheckCircle2, RefreshCw, XCircle, ChevronRight,
    MapPin, Calendar as CalendarIcon, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const statusConfig = {
    active: { color: "bg-emerald-500", text: "text-emerald-500", label: "Active", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: PlayCircle },
    break: { color: "bg-amber-500", text: "text-amber-500", label: "On Break", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: PauseCircle },
    checked_out: { color: "bg-blue-500", text: "text-blue-500", label: "Checked Out", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CheckCircle2 },
    offline: { color: "bg-slate-400", text: "text-slate-500", label: "Offline", bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700", icon: XCircle }
};

export default function AttendanceDashboardPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ["workshop-attendance", format(selectedDate, "yyyy-MM-dd")],
        queryFn: async () => {
            const res = await axios.get("/api/v1/workshop/attendance", {
                params: { date: format(selectedDate, "yyyy-MM-dd") }
            });
            return res.data.data as TechAttendance[];
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const formatTimeMs = (ms: number) => {
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    const stats = React.useMemo(() => {
        if (!data) return { total: 0, active: 0, break: 0, offline: 0, checked_out: 0 };
        return {
            total: data.length,
            active: data.filter(d => d.status === 'active').length,
            break: data.filter(d => d.status === 'break').length,
            checked_out: data.filter(d => d.status === 'checked_out').length,
            offline: data.filter(d => d.status === 'offline').length,
        };
    }, [data]);

    const filteredData = React.useMemo(() => {
        if (!data) return [];
        if (filterStatus === 'all') return data;
        return data.filter(d => d.status === filterStatus);
    }, [data, filterStatus]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Users className="text-brand" size={32} />
                        Technician Attendance
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Real-time workshop staff monitoring</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className={cn(
                            "p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                            isFetching && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={isFetching}
                    >
                        <RefreshCw size={20} className={cn("text-slate-500", isFetching && "animate-spin")} />
                    </button>

                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                        <CalendarIcon size={18} className="text-slate-400 ml-3 mr-2" />
                        <span className="text-sm font-semibold pr-4 py-2 border-r border-slate-200 dark:border-slate-800 mr-2 text-slate-700 dark:text-slate-300">
                            {format(selectedDate, "MMM dd, yyyy")}
                        </span>
                        {/* Status Filter */}
                        <div className="flex items-center gap-1 px-1">
                            {['all', 'active', 'break', 'offline'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors",
                                        filterStatus === status
                                            ? "bg-brand text-white shadow-md shadow-brand/20"
                                            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Techs", value: stats.total, icon: Users, color: "bg-brand/10 text-brand" },
                    { label: "Active Now", value: stats.active, icon: PlayCircle, color: "bg-emerald-500/10 text-emerald-500" },
                    { label: "On Break", value: stats.break, icon: PauseCircle, color: "bg-amber-500/10 text-amber-500" },
                    { label: "Offline/Done", value: stats.offline + stats.checked_out, icon: Clock, color: "bg-slate-500/10 text-slate-500" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <div className={cn("p-2 rounded-lg", stat.color)}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Technician List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden shadow-slate-200/50 dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Technician</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Clock In</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Hours Logged</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widesttext-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-500">
                                        <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-slate-300" />
                                        Loading attendance data...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-500">
                                        <XCircle size={32} className="mx-auto mb-4 text-slate-300" />
                                        No technicians found for the selected filter.
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {filteredData.map((tech) => {
                                        const cfg = statusConfig[tech.status];
                                        const StatusIcon = cfg.icon;

                                        return (
                                            <motion.tr
                                                key={tech.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-500">
                                                                {tech.avatar ? (
                                                                    <img src={tech.avatar} alt={tech.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    tech.name.substring(0, 2).toUpperCase()
                                                                )}
                                                            </div>
                                                            <span className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900", cfg.color)}></span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white">{tech.name}</h4>
                                                            <p className="text-xs text-slate-500">{tech.email || 'No email associated'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", cfg.bg, cfg.text, cfg.border)}>
                                                        <StatusIcon size={12} className={tech.status === 'active' ? "animate-pulse" : ""} />
                                                        {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                        {tech.lastSeen ? (
                                                            <>
                                                                <Clock size={14} className="text-slate-400" />
                                                                {format(new Date(tech.lastSeen), "hh:mm a")}
                                                            </>
                                                        ) : (
                                                            <span className="text-slate-400 italic">No activity today</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                                                        {formatTimeMs(tech.totalWorkTimeMs)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 rounded-lg text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors">
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
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
