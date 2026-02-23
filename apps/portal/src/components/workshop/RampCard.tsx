'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Hammer, Clock, User } from 'lucide-react';
import { Ramp } from '@/types/workshop';
import { useWorkshopStore } from '@/stores/workshopStore';

interface RampCardProps extends Ramp {
    onClick?: () => void;
}

const RampCard: React.FC<RampCardProps> = ({ id, name, status, assignedTechnicianId, currentJobCardId, vehicleRegNo, startTime, onClick }) => {
    const { technicians } = useWorkshopStore();

    // Find technician name
    const technician = technicians.find(t => t.id === assignedTechnicianId);

    const statusColors = {
        available: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
        occupied: 'bg-brand/10 border-brand/20 text-brand shadow-[0_0_20px_rgba(234,179,8,0.1)]',
        maintenance: 'bg-amber-500/10 border-amber-500/20 text-amber-600'
    };

    const statusBadge = {
        available: { color: 'bg-emerald-500', text: 'Available' },
        occupied: { color: 'bg-brand', text: 'Occupied' },
        maintenance: { color: 'bg-amber-500', text: 'Maintenance' }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative flex flex-col p-5 rounded-3xl border-2 transition-all duration-500 group cursor-pointer hover:shadow-2xl overflow-hidden",
                statusColors[status],
                status === 'available' ? 'hover:border-emerald-500/40 hover:bg-emerald-500/[0.15]' :
                    status === 'occupied' ? 'hover:border-brand/40 hover:bg-brand/[0.15]' : 'hover:border-amber-500/40 hover:bg-amber-500/[0.15]'
            )}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-3 rounded-2xl bg-white/90 dark:bg-black/40 backdrop-blur-md shadow-inner border border-white/20 transition-transform duration-500 group-hover:scale-110",
                        status === 'available' ? 'text-emerald-600' : status === 'occupied' ? 'text-brand' : 'text-amber-600'
                    )}>
                        <Hammer size={24} className={status === 'occupied' ? "animate-bounce-slow" : ""} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-ink-heading dark:text-white group-hover:tracking-wider transition-all duration-500">{name}</h3>
                        <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest opacity-60">ID: {id}</p>
                    </div>
                </div>
                <span className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 dark:bg-black/40 backdrop-blur-md shadow-sm border border-white/20",
                    status === 'available' ? 'text-emerald-600' : status === 'occupied' ? 'text-brand' : 'text-amber-600'
                )}>
                    <span className={cn("w-2 h-2 rounded-full", statusBadge[status].color, status === 'occupied' && "animate-pulse")}></span>
                    {statusBadge[status].text}
                </span>
            </div>

            <div className="flex-1 flex flex-col justify-end space-y-4 relative z-10">
                {status === 'occupied' ? (
                    <>
                        <div className="p-4 bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/5 space-y-2 group-hover:translate-y-[-4px] transition-transform duration-500">
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest opacity-70">Current Work</p>
                                <div className="flex items-center gap-1 text-brand">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-black">45m elapsed</span>
                                </div>
                            </div>
                            <p className="text-base font-black text-ink-heading dark:text-white leading-tight">{vehicleRegNo || 'N/A'}</p>
                            <p className="text-[11px] font-bold text-brand uppercase tracking-wider">JOB: #{currentJobCardId}</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-black shadow-lg shadow-brand/20">
                                    {technician?.name?.charAt(0) || 'T'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest opacity-60">Technician</p>
                                    <span className="text-sm font-black text-ink-heading dark:text-white">{technician?.name || 'Unassigned'}</span>
                                </div>
                            </div>
                            <div className="p-2 bg-brand/5 rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-all duration-500">
                                <User size={16} />
                            </div>
                        </div>
                    </>
                ) : status === 'available' ? (
                    <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-emerald-500/20 rounded-2xl bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500">
                        <p className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs">Ready</p>
                        <p className="text-[10px] text-emerald-600/60 font-medium">Await Assignment</p>
                    </div>
                ) : (
                    <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-amber-500/20 rounded-2xl bg-amber-500/5 transition-colors duration-500">
                        <p className="text-amber-600 font-black uppercase tracking-[0.2em] text-xs">Offline</p>
                        <p className="text-[10px] text-amber-600/60 font-medium">Service Required</p>
                    </div>
                )}
            </div>

            {/* Decoration Element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};

export default RampCard;
