'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Clock,
    User,
    Bike,
    Calendar,
    Phone,
    CheckCircle2,
    ChevronRight,
    ArrowRight,
    Loader2,
    CalendarDays,
    Filter,
    Plus,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent } from '@/components/service-admin/ui';
import { useRouter } from 'next/navigation';
import { useAppointmentStore } from '@/stores/service-admin/appointmentStore';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types/service-admin/index';
import { toast } from 'sonner';
import Link from 'next/link';

// ─── HELPERS ──────────────────────────────────────────────
const getLocalDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const formatDateLabel = (dateStr: string) => {
    const today = getLocalDateStr(new Date());
    const tomorrow = getLocalDateStr(new Date(Date.now() + 86400000));
    const yesterday = getLocalDateStr(new Date(Date.now() - 86400000));

    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    if (dateStr === yesterday) return 'Yesterday';

    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const isToday = (dateStr: string) => dateStr === getLocalDateStr(new Date());
const isPast = (dateStr: string) => dateStr < getLocalDateStr(new Date());
const isFuture = (dateStr: string) => dateStr > getLocalDateStr(new Date());

// STATUS COLORS
const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    pending: { label: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
    scheduled: { label: 'Checked In', bg: 'bg-brand/10', text: 'text-brand', dot: 'bg-brand' },
    completed: { label: 'Completed', bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', bg: 'bg-rose-500/10', text: 'text-rose-500', dot: 'bg-rose-500' },
    'no-show': { label: 'No Show', bg: 'bg-slate-500/10', text: 'text-slate-500', dot: 'bg-slate-500' },
    'in_progress': { label: 'In Service', bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' },
};

// ─── MAIN PAGE ────────────────────────────────────────────
const QueuePage = () => {
    const router = useRouter();
    const { appointments, fetchAppointments, isLoading, updateStatus } = useAppointmentStore();
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // Fetch ALL appointments (no date filter) when this page loads
    useEffect(() => {
        fetchAppointments(); // no filter → all appointments
    }, [fetchAppointments]);

    // ─── GROUP BY DATE ────────────────────────────────────
    const grouped = useMemo(() => {
        let filtered = appointments;

        // Apply status filter
        if (activeFilter === 'active') {
            filtered = appointments.filter(a => ['pending', 'scheduled'].includes(a.status));
        } else if (activeFilter !== 'all') {
            filtered = appointments.filter(a => a.status === activeFilter);
        }

        // Group
        const map: Record<string, Appointment[]> = {};
        for (const apt of filtered) {
            const dateKey = apt.date || 'Unknown';
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(apt);
        }

        // Sort dates descending (newest first), but put today on top
        const todayStr = getLocalDateStr(new Date());
        return Object.entries(map)
            .sort(([a], [b]) => {
                if (a === todayStr) return -1;
                if (b === todayStr) return 1;
                return b.localeCompare(a); // newest first
            });
    }, [appointments, activeFilter]);

    // ─── STATS ─────────────────────────────────────────────
    const totalAll = appointments.length;
    const todayAppts = appointments.filter(a => a.date === getLocalDateStr(new Date()));
    const todayCount = todayAppts.length;
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const checkedInCount = appointments.filter(a => a.status === 'scheduled').length;
    const completedCount = appointments.filter(a => a.status === 'completed').length;

    // Unique dates
    const uniqueDates = new Set(appointments.map(a => a.date));

    // ─── FILTER TABS ───────────────────────────────────────
    const filters = [
        { key: 'all', label: 'All', count: totalAll },
        { key: 'active', label: 'Active', count: pendingCount + checkedInCount },
        { key: 'in_progress', label: 'In Service', count: appointments.filter(a => a.status === 'in_progress').length },
        { key: 'pending', label: 'Pending', count: pendingCount },
        { key: 'scheduled', label: 'Checked In', count: checkedInCount },
        { key: 'completed', label: 'Completed', count: completedCount },
    ];

    return (
        <div className="min-h-screen bg-surface-page dark:bg-[#0a0a0a] p-6 lg:p-10 selection:bg-brand/30">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-3">
                        <Breadcrumb items={[{ label: 'Appointments', href: '/service-admin/appointments' }, { label: 'Queue Management' }]} />
                        <h1 className="text-4xl lg:text-5xl font-black text-ink-heading dark:text-white uppercase tracking-tighter leading-[0.9]">
                            Appointment <span className="text-brand italic">Queue</span>
                        </h1>
                        <p className="text-xs font-bold text-ink-muted uppercase tracking-[0.25em] opacity-60">
                            Date-wise breakdown · {uniqueDates.size} active date(s) · {totalAll} total bookings
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchAppointments()}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-surface-border dark:border-white/10 text-ink-muted hover:border-brand hover:text-brand transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                            <RefreshCw size={14} className={cn(isLoading && 'animate-spin')} />
                            Refresh
                        </button>
                        <Link
                            href="/service-admin/appointments/new"
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus size={14} />
                            New Booking
                        </Link>
                    </div>
                </div>

                {/* STAT BOXES */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Today's Queue", value: todayCount, color: 'bg-brand', textColor: 'text-white' },
                        { label: 'Pending', value: pendingCount, color: 'bg-amber-500', textColor: 'text-white' },
                        { label: 'Checked In', value: checkedInCount, color: 'bg-sky-500', textColor: 'text-white' },
                        { label: 'Completed', value: completedCount, color: 'bg-emerald-500', textColor: 'text-white' },
                    ].map((stat, i) => (
                        <div key={i} className={cn("rounded-3xl px-6 py-5 shadow-xl", stat.color, stat.textColor)}>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-70">{stat.label}</p>
                            <p className="text-4xl font-black mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* FILTER TABS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setActiveFilter(f.key)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                                activeFilter === f.key
                                    ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                                    : 'bg-white dark:bg-[#111] border-surface-border dark:border-white/10 text-ink-muted hover:border-brand/30'
                            )}
                        >
                            {f.label}
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black",
                                activeFilter === f.key ? 'bg-white/20' : 'bg-surface-page dark:bg-white/10'
                            )}>
                                {f.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* LOADING STATE */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-brand" size={32} />
                    </div>
                )}

                {/* DATE-WISE GROUPED LIST */}
                {!isLoading && grouped.length === 0 && (
                    <Card className="border-dashed border-2">
                        <CardContent className="p-16 text-center space-y-4">
                            <CalendarDays size={48} className="mx-auto text-ink-muted opacity-30" />
                            <p className="text-lg font-black text-ink-muted uppercase tracking-widest opacity-40">No Appointments Found</p>
                            <p className="text-sm text-ink-muted opacity-50">Create a new booking to populate the queue.</p>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && grouped.map(([dateStr, appts]) => {
                    const dateLabel = formatDateLabel(dateStr);
                    const todayDate = isToday(dateStr);
                    const pastDate = isPast(dateStr);
                    const activeCount = appts.filter(a => ['pending', 'scheduled'].includes(a.status)).length;
                    const doneCount = appts.filter(a => a.status === 'completed').length;

                    return (
                        <div key={dateStr} className="space-y-4">
                            {/* DATE HEADER */}
                            <div className={cn(
                                "flex items-center justify-between px-6 py-4 rounded-3xl border-2 transition-all",
                                todayDate
                                    ? 'bg-brand/5 border-brand/20 dark:bg-brand/10 dark:border-brand/30'
                                    : pastDate
                                        ? 'bg-surface-card dark:bg-[#111] border-surface-border dark:border-white/5 opacity-70'
                                        : 'bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-800/30'
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                                        todayDate ? 'bg-brand text-white shadow-lg shadow-brand/30' :
                                            pastDate ? 'bg-surface-border dark:bg-white/10 text-ink-muted' :
                                                'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                    )}>
                                        <CalendarDays size={22} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight">
                                                {dateLabel}
                                            </h2>
                                            {todayDate && (
                                                <span className="px-3 py-1 bg-brand text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-full animate-pulse">
                                                    Live
                                                </span>
                                            )}
                                            {isFuture(dateStr) && (
                                                <span className="px-3 py-1 bg-sky-500/10 text-sky-600 text-[8px] font-black uppercase tracking-[0.3em] rounded-full">
                                                    Upcoming
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mt-0.5">
                                            {dateStr} · {appts.length} booking{appts.length !== 1 ? 's' : ''}
                                            {activeCount > 0 && ` · ${activeCount} active`}
                                            {doneCount > 0 && ` · ${doneCount} done`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-ink-heading dark:text-white">{appts.length}</p>
                                    <p className="text-[9px] font-black text-ink-muted uppercase tracking-widest">Total</p>
                                </div>
                            </div>

                            {/* APPOINTMENT CARDS */}
                            <div className="space-y-3 pl-4 border-l-4 border-surface-border dark:border-white/5 ml-6">
                                {appts
                                    .sort((a, b) => (a.token || 999) - (b.token || 999))
                                    .map((apt) => {
                                        const sc = statusConfig[apt.status] || statusConfig.pending;
                                        return (
                                            <Card key={apt.id} className="group hover:border-brand/40 transition-all duration-300 overflow-hidden">
                                                <CardContent className="p-0">
                                                    <div className="flex flex-col md:flex-row items-stretch">
                                                        {/* TOKEN */}
                                                        <div className={cn(
                                                            "flex flex-col items-center justify-center w-full md:w-20 py-4 md:py-0 border-b md:border-b-0 md:border-r transition-colors",
                                                            apt.status === 'scheduled'
                                                                ? 'bg-brand/5 border-brand/20'
                                                                : 'bg-surface-page dark:bg-[#0d0d0d] border-surface-border dark:border-white/5'
                                                        )}>
                                                            <span className="text-[8px] font-black text-ink-muted uppercase tracking-widest">Token</span>
                                                            <span className={cn(
                                                                "text-2xl font-black",
                                                                apt.status === 'scheduled' ? 'text-brand' : 'text-ink-heading dark:text-white'
                                                            )}>{apt.token || '--'}</span>
                                                        </div>

                                                        {/* DETAILS */}
                                                        <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-4">
                                                            <div className="flex-1 space-y-1.5">
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <h3 className="font-black text-sm text-ink-heading dark:text-white uppercase tracking-tight">
                                                                        {apt.customerName}
                                                                    </h3>
                                                                    <span className={cn(
                                                                        "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                                                        sc.bg, sc.text
                                                                    )}>
                                                                        <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)}></span>
                                                                        {sc.label}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-[10px] font-bold text-ink-muted uppercase tracking-wider flex-wrap">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <Bike size={12} className="text-brand/50" />
                                                                        {apt.vehicleRegNo || 'N/A'}
                                                                        {apt.vehicleModel && ` · ${apt.vehicleModel}`}
                                                                    </span>
                                                                    <span className="flex items-center gap-1.5">
                                                                        <Clock size={12} className="text-brand/50" />
                                                                        {apt.time || '--:--'}
                                                                    </span>
                                                                    {apt.serviceType && (
                                                                        <span className="flex items-center gap-1.5">
                                                                            <Calendar size={12} className="text-brand/50" />
                                                                            {apt.serviceType}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* ACTIONS */}
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {['pending', 'scheduled'].includes(apt.status) && (
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            try {
                                                                                if (apt.status !== 'scheduled') {
                                                                                    await updateStatus(apt.id, 'scheduled');
                                                                                }
                                                                                toast.success(`Check-in: ${apt.customerName}`, {
                                                                                    description: "Directing to Job Card...",
                                                                                    duration: 1500
                                                                                });
                                                                                router.push(`/service-admin/workshop/job-cards/new?appointmentId=${apt.id}`);
                                                                            } catch (err: any) {
                                                                                toast.error(err.message || "Check-in failed");
                                                                            }
                                                                        }}
                                                                        className={cn(
                                                                            "px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                                                            apt.status === 'scheduled'
                                                                                ? 'bg-brand text-white shadow-lg shadow-brand/20 hover:shadow-brand/40'
                                                                                : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
                                                                        )}
                                                                    >
                                                                        {apt.status === 'scheduled' ? <CheckCircle2 size={14} /> : <ArrowRight size={14} />}
                                                                        {apt.status === 'scheduled' ? 'Create Job' : 'Check In'}
                                                                    </button>
                                                                )}

                                                                {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            try {
                                                                                await updateStatus(apt.id, 'completed');
                                                                                toast.success(`Completed: ${apt.customerName}`);
                                                                            } catch (err: any) {
                                                                                toast.error(err.message || "Operation failed");
                                                                            }
                                                                        }}
                                                                        className="p-2.5 rounded-2xl hover:bg-emerald-500/10 text-emerald-600 transition-all opacity-50 hover:opacity-100"
                                                                        title="Mark Complete"
                                                                    >
                                                                        <CheckCircle2 size={18} />
                                                                    </button>
                                                                )}

                                                                {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            try {
                                                                                await updateStatus(apt.id, 'cancelled');
                                                                                toast.info(`Cancelled: ${apt.customerName}`);
                                                                            } catch (err: any) {
                                                                                toast.error(err.message || "Operation failed");
                                                                            }
                                                                        }}
                                                                        className="p-2.5 rounded-2xl hover:bg-rose-500/10 text-rose-500 transition-all opacity-30 hover:opacity-100"
                                                                        title="Cancel"
                                                                    >
                                                                        <XCircle size={18} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
};

export default QueuePage;
