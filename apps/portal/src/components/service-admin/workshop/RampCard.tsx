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
                "relative group cursor-pointer transition-all duration-300 ease-out h-[280px] will-change-transform",
                isSelected ? "z-30 scale-[1.02]" : "z-10 hover:z-20 hover:-translate-y-1 hover:scale-[1.02]"
            )}
        >
            {/* Outer Glass Card - Slow Cinematic Border */}
            <div className={cn(
                "h-full w-full rounded-xl border-2 flex flex-col p-1.5 transition-all duration-300 ease-out overflow-hidden relative shadow-sm group-hover:border-orange-500/50 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]",
                isAvailable ? "bg-emerald-500/5 border-emerald-500/10" :
                    isOccupied ? "bg-brand/5 border-brand/10 shadow-brand/5" : "bg-amber-500/5 border-amber-500/10",
                isSelected && (isAvailable ? "border-emerald-500/40 ring-4 ring-emerald-500/10 shadow-emerald-500/20" :
                    isOccupied ? "border-brand/40 ring-4 ring-brand/10 shadow-brand/20" : "border-amber-500/40 ring-4 ring-amber-500/10 shadow-amber-500/20")
            )}>
                {/* Slow Drifting Background Pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <div className={cn(
                        "absolute -top-12 -right-12 w-64 h-64 rounded-full blur-[80px] transition-all duration-700 group-hover:scale-125 group-hover:bg-orange-500",
                        isAvailable ? "bg-emerald-500" : isOccupied ? "bg-brand" : "bg-amber-500"
                    )} />
                </div>

                {/* Inner Content Area */}
                <div className="flex-1 rounded-lg bg-white dark:bg-[#080809] shadow-sm p-5 flex flex-col relative z-10 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 border shadow-sm group-hover:text-orange-500 group-hover:bg-orange-500/10 group-hover:border-orange-500/20",
                                isAvailable ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600" :
                                    isOccupied ? "bg-brand/5 border-brand/10 text-brand" : "bg-amber-500/5 border-amber-500/10 text-amber-500"
                            )}>
                                {isMaintenance ? <Settings2 size={22} className="opacity-80" /> : <Hammer size={22} className="opacity-80" />}
                            </div>
                            <div className="animate-in fade-in slide-in-from-left duration-500">
                                <h3 className="text-lg font-bold font-sans text-ink-heading dark:text-white tracking-tight group-hover:text-orange-500 transition-colors duration-300">{name}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full transition-colors duration-300",
                                        isAvailable ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" :
                                            isOccupied ? "bg-brand shadow-[0_0_8px_#eab308] animate-pulse" : "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
                                        "group-hover:bg-orange-500 group-hover:shadow-[0_0_8px_#f97316]"
                                    )} />
                                    <span className="text-xs font-medium text-ink-muted">
                                        System {status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-surface-page dark:bg-white/5 border border-surface-border dark:border-white/5 text-ink-muted group-hover:text-orange-500 group-hover:border-orange-500/30 transition-all duration-300">
                            <Activity size={16} />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        {isOccupied ? (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500 delay-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand/20 group-hover:via-orange-500/30 to-transparent transition-colors duration-300" />
                                    <span className="text-xs font-medium text-brand/60 group-hover:text-orange-500/80 transition-colors duration-300 whitespace-nowrap">Active Stream</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-brand/20 group-hover:from-orange-500/30 to-transparent transition-colors duration-300" />
                                </div>
                                <div className="text-center group-hover:translate-y-[-2px] transition-transform duration-500">
                                    <p className="text-sm font-bold font-sans text-ink-heading dark:text-white tracking-tight px-4 py-1.5 bg-brand/5 group-hover:bg-orange-500/10 rounded-full border border-brand/10 group-hover:border-orange-500/20 inline-block mb-2 shadow-sm transition-colors duration-300">
                                        {vehicleRegNo || '--- --- ---'}
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <Clock size={16} className="text-brand/50 group-hover:text-orange-500/60 transition-colors duration-300" />
                                        <span className="text-3xl font-bold font-sans text-brand tabular-nums tracking-tight group-hover:text-orange-500 transition-colors duration-300">
                                            {liveTime}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed border-surface-border/30 dark:border-white/5 rounded-xl group-hover:border-orange-500/30 group-hover:bg-orange-500/5 transition-all duration-300">
                                <p className={cn(
                                    "text-xs font-medium mb-1 opacity-70 group-hover:text-orange-500 transition-colors duration-300",
                                    isAvailable ? "text-emerald-600 dark:text-emerald-500" : "text-amber-600 dark:text-amber-500"
                                )}>
                                    {isAvailable ? "Station Idle" : "Offline"}
                                </p>
                                <p className="text-base font-medium font-sans text-ink-heading dark:text-white opacity-40 group-hover:text-orange-500/60 transition-colors duration-300">
                                    {isAvailable ? "De-Coupled" : "Locked"}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-surface-border dark:border-white/5 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                        {isOccupied && technician ? (
                            <div className="flex items-center gap-2.5">
                                <div className="relative group/avatar">
                                    <img
                                        src={technician.avatar}
                                        className="w-9 h-9 rounded-full object-cover ring-2 ring-brand/10 shadow-sm transition-transform duration-300"
                                        alt="tech"
                                        loading="lazy"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success border-2 border-white dark:border-black rounded-full shadow-sm" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium text-ink-muted">Controller</p>
                                    <p className="text-xs font-semibold text-ink-heading dark:text-white leading-none truncate max-w-[90px] group-hover:text-orange-500 transition-colors duration-300">{technician.name}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-ink-muted/50 group-hover:text-orange-500/60 transition-colors duration-300">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-medium">Protocol Secure</span>
                            </div>
                        )}
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-medium text-ink-muted/50 mb-0.5">Build</span>
                            <span className="text-[10px] font-medium py-1 px-2.5 rounded-md bg-surface-page dark:bg-white/5 text-ink-muted/70 border border-surface-border/50 group-hover:border-orange-500/20 group-hover:text-orange-500/80 transition-colors duration-300">
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
