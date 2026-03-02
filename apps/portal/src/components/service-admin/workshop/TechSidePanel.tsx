'use client';

import React, { memo, useEffect, useState, useMemo } from 'react';
import { Technician } from '@/types/service-admin/workshop';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import {
    X, Hammer, User, Clock, ShieldCheck,
    Activity, ArrowRight, Sparkles, History,
    TrendingUp, Star, Zap, Briefcase, Mail, Phone,
    AlertCircle, CheckCircle2, LayoutGrid, Car
} from 'lucide-react';
import { Button } from '@/components/service-admin/ui';
import { cn } from '@/lib/utils';

interface TechSidePanelProps {
    technician: Technician | null;
    onClose: () => void;
}

const TechSidePanel: React.FC<TechSidePanelProps> = ({ technician, onClose }) => {
    const ramps = useWorkshopStore(state => state.ramps);
    const jobCards = useWorkshopStore(state => state.jobCards);

    const assignedRamp = useMemo(() =>
        ramps.find(r => r.assignedTechnicianId === technician?.id),
        [ramps, technician?.id]);

    const activeJobsList = useMemo(() =>
        jobCards.filter(j => j.assignedTechnicianId === technician?.id && j.status !== 'delivered'),
        [jobCards, technician?.id]);

    if (!technician) return null;

    const efficiency = 85 + (parseInt(technician.id.charCodeAt(0).toString()) % 15);
    const rating = (4.5 + (parseInt(technician.id.charCodeAt(technician.id.length - 1).toString()) % 5) / 10).toFixed(1);

    return (
        <div className="w-full lg:w-[500px] bg-white dark:bg-[#0a0a0b] h-full flex flex-col relative overflow-hidden group/panel border-l border-surface-border dark:border-white/5 transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_0_100px_rgba(0,0,0,0.2)]">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 transition-all duration-[4000ms] group-hover/panel:scale-125 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Premium Header with Slow Animations */}
            <div className="p-10 pb-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-[1500ms] ease-out">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                        <div className="relative shrink-0 group/img">
                            <div className="absolute inset-0 bg-brand blur-[40px] opacity-10 group-hover/img:opacity-40 transition-opacity duration-[1500ms]" />
                            <img
                                src={technician.avatar}
                                className="w-24 h-24 rounded-[2.5rem] object-cover ring-4 ring-brand/5 shadow-2xl relative z-10 transition-transform duration-[2000ms] ease-out group-hover/img:scale-110 group-hover/img:rotate-2"
                                alt={technician.name}
                            />
                            <div className={cn(
                                "absolute -bottom-1 -right-1 w-7 h-7 border-[5px] border-white dark:border-[#0a0a0b] rounded-full shadow-lg z-20",
                                technician.status === 'active' ? "bg-emerald-500" : technician.status === 'busy' ? "bg-amber-500 animate-pulse duration-[3000ms]" : "bg-slate-400"
                            )} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-ink-heading dark:text-white uppercase tracking-tighter leading-none">
                                {technician.name}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="bg-brand/10 text-brand text-[9px] font-black px-3 py-1.5 rounded-xl border border-brand/20 tracking-[0.3em] uppercase shadow-sm">
                                    Master Agent
                                </span>
                                <span className="text-[10px] font-bold text-ink-muted/40 uppercase tracking-[0.4em]">
                                    U-ID: {technician.id.split('-')[0].toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-page dark:bg-white/5 border border-surface-border dark:border-white/10 text-ink-muted hover:text-brand hover:scale-110 transition-all duration-700 active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Staggered Quick Metrics */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: TrendingUp, label: 'Efficiency', val: `${efficiency}%`, color: 'text-brand', bg: 'hover:border-brand/30' },
                        { icon: Star, label: 'Ranking', val: rating, color: 'text-emerald-500', bg: 'hover:border-emerald-500/30' },
                        { icon: Briefcase, label: 'Portfolio', val: '128 Jobs', color: 'text-indigo-500', bg: 'hover:border-indigo-500/30' }
                    ].map((s, i) => (
                        <div key={i} className={cn("p-5 bg-white dark:bg-black/20 rounded-2xl border border-surface-border dark:border-white/5 flex flex-col items-center gap-2 shadow-sm transition-all duration-1000 group/stat animate-in fade-in scale-95 duration-[1200ms]", s.bg)} style={{ animationDelay: `${i * 200}ms` }}>
                            <s.icon size={18} className={cn("mb-1 group-hover/stat:scale-125 transition-transform duration-1000", s.color)} />
                            <span className="text-[8px] font-black text-ink-muted/60 uppercase tracking-widest">{s.label}</span>
                            <span className={cn("text-xs font-black tracking-tighter uppercase", s.color)}>{s.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Details with Slow Scrolling & Entry */}
            <div className="flex-1 overflow-y-auto p-10 pt-4 custom-scrollbar space-y-10 relative z-10 scroll-smooth">
                {/* Deployment Protocol */}
                <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-ink-muted/40 uppercase tracking-[0.5em] flex items-center gap-3">
                        <Zap size={16} className="text-brand/40" />
                        Live Assignment
                    </h5>

                    {assignedRamp ? (
                        <div className="p-10 rounded-[4rem] bg-gradient-to-br from-brand/10 to-transparent border-2 border-brand/20 relative overflow-hidden group shadow-[0_40px_100px_rgba(234,179,8,0.15)] animate-in fade-in slide-in-from-bottom-5 duration-[1500ms]">
                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <div className="p-4 rounded-full bg-brand/10 text-brand border border-brand/20 animate-pulse duration-[3000ms]">
                                    <Hammer size={32} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[11px] font-black text-brand uppercase tracking-[0.4em] opacity-60">Currently Stationed At</p>
                                    <div className="text-6xl font-black text-brand tabular-nums tracking-tighter drop-shadow-xl uppercase">
                                        {assignedRamp.name}
                                    </div>
                                    <div className="flex items-center justify-center gap-3 mt-4">
                                        <div className="px-4 py-1.5 bg-brand/5 border border-brand/20 rounded-xl flex items-center gap-2">
                                            <Car size={14} className="text-brand/60" />
                                            <span className="text-[11px] font-black text-ink-heading dark:text-white uppercase tracking-widest">{assignedRamp.vehicleRegNo || '--- --- ---'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all duration-[3000ms] group-hover:scale-150">
                                <Activity size={120} strokeWidth={0.5} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-16 rounded-[4rem] border-2 border-dashed border-surface-border dark:border-white/5 flex flex-col items-center justify-center text-center space-y-6 group transition-all duration-1000 hover:bg-white/[0.01] hover:border-brand/20">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-surface-page dark:bg-white/5 flex items-center justify-center text-ink-muted/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-[1500ms]">
                                <Clock size={40} strokeWidth={1} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tighter opacity-80">Idle Protocol</h4>
                                <p className="text-xs text-ink-muted/40 font-bold max-w-[200px] mx-auto leading-loose uppercase tracking-widest">Awaiting central command assignment.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Task Stream */}
                <div className="space-y-6 animate-in fade-in duration-[2000ms] delay-[600ms]">
                    <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black text-ink-muted/40 uppercase tracking-[0.5em] flex items-center gap-3">
                            <LayoutGrid size={16} className="text-brand/40" />
                            Workload Stream
                        </h5>
                        <span className="text-[10px] font-black text-brand bg-brand/10 px-3 py-1 rounded-lg border border-brand/20 tracking-tighter shadow-sm">
                            {activeJobsList.length} / {technician.capacity} CAP
                        </span>
                    </div>

                    <div className="space-y-4">
                        {activeJobsList.length > 0 ? activeJobsList.map((job, i) => (
                            <div key={job.id} className="group relative animate-in fade-in slide-in-from-left-4 duration-[1200ms]" style={{ animationDelay: `${i * 200 + 1000}ms` }}>
                                <div className="absolute inset-0 bg-brand/10 rounded-[2.5rem] blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-[1200ms]" />
                                <div className="relative p-7 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/10 rounded-[2.5rem] flex items-center gap-6 backdrop-blur-xl transition-all duration-1000 group-hover:border-brand/40 group-hover:-translate-y-1">
                                    <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 font-black text-sm shadow-inner group-hover:scale-110 transition-transform">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <h4 className="text-base font-black text-ink-heading dark:text-white truncate tracking-tighter uppercase">Session #{job.jobNo}</h4>
                                            <span className="text-[9px] font-black text-brand uppercase tracking-widest flex items-center gap-2">
                                                <Activity size={10} className="animate-pulse" /> Live
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-ink-muted/60 truncate uppercase tracking-[0.1em]">Engine Unit: {job.vehicleRegNo}</p>
                                    </div>
                                    <ArrowRight className="text-brand opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-0 transition-all duration-1000 shrink-0" size={20} />
                                </div>
                            </div>
                        )) : (
                            <div className="p-10 rounded-[2.5rem] bg-surface-page dark:bg-white/[0.01] border border-dashed border-surface-border/50 flex flex-col items-center justify-center opacity-40">
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-center">No active work stream found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Audit & Logs Cinematic View */}
                <div className="p-8 bg-surface-page dark:bg-black/40 rounded-[3rem] border border-surface-border dark:border-white/5 space-y-8 animate-in fade-in duration-[2000ms] delay-[1200ms]">
                    <h5 className="text-[10px] font-black text-ink-muted/40 uppercase tracking-[0.4em] flex items-center gap-3">
                        <ShieldCheck size={18} className="text-brand/40" />
                        Security Transaction Feed
                    </h5>
                    <div className="space-y-6">
                        {[
                            { time: 'ACTIVE', event: 'Diagnostics Routing Protocol', status: 'STREAMING', active: true },
                            { time: '09:30 AM', event: 'Biometric Auth Verified', status: 'LOCKED' },
                            { time: '09:00 AM', event: 'System Uplink Success', status: 'OK' }
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-start group/log p-1 transition-all">
                                <div className="flex gap-4">
                                    <div className={cn("w-2 h-2 rounded-full mt-2 ring-4 ring-brand/5 shadow-brand/20 shadow-lg transition-all duration-1000", item.active ? "bg-brand scale-110" : "bg-brand/20 opacity-40 group-hover/log:opacity-100")} />
                                    <div>
                                        <p className="text-xs font-black text-ink-heading dark:text-white leading-none mb-2 tracking-tight uppercase">{item.event}</p>
                                        <p className="text-[9px] font-bold text-ink-muted/40 uppercase tracking-widest">{item.time}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-brand uppercase tracking-widest opacity-40 group-hover/log:opacity-100 transition-opacity">{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cinematic Interaction Footer */}
            <div className="p-10 border-t border-surface-border dark:border-white/5 relative z-10 bg-white dark:bg-[#0a0a0b] shadow-[0_-40px_100px_rgba(0,0,0,0.1)] flex gap-5 animate-in slide-in-from-bottom-8 duration-[1500ms] delay-[1500ms]">
                <Button variant="outline" className="flex-1 py-8 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-brand hover:text-white transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group/btn hover:-translate-y-2 border-surface-border dark:border-white/10">
                    <Phone size={20} className="mr-3 group-hover/btn:scale-125 transition-transform duration-[1200ms]" />
                    Secure Uplink
                </Button>
                <Button variant="outline" className="flex-1 py-8 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-brand hover:text-white transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group/btn hover:-translate-y-2 border-surface-border dark:border-white/10">
                    <Mail size={20} className="mr-3 group-hover/btn:scale-125 transition-transform duration-[1200ms]" />
                    Direct Comms
                </Button>
            </div>
        </div>
    );
};

export default memo(TechSidePanel);
