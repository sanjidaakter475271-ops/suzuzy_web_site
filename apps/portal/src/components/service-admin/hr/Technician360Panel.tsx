'use client';

import React, { useMemo } from 'react';
import { 
    X, User, Mail, Phone, MapPin, 
    Briefcase, Calendar, Clock, 
    TrendingUp, Star, Zap, Hammer,
    Activity, ShieldCheck, FileText,
    ExternalLink, AlertCircle, PhoneCall, Trash2, Maximize2
} from 'lucide-react';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle 
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Technician } from '@/types/service-admin/workshop';
import { format } from 'date-fns';
import { ServiceTree } from './ServiceTree';

interface Technician360PanelProps {
    technician: Technician | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const Technician360Panel: React.FC<Technician360PanelProps> = ({
    technician,
    isOpen,
    onClose,
    onApprove,
    onDelete
}) => {
    if (!technician) return null;

    const isPending = technician.status === 'pending';

    const statusColors = {
        active: "bg-emerald-500",
        busy: "bg-amber-500",
        break: "bg-blue-500",
        offline: "bg-slate-400",
        pending: "bg-indigo-500"
    };

    const displayStatus = technician.currentStatus || technician.status;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[95%] sm:w-[500px] lg:w-[600px] p-0 border-l border-white/10 bg-[#0a0a0b] text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <ScrollArea className="h-full">
                    {/* Premium Header */}
                    <div className="p-8 pb-4 relative z-10">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="relative shrink-0 group">
                                    <div className="absolute inset-0 bg-brand blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                                    <img
                                        src={technician.avatar}
                                        className="w-24 h-24 rounded-[2.5rem] object-cover ring-4 ring-brand/10 shadow-2xl relative z-10 transition-transform duration-1000 group-hover:scale-105"
                                        alt={technician.name}
                                    />
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-7 h-7 border-[5px] border-[#0a0a0b] rounded-full shadow-lg z-20 transition-all duration-500",
                                        statusColors[displayStatus as keyof typeof statusColors] || "bg-slate-400"
                                    )} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none italic">
                                        {technician.name}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20 text-[9px] font-black tracking-[0.2em] uppercase py-1">
                                            {technician.designation || 'Specialist Agent'}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                                            ID: {technician.id.split('-')[0]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={onClose}
                                className="rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-brand hover:bg-white/10 transition-all"
                            >
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Top Metrics Row */}
                        <div className="grid grid-cols-3 gap-3">
                            <MetricBox 
                                icon={TrendingUp} 
                                label="Efficiency" 
                                value="94%" 
                                color="text-brand" 
                                delay={0}
                            />
                            <MetricBox 
                                icon={Briefcase} 
                                label="Active Jobs" 
                                value={technician.activeJobs.toString()} 
                                color="text-emerald-500" 
                                delay={100}
                            />
                            <MetricBox 
                                icon={Star} 
                                label="Rating" 
                                value="4.8" 
                                color="text-amber-500" 
                                delay={200}
                            />
                        </div>
                    </div>

                    <div className="px-8 pb-12 relative z-10 mt-4">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="w-full bg-white/5 border border-white/10 p-1 h-12 rounded-2xl mb-8">
                                <TabsTrigger value="overview" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-brand data-[state=active]:text-white transition-all">Overview</TabsTrigger>
                                <TabsTrigger value="attendance" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-brand data-[state=active]:text-white transition-all">Live Status</TabsTrigger>
                                <TabsTrigger value="history" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-brand data-[state=active]:text-white transition-all">Leaves</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Profile Details */}
                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-brand" /> Core Profile Stream
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InfoField icon={Mail} label="System Email" value={technician.email || 'N/A'} />
                                        <InfoField icon={Phone} label="Primary Contact" value={technician.phone || 'N/A'} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoField icon={MapPin} label="Hometown" value={technician.hometown || 'Not Specified'} />
                                            <InfoField icon={PhoneCall} label="Emergency Line" value={technician.emergencyPhone || 'N/A'} />
                                        </div>
                                    </div>
                                </section>

                                {/* Workload Stream */}
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-2">
                                            <Zap size={14} className="text-brand" /> Active Workload stream
                                        </h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`/service-admin/workshop/technicians/${technician.id}/visual-tree`, '_blank')}
                                            className="h-8 rounded-xl border-brand/20 bg-brand/5 text-brand text-[8px] font-black uppercase tracking-widest hover:bg-brand hover:text-white transition-all gap-2"
                                        >
                                            <Maximize2 size={12} /> View Details
                                        </Button>
                                    </div>
                                    {technician.job_cards && technician.job_cards.length > 0 ? (
                                        <div className="space-y-3">
                                            {technician.job_cards.map((job: any, idx: number) => (
                                                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-[1.5rem] flex items-center justify-between group hover:border-brand/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-xs border border-brand/20">
                                                            #{idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black uppercase tracking-tight italic">Session #{job.service_tickets?.service_number || '???'}</p>
                                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{job.status}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-white/20 group-hover:text-brand transition-colors">
                                                        <ExternalLink size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-40">
                                            <Hammer size={32} strokeWidth={1} className="mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No active deployments found</p>
                                        </div>
                                    )}
                                </section>
                            </TabsContent>

                            <TabsContent value="attendance" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-2">
                                        <Clock size={14} className="text-brand" /> Today's Live Uplink
                                    </h4>
                                    <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Current Status</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", statusColors[displayStatus as keyof typeof statusColors] || "bg-slate-400")} />
                                                    <span className="text-xl font-black uppercase italic tracking-tighter">{displayStatus}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Duty Time</p>
                                                <span className="text-xl font-black tabular-nums tracking-tighter italic">--:--:--</span>
                                            </div>
                                        </div>

                                        <Separator className="bg-white/5" />

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Daily Session History</p>
                                            {technician.todaySessions && technician.todaySessions.length > 0 ? (
                                                <div className="space-y-3">
                                                    {technician.todaySessions.map((session: any, sIdx: number) => (
                                                        <div key={sIdx} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                <Clock size={14} className="text-emerald-500" />
                                                                <span className="text-[11px] font-bold tracking-tight uppercase">Clock In: {format(new Date(session.clock_in), 'hh:mm a')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {session.clock_out ? (
                                                                    <span className="text-[11px] font-bold tracking-tight uppercase opacity-50">Clock Out: {format(new Date(session.clock_out), 'hh:mm a')}</span>
                                                                ) : (
                                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] uppercase font-black">Active</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-white/20 italic">No attendance records for today</p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </TabsContent>

                            <TabsContent value="history" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-2">
                                        <FileText size={14} className="text-brand" /> Leave Log stream
                                    </h4>
                                    <div className="space-y-3">
                                        {technician.leave_requests && technician.leave_requests.length > 0 ? (
                                            technician.leave_requests.map((request: any, lIdx: number) => (
                                                <div key={lIdx} className="p-5 bg-white/5 border border-white/5 rounded-[1.8rem] space-y-3 hover:border-white/10 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20 text-[8px] font-black uppercase py-0.5">
                                                            {request.leave_type}
                                                        </Badge>
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest",
                                                            request.status === 'approved' ? "text-emerald-500" : 
                                                            request.status === 'rejected' ? "text-rose-500" : "text-amber-500"
                                                        )}>
                                                            {request.status}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-white/80 line-clamp-2 italic tracking-tight">"{request.reason}"</p>
                                                        <div className="flex items-center gap-3 mt-3 opacity-40">
                                                            <Calendar size={12} />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                                {format(new Date(request.start_date), 'MMM dd')} - {format(new Date(request.end_date), 'MMM dd, yyyy')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-10 rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-40">
                                                <AlertCircle size={32} strokeWidth={1} className="mb-4" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No leave requests found</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </TabsContent>
                        </Tabs>
                    </div>
                </ScrollArea>

                {/* Management Actions Footer */}
                <div className="p-8 border-t border-white/5 bg-[#0d0d0f] flex gap-4 relative z-20">
                    {isPending ? (
                        <Button
                            onClick={() => onApprove?.(technician.id)}
                            className="flex-1 bg-brand hover:bg-brand-dark text-white rounded-2xl h-14 font-black uppercase tracking-widest transition-all shadow-lg shadow-brand/20 gap-2"
                        >
                            <ShieldCheck size={18} /> Authorize Agent
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            className="flex-1 border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl h-14 font-black uppercase tracking-widest transition-all gap-2"
                        >
                            <PhoneCall size={18} /> Direct Uplink
                        </Button>
                    )}

                    <Button
                        onClick={() => onDelete?.(technician.id)}
                        variant="outline"
                        className="w-14 h-14 rounded-2xl border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                        title={isPending ? "Reject Application" : "Remove Agent"}
                    >
                        <Trash2 size={20} />
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

// Internal helper components
function MetricBox({ icon: Icon, label, value, color, delay }: any) {
    return (
        <div 
            className="p-4 bg-white/5 border border-white/5 rounded-[1.8rem] flex flex-col items-center gap-2 transition-all hover:border-white/10 group/stat animate-in fade-in zoom-in-95" 
            style={{ animationDelay: `${delay}ms` }}
        >
            <Icon size={18} className={cn("mb-1 group-hover/stat:scale-125 transition-transform duration-700", color)} />
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{label}</span>
            <span className={cn("text-lg font-black tracking-tighter italic leading-none", color)}>{value}</span>
        </div>
    );
}

function InfoField({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[1.8rem] flex items-center gap-5 group hover:bg-white/[0.04] transition-all">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-brand transition-colors">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-black tracking-tight text-white/90">{value}</p>
            </div>
        </div>
    );
}
