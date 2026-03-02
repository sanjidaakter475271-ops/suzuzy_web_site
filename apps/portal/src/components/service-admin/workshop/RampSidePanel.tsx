'use client';

import React, { memo, useEffect, useState, useMemo } from 'react';
import { Ramp } from '@/types/service-admin/workshop';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import {
    X, Hammer, User, Car, Clock, Settings2, ShieldCheck,
    Play, Pause, CheckCircle2, Trash2, Calendar, Activity,
    ArrowRight, Sparkles, AlertCircle, History
} from 'lucide-react';
import { Button } from '@/components/service-admin/ui';
import { cn } from '@/lib/utils';

interface RampSidePanelProps {
    ramp: Ramp | null;
    onClose: () => void;
    onAssignClick: () => void;
}

const RampSidePanel: React.FC<RampSidePanelProps> = ({ ramp, onClose, onAssignClick }) => {
    const updateRampStatus = useWorkshopStore(state => state.updateRampStatus);
    const releaseRamp = useWorkshopStore(state => state.releaseRamp);
    const technicians = useWorkshopStore(state => state.technicians);

    const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

    const technician = useMemo(() =>
        technicians.find(t => t.id === ramp?.assignedTechnicianId),
        [technicians, ramp?.assignedTechnicianId]);

    useEffect(() => {
        if (!ramp || ramp.status !== 'occupied' || !ramp.startTime) {
            setElapsedTime('00:00:00');
            return;
        }

        const interval = setInterval(() => {
            const start = new Date(ramp.startTime!).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, now - start);

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setElapsedTime(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [ramp?.startTime, ramp?.status]);

    if (!ramp) return null;

    return (
        <div className="w-full lg:w-[480px] bg-white dark:bg-[#0a0a0b] h-full flex flex-col relative overflow-hidden group/panel border-l border-surface-border dark:border-white/5 transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_0_100px_rgba(0,0,0,0.2)]">
            {/* Ultra Smooth Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 transition-all duration-[3000ms] group-hover/panel:scale-125" />

            {/* Cinematic Header */}
            <div className="p-10 pb-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-[1500ms] ease-out">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                        <div className={cn(
                            "w-16 h-16 rounded-[2rem] flex items-center justify-center border shadow-2xl transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
                            ramp.status === 'available' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600" :
                                ramp.status === 'occupied' ? "bg-brand/10 border-brand/20 text-brand scale-110 shadow-brand/20 ring-[8px] ring-brand/5" :
                                    "bg-amber-500/5 border-amber-500/10 text-amber-500"
                        )}>
                            <Hammer size={32} className={ramp.status === 'occupied' ? "animate-bounce-slow" : "opacity-40"} />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-ink-heading dark:text-white uppercase tracking-tight tabular-nums leading-none">
                                {ramp.name}
                            </h2>
                            <p className="text-[10px] font-black text-brand uppercase tracking-[0.5em] mt-3 animate-pulse duration-[3000ms]">
                                Terminal Active
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-page dark:bg-white/5 border border-surface-border dark:border-white/10 text-ink-muted hover:text-brand hover:scale-110 transition-all duration-700 active:scale-95"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { l: 'Efficiency', v: '92%', c: 'text-emerald-500' },
                        { l: 'Uptime', v: '99.8%', c: 'text-indigo-500' },
                        { l: 'Stability', v: 'Optimum', c: 'text-brand' }
                    ].map((s, i) => (
                        <div key={i} className="px-5 py-3 bg-white dark:bg-black/20 rounded-2xl border border-surface-border dark:border-white/5 flex flex-col items-center gap-1.5 shadow-sm animate-in fade-in duration-1000" style={{ animationDelay: `${i * 200}ms` }}>
                            <span className="text-[8px] font-black text-ink-muted uppercase tracking-[0.2em]">{s.l}</span>
                            <span className={cn("text-[11px] font-black uppercase tracking-tighter", s.c)}>{s.v}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Body with Staggered Entry */}
            <div className="flex-1 overflow-y-auto p-10 pt-4 custom-scrollbar space-y-10 relative z-10 scroll-smooth">
                {ramp.status === 'occupied' ? (
                    <div className="space-y-10">
                        {/* Session Timer Card - Extra Smooth */}
                        <div className="p-10 rounded-[3.5rem] bg-gradient-to-br from-brand/10 to-transparent border-2 border-brand/20 relative overflow-hidden group shadow-[0_40px_100px_rgba(234,179,8,0.15)] animate-in fade-in zoom-in-95 duration-[1200ms]">
                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <div className="p-4 rounded-full bg-brand/10 text-brand border border-brand/20 animate-spin-slow duration-[8000ms]">
                                    <Clock size={28} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[11px] font-black text-brand uppercase tracking-[0.4em] opacity-60">Session Elapsed</p>
                                    <div className="text-6xl lg:text-7xl font-black text-brand tabular-nums tracking-tighter filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]">
                                        {elapsedTime}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-4 py-1.5 bg-brand text-white text-[10px] font-black rounded-xl uppercase shadow-xl shadow-brand/30 tracking-widest border border-white/20">
                                        Live Analytics
                                    </span>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all duration-[2000ms] group-hover:scale-125">
                                <Activity size={100} strokeWidth={1} />
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-[1500ms] delay-[400ms]">
                            <div className="group relative">
                                <div className="absolute inset-0 bg-brand/10 rounded-[2.5rem] blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-[1200ms]" />
                                <div className="relative p-7 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/10 rounded-[2.5rem] flex items-center gap-6 backdrop-blur-xl transition-all duration-1000 group-hover:border-brand/40">
                                    <div className="w-16 h-16 rounded-[1.8rem] bg-brand text-white flex items-center justify-center shadow-2xl transition-transform duration-1000 group-hover:rotate-[360deg]">
                                        <Car size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em] mb-1.5 opacity-60">Vehicle Deployment</p>
                                        <h4 className="text-2xl font-black text-ink-heading dark:text-white truncate tracking-tighter uppercase">{ramp.vehicleRegNo}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-black text-brand/80 px-2 py-0.5 border border-brand/20 rounded-md uppercase tracking-wider bg-brand/5">J-ID: {ramp.currentJobCardId}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-0 bg-emerald-500/10 rounded-[2.5rem] blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-[1200ms]" />
                                <div className="relative p-7 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/10 rounded-[2.5rem] flex items-center gap-6 backdrop-blur-xl transition-all duration-1000 group-hover:border-emerald-500/40">
                                    <div className="relative shrink-0 transition-transform duration-1000 group-hover:scale-110">
                                        <img
                                            src={technician?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(technician?.name || 'T')}&background=EAB308&color=fff`}
                                            className="w-16 h-16 rounded-[1.8rem] object-cover ring-4 ring-emerald-500/10 shadow-2xl"
                                            loading="lazy"
                                            alt="tech"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-[5px] border-white dark:border-[#0a0a0b] rounded-full shadow-lg" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.3em] mb-1.5 opacity-60">Module Specialist</p>
                                        <h4 className="text-2xl font-black text-ink-heading dark:text-white truncate tracking-tighter uppercase">{technician?.name || 'Authorized Personnel'}</h4>
                                        <div className="flex items-center gap-4 mt-2 text-ink-muted text-[10px] font-black tracking-widest uppercase">
                                            <span className="flex items-center gap-1.5 text-emerald-500"><Sparkles size={12} /> Rank A</span>
                                            <span className="opacity-40">Lv: 7</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Log Overlay */}
                        <div className="p-8 bg-surface-page dark:bg-black/40 rounded-[2.5rem] border border-surface-border dark:border-white/5 space-y-6 animate-in fade-in duration-[2000ms] delay-[800ms]">
                            <h5 className="text-[10px] font-black text-ink-muted/60 uppercase tracking-[0.4em] flex items-center gap-3">
                                <ShieldCheck size={16} className="text-brand/40" />
                                Operational Protocol Log
                            </h5>
                            <div className="space-y-4">
                                {[
                                    { t: '10:45 AM', e: 'Terminal Initialization', s: 'Verified' },
                                    { t: '11:12 AM', e: 'Specialist Authorized', s: 'Access-OK' },
                                    { t: 'ACTIVE', e: 'Stream Mechanical Analysis', s: 'Running' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-[11px] font-black group/log px-2 py-1 transition-colors hover:bg-white/[0.02] rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand/30 group-hover:bg-brand transition-colors" />
                                            <span className="text-ink-muted/80">{item.e}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] text-brand/40">{item.s}</span>
                                            <span className="text-brand tabular-nums tracking-widest">{item.t}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10 animate-in zoom-in-95 duration-[1500ms] ease-out">
                        <div className="p-16 rounded-[4rem] border-2 border-dashed border-surface-border dark:border-white/5 flex flex-col items-center justify-center text-center space-y-8 group/placeholder transition-all duration-1000 hover:bg-white/[0.01] hover:border-brand/20">
                            <div className="w-32 h-32 rounded-[3.5rem] bg-surface-page dark:bg-white/5 flex items-center justify-center text-ink-muted/20 group-hover/placeholder:scale-110 group-hover/placeholder:rotate-12 group-hover/placeholder:text-brand/40 transition-all duration-[1500ms] border border-transparent group-hover/placeholder:border-brand/20">
                                <Settings2 size={56} strokeWidth={1} />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tighter opacity-80">Standby Protocol</h4>
                                <p className="text-sm text-ink-muted/50 font-medium max-w-[240px] mx-auto leading-loose uppercase tracking-[0.1em]">Bay is currently in idle state. Awaiting deployment signal.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-5 w-full pt-6">
                                <button onClick={() => updateRampStatus(ramp.id, 'available')} className={cn("p-8 rounded-[2.5rem] border-2 transition-all duration-1000 ease-out flex flex-col items-center group/btn", ramp.status === 'available' ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 shadow-2xl shadow-emerald-500/10" : "border-surface-border dark:border-white/5 text-ink-muted/40 hover:border-emerald-500/30 hover:text-emerald-500")}>
                                    <CheckCircle2 size={40} className="mb-4 transition-transform duration-1000 group-hover/btn:scale-110" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Ready</span>
                                </button>
                                <button onClick={() => updateRampStatus(ramp.id, 'maintenance')} className={cn("p-8 rounded-[2.5rem] border-2 transition-all duration-1000 ease-out flex flex-col items-center group/btn", ramp.status === 'maintenance' ? "border-amber-500 bg-amber-500/5 text-amber-600 shadow-2xl shadow-amber-500/10" : "border-surface-border dark:border-white/5 text-ink-muted/40 hover:border-amber-500/30 hover:text-amber-500")}>
                                    <AlertCircle size={40} className="mb-4 transition-transform duration-1000 group-hover/btn:scale-110" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Locked</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6 animate-in fade-in duration-[2000ms] delay-[600ms]">
                            <h5 className="text-[11px] font-black text-ink-muted/40 uppercase tracking-[0.5em] flex items-center justify-center gap-4">
                                <div className="h-px w-8 bg-surface-border" />
                                History Stream
                                <div className="h-px w-8 bg-surface-border" />
                            </h5>
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="p-5 rounded-3xl bg-white dark:bg-white/[0.01] border border-surface-border dark:border-white/5 flex items-center justify-between transition-all duration-700 hover:border-brand/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-surface-page dark:bg-white/5 flex items-center justify-center text-ink-muted/40"><User size={18} /></div>
                                            <p className="text-xs font-black text-ink-heading dark:text-white uppercase tracking-tighter">DHK-METRO-KA-785{i}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Done</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Control Footer - Ultra Smooth */}
            <div className="p-10 border-t border-surface-border dark:border-white/5 relative z-10 bg-white dark:bg-[#0a0a0b] animate-in slide-in-from-bottom-8 duration-[1500ms] delay-[1000ms]">
                {ramp.status === 'occupied' ? (
                    <Button variant="danger" className="w-full py-8 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.5em] shadow-2xl shadow-danger/20 hover:-translate-y-2 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95 group/btn" onClick={() => { if (window.confirm("Release?")) releaseRamp(ramp.id); onClose(); }}>
                        <Trash2 size={24} className="mr-3 group-hover/btn:rotate-12 transition-transform duration-1000" /> Disconnect Terminal
                    </Button>
                ) : ramp.status === 'available' ? (
                    <Button className="w-full py-8 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.6em] shadow-[0_30px_60px_rgba(234,179,8,0.3)] hover:-translate-y-2 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-95 group/btn" onClick={onAssignClick}>
                        <Play size={24} className="mr-3 group-hover/btn:translate-x-1 transition-transform duration-1000" /> Initialize Stream
                    </Button>
                ) : (
                    <div className="text-center p-6 py-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 animate-pulse duration-[3000ms]">
                        <p className="text-[12px] font-black text-amber-600 uppercase tracking-[0.6em] mb-1">Maintenance Locked</p>
                        <p className="text-[9px] font-bold text-amber-500/40 uppercase tracking-widest">Manual Override Required</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(RampSidePanel);
