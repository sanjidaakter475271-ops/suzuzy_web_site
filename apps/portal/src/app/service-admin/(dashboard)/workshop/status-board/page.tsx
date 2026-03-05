'use client';

import React, { memo, useMemo, useState } from 'react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, AlertCircle, Wrench, Search, LayoutGrid, LayoutList, User } from 'lucide-react';
import { Card, CardContent } from '@/components/service-admin/ui';

const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { label: string; color: string; bg: string; icon: any }> = {
        'received': { label: 'Pending', color: 'text-brand', bg: 'bg-brand/10', icon: Clock },
        'in-service': { label: 'Active', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Wrench },
        'qc-done': { label: 'Ready', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
        'delivered': { label: 'Delivered', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: CheckCircle2 },
        'waiting-parts': { label: 'Waiting Parts', color: 'text-danger', bg: 'bg-danger/10', icon: AlertCircle },
    };

    const s = config[status] || config['received'];
    const Icon = s.icon;

    return (
        <div className={cn("px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-current/10 shrink-0", s.bg, s.color)}>
            <Icon size={12} strokeWidth={2.5} />
            <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
        </div>
    );
};

const JobCardCompact = memo(({ job }: { job: any }) => {
    const technicians = useWorkshopStore(state => state.technicians);

    const technicianName = useMemo(() => {
        if (!job.assignedTechnicianId) return 'Unassigned';
        const tech = technicians.find(t => t.id === job.assignedTechnicianId);
        return tech ? tech.name : 'Unknown Tech';
    }, [technicians, job.assignedTechnicianId]);

    const elapsedTime = useMemo(() => {
        if (!job.createdAt) return '--';
        const start = new Date(job.createdAt).getTime();
        const now = new Date().getTime();
        const diffMins = Math.floor((now - start) / 60000);
        if (diffMins < 60) return `${diffMins}m`;
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hrs}h ${mins}m`;
    }, [job.createdAt]);

    return (
        <Card className="group hover:-translate-y-1 transition-all duration-300 border-surface-border dark:border-white/5 bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm hover:shadow-xl rounded-[1.5rem]">
            <CardContent className="p-4 lg:p-5 flex flex-col gap-3.5">
                <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black text-ink-muted/40 uppercase tracking-[0.2em] mb-0.5">#{job.jobNo}</p>
                        <h4 className="text-sm lg:text-base font-black text-ink-heading dark:text-white truncate tracking-tighter uppercase italic">{job.vehicleRegNo}</h4>
                    </div>
                    <StatusBadge status={job.status} />
                </div>

                <div className="flex items-center gap-3 py-2 border-y border-surface-border dark:border-white/5">
                    <div className="w-8 h-8 rounded-full bg-surface-page dark:bg-white/5 border border-surface-border dark:border-white/5 flex items-center justify-center shrink-0">
                        <User size={14} className="text-brand" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[8px] font-black text-ink-muted/30 uppercase tracking-widest mb-0.5">Technician</p>
                        <p className="text-[10px] lg:text-[11px] font-bold text-ink-muted truncate uppercase tracking-tight">{technicianName}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest opacity-60">
                    <div className="flex items-center gap-1.5">
                        <Clock size={12} strokeWidth={2.5} />
                        <span>Duration</span>
                    </div>
                    <span className="text-brand">{elapsedTime}</span>
                </div>
            </CardContent>
        </Card>
    );
});
JobCardCompact.displayName = 'JobCardCompact';

const StatusBoardPage = () => {
    const jobCards = useWorkshopStore(state => state.jobCards);
    const [searchQuery, setSearchQuery] = useState('');

    const columns = [
        { id: 'received', title: 'Pending', icon: Clock, color: 'text-brand' },
        { id: 'in-service', title: 'Working', icon: Wrench, color: 'text-blue-500' },
        { id: 'qc-done', title: 'Ready', icon: CheckCircle2, color: 'text-success' },
    ];

    const filteredJobs = useMemo(() => jobCards.filter(j =>
        j.vehicleRegNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.jobNo.toLowerCase().includes(searchQuery.toLowerCase())
    ), [jobCards, searchQuery]);

    return (
        <div className="h-full lg:h-[calc(100vh-65px)] flex flex-col p-5 lg:p-8 space-y-6 overflow-hidden animate-fade w-full max-w-full bg-[#fafafa] dark:bg-[#080809]">
            <div className="opacity-40 text-xs shrink-0"><Breadcrumb items={[{ label: 'Workshop', href: '/service-admin/workshop' }, { label: 'Status Board' }]} /></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="min-w-0 flex-1">
                    <h1 className="text-3xl lg:text-5xl font-black text-ink-heading dark:text-white tracking-tighter uppercase italic leading-none">Status <span className="text-brand">Board</span></h1>
                    <p className="text-xs lg:text-sm font-medium text-ink-muted/40 mt-1.5 tracking-tight truncate">Real-time job card tracking across operational segments.</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    <div className="relative w-full md:w-[300px] lg:w-[350px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted/30 group-focus-within:text-brand transition-all duration-300" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH VEHICLE..."
                            className="w-full pl-12 pr-5 py-3 bg-white dark:bg-white/[0.03] border border-surface-border dark:border-white/5 rounded-[1.5rem] text-[11px] lg:text-xs font-black focus:outline-none focus:ring-8 focus:ring-brand/5 focus:border-brand/30 transition-all placeholder:text-ink-muted/20"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto no-scrollbar scroll-smooth flex gap-5 pb-5">
                {columns.map((col) => (
                    <div key={col.id} className="flex-1 min-w-[300px] lg:min-w-[340px] max-w-[420px] flex flex-col h-full bg-surface-page/50 dark:bg-white/[0.01] rounded-[2rem] border border-surface-border dark:border-white/5 overflow-hidden">
                        <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-surface-border dark:border-white/5 flex items-center justify-between shrink-0 bg-white/50 dark:bg-black/20 text-ink-heading dark:text-white">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-xl shrink-0", col.color, "bg-current/10")}>
                                    <col.icon size={16} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-sm lg:text-base font-black tracking-tighter uppercase italic">{col.title}</h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-surface-page dark:bg-white/5 text-[10px] font-black text-ink-muted border border-surface-border dark:border-white/5">
                                {filteredJobs.filter(j => j.status === col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar p-4 lg:p-5 flex flex-col gap-4">
                            {filteredJobs.filter(j => j.status === col.id).map((job) => (
                                <JobCardCompact key={job.id} job={job} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default memo(StatusBoardPage);
