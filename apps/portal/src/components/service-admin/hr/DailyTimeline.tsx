'use client';

import React, { useMemo } from 'react';
import { format, startOfDay, addHours, isWithinInterval, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Technician } from '@/types/service-admin/workshop';
import { 
    Clock, 
    User,
    ChevronLeft,
    ChevronRight,
    Zap,
    Coffee,
    Activity
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DailyTimelineProps {
    technicians: Technician[];
    isLoading?: boolean;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export const DailyTimeline: React.FC<DailyTimelineProps> = ({ technicians, isLoading }) => {
    const today = startOfDay(new Date());

    return (
        <div className="bg-white dark:bg-[#0D0D0F] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden relative group/timeline">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
            
            <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                            Deployment <span className="text-brand">Timeline</span>
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily operational cycle stream</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-100 dark:border-white/5">
                    <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-brand"><ChevronLeft size={16} /></button>
                    <span className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 italic">{format(new Date(), 'MMMM dd, yyyy')}</span>
                    <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-brand"><ChevronRight size={16} /></button>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[1000px] p-8">
                    {/* Timeline Header (Hours) */}
                    <div className="flex mb-8 border-b border-slate-50 dark:border-white/5 pb-4">
                        <div className="w-48 shrink-0">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Agent Profile</span>
                        </div>
                        <div className="flex-1 flex justify-between px-4">
                            {HOURS.map(hour => (
                                <div key={hour} className="text-center relative">
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tabular-nums">
                                        {hour > 12 ? `${hour - 12} PM` : `${hour} ${hour === 12 ? 'PM' : 'AM'}`}
                                    </span>
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-px h-4 bg-slate-100 dark:bg-white/5" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Rows */}
                    <div className="space-y-6 relative">
                        {/* Hour vertical grid lines */}
                        <div className="absolute inset-y-0 left-48 right-0 flex justify-between px-4 pointer-events-none opacity-20">
                            {HOURS.map(hour => (
                                <div key={hour} className="w-px h-full bg-slate-200 dark:bg-white/10" />
                            ))}
                        </div>

                        {technicians.map((tech, techIdx) => (
                            <div key={tech.id} className="flex items-center group/row animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${techIdx * 100}ms` }}>
                                {/* Tech info */}
                                <div className="w-48 shrink-0 flex items-center gap-4">
                                    <div className="relative">
                                        <img src={tech.avatar} className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand/10 grayscale group-hover/row:grayscale-0 transition-all shadow-lg" alt={tech.name} />
                                        <div className={cn(
                                            "absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-[#0D0D0F] rounded-full shadow-lg",
                                            tech.currentStatus === 'active' ? 'bg-emerald-500' : tech.currentStatus === 'break' ? 'bg-amber-500' : 'bg-slate-400'
                                        )} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tight truncate group-hover/row:text-brand transition-colors">{tech.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{tech.designation || 'Specialist'}</p>
                                    </div>
                                </div>

                                {/* Timeline Bar Area */}
                                <div className="flex-1 h-12 relative bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden group-hover/row:border-brand/20 transition-all shadow-inner">
                                    {tech.todaySessions?.map((session, sIdx) => {
                                        const sessionStart = new Date(session.clock_in);
                                        const sessionEnd = session.clock_out ? new Date(session.clock_out) : new Date();
                                        
                                        // Calculate position and width percentages
                                        const startHour = 8;
                                        const totalHours = 12; // 8 AM to 8 PM
                                        const totalMinutes = totalHours * 60;
                                        
                                        const getOffsetMinutes = (date: Date) => {
                                            const h = date.getHours();
                                            const m = date.getMinutes();
                                            return Math.max(0, Math.min(totalMinutes, (h - startHour) * 60 + m));
                                        };

                                        const startMin = getOffsetMinutes(sessionStart);
                                        const endMin = getOffsetMinutes(sessionEnd);
                                        const widthPct = ((endMin - startMin) / totalMinutes) * 100;
                                        const leftPct = (startMin / totalMinutes) * 100;

                                        return (
                                            <div 
                                                key={sIdx}
                                                className="absolute inset-y-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center px-3 overflow-hidden group/bar hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer"
                                                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                                                title={`Session ${format(sessionStart, 'HH:mm')} - ${session.clock_out ? format(sessionEnd, 'HH:mm') : 'NOW'}`}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter truncate z-10">
                                                    Session {format(sessionStart, 'HH:mm')} - {session.clock_out ? format(sessionEnd, 'HH:mm') : 'NOW'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Legend */}
            <div className="p-8 bg-slate-50/50 dark:bg-white/[0.01] border-t border-slate-50 dark:border-white/5 flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Duty</span>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                    <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/50" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strategic Break</span>
                </div>
                <div className="ml-auto text-[9px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                    <Activity size={12} className="animate-pulse text-brand" /> Live Stream Sync Active
                </div>
            </div>
        </div>
    );
};
