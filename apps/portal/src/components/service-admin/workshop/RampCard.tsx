'use client';

import React, { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Hammer, Clock, User, Settings2, ShieldCheck, Activity } from 'lucide-react';
import { Ramp } from '@/types/service-admin/workshop';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';

interface RampCardProps extends Ramp {
    onClick?: () => void;
    isSelected?: boolean;
}

const RampCard: React.FC<RampCardProps> = ({ id, name, status, assignedTechnicianId, currentJobCardId, vehicleRegNo, startTime, onClick, isSelected }) => {
    const technicians = useWorkshopStore(state => state.technicians);

    const technician = React.useMemo(() =>
        technicians.find(t => t.id === assignedTechnicianId)
        , [technicians, assignedTechnicianId]);

    const isOccupied = status === 'occupied';
    const isAvailable = status === 'available';
    const isMaintenance = status === 'maintenance';

    const [liveTime, setLiveTime] = useState<string>('00:00');

    useEffect(() => {
        if (!isOccupied || !startTime) return;

        const updateTimer = () => {
            const diff = Math.max(0, new Date().getTime() - new Date(startTime).getTime());
            const mins = Math.floor(diff / 60000);
            const hrs = Math.floor(mins / 60);
            const secs = Math.floor((diff % 60000) / 1000);

            if (hrs > 0) {
                setLiveTime(`${hrs}h ${mins % 60}m`);
            } else {
                setLiveTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [isOccupied, startTime]);

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative group cursor-pointer transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] h-[280px] will-change-transform",
                isSelected ? "z-30 scale-[1.03]" : "z-10 hover:z-20 hover:scale-[1.015]"
            )}
        >
            {/* Outer Glass Card - Slow Cinematic Border */}
            <div className={cn(
                "h-full w-full rounded-[2.5rem] border-2 flex flex-col p-1.5 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden relative shadow-2xl",
                isAvailable ? "bg-emerald-500/5 border-emerald-500/10" :
                    isOccupied ? "bg-brand/5 border-brand/10 shadow-brand/5" : "bg-amber-500/5 border-amber-500/10",
                isSelected && (isAvailable ? "border-emerald-500/40 ring-[12px] ring-emerald-500/10 shadow-emerald-500/20" :
                    isOccupied ? "border-brand/40 ring-[12px] ring-brand/10 shadow-brand/20" : "border-amber-500/40 ring-[12px] ring-amber-500/10 shadow-amber-500/20")
            )}>
                {/* Slow Drifting Background Pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 group-hover:opacity-30 transition-opacity duration-1000">
                    <div className={cn(
                        "absolute -top-12 -right-12 w-64 h-64 rounded-full blur-[100px] transition-all duration-[2000ms] group-hover:scale-150",
                        isAvailable ? "bg-emerald-500" : isOccupied ? "bg-brand" : "bg-amber-500"
                    )} />
                </div>

                {/* Inner Content Area */}
                <div className="flex-1 rounded-[2.1rem] bg-white dark:bg-black/60 shadow-inner p-5 flex flex-col relative z-10 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border shadow-lg",
                                isAvailable ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600" :
                                    isOccupied ? "bg-brand/5 border-brand/10 text-brand animate-pulse" : "bg-amber-500/5 border-amber-500/10 text-amber-500"
                            )}>
                                {isMaintenance ? <Settings2 size={22} className="opacity-60" /> : <Hammer size={22} className="opacity-80" />}
                            </div>
                            <div className="animate-in fade-in slide-in-from-left duration-1000">
                                <h3 className="text-xl font-black text-ink-heading dark:text-white tracking-tighter uppercase">{name}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        isAvailable ? "bg-emerald-500 shadow-[0_0_12px_#10b981]" :
                                            isOccupied ? "bg-brand shadow-[0_0_12px_#eab308] animate-pulse" : "bg-amber-500 shadow-[0_0_12px_#f59e0b]"
                                    )} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-ink-muted leading-none">
                                        System {status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-page dark:bg-white/5 border border-surface-border dark:border-white/5 text-ink-muted hover:text-brand transition-all duration-500">
                            <Activity size={16} />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        {isOccupied ? (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-1000 delay-300">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
                                    <span className="text-[9px] font-black text-brand/60 uppercase tracking-[0.3em] whitespace-nowrap">Active Stream</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-brand/20 to-transparent" />
                                </div>
                                <div className="text-center group-hover:translate-y-[-2px] transition-transform duration-1000">
                                    <p className="text-sm font-black text-ink-heading dark:text-white tracking-tighter px-4 py-1.5 bg-brand/5 rounded-full border border-brand/10 inline-block mb-2 shadow-sm">
                                        {vehicleRegNo || '--- --- ---'}
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <Clock size={16} className="text-brand/40 animate-spin-slow" />
                                        <span className="text-3xl font-black text-brand tabular-nums tracking-tighter drop-shadow-md">
                                            {liveTime}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed border-surface-border/30 dark:border-white/5 rounded-[2rem] group-hover:border-brand/20 group-hover:bg-brand/[0.01] transition-all duration-1000 delay-200">
                                <p className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.5em] mb-1 opacity-60",
                                    isAvailable ? "text-emerald-500" : "text-amber-500"
                                )}>
                                    {isAvailable ? "STATION IDLE" : "OFFLINE"}
                                </p>
                                <p className="text-xl font-black text-ink-heading dark:text-white opacity-20 italic tracking-tighter uppercase">
                                    {isAvailable ? "De-Coupled" : "Locked"}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-surface-border dark:border-white/5 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
                        {isOccupied && technician ? (
                            <div className="flex items-center gap-2.5">
                                <div className="relative group/avatar">
                                    <img
                                        src={technician.avatar}
                                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand/10 shadow-lg group-hover/avatar:scale-110 transition-transform duration-700"
                                        alt="tech"
                                        loading="lazy"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success border-2 border-white dark:border-black rounded-full shadow-sm" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] font-black text-ink-muted uppercase tracking-wider">Controller</p>
                                    <p className="text-[11px] font-black text-ink-heading dark:text-white leading-none truncate max-w-[90px] uppercase">{technician.name}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-ink-muted/40">
                                <ShieldCheck size={14} />
                                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Protocol Secure</span>
                            </div>
                        )}
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-ink-muted/30 uppercase tracking-widest mb-0.5">Build</span>
                            <span className="text-[9px] font-black py-1 px-2.5 rounded-lg bg-surface-page dark:bg-white/5 text-ink-muted/60 uppercase tracking-tighter border border-surface-border/50">
                                VX-9
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(RampCard);
