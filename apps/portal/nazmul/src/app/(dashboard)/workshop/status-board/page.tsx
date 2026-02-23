'use client';

import React from 'react';
import {
    Clock,
    User,
    Bike,
    AlertCircle,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { useWorkshopStore } from '@/stores/workshopStore';
import { cn } from '@/lib/utils';
import { JobCard } from '@/types/workshop';

const StatusBoardPage = () => {
    const { jobCards } = useWorkshopStore();

    const columns = [
        { id: 'received', label: 'Received', color: 'bg-slate-500' },
        { id: 'in-diagnosis', label: 'Diagnosis', color: 'bg-blue-500' },
        { id: 'waiting-parts', label: 'Parts Wait', color: 'bg-amber-500' },
        { id: 'in-service', label: 'In Service', color: 'bg-brand' },
        { id: 'qc-done', label: 'QC Done', color: 'bg-purple-500' },
        { id: 'ready', label: 'Ready', color: 'bg-success' },
        { id: 'delivered', label: 'Delivered', color: 'bg-emerald-600' },
    ];

    const getJobsByStatus = (status: string) => {
        return jobCards.filter(job => job.status === status);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col p-6 lg:p-8 space-y-6 overflow-hidden animate-fade">
            <Breadcrumb items={[{ label: 'Workshop', href: '/workshop' }, { label: 'Status Board' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Service Status Board</h1>
                    <p className="text-sm text-ink-muted">Live view of workshop floor activity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-page bg-brand-soft text-[10px] font-bold flex items-center justify-center text-brand">
                                T{i}
                            </div>
                        ))}
                    </div>
                    <span className="text-xs font-bold text-ink-muted">3 Technicians Online</span>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max h-full">
                    {columns.map((column) => {
                        const jobs = getJobsByStatus(column.id);
                        return (
                            <div key={column.id} className="w-72 flex flex-col gap-4">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2.5 h-2.5 rounded-full", column.color)} />
                                        <h3 className="font-black uppercase tracking-widest text-xs text-ink-heading dark:text-white">
                                            {column.label}
                                        </h3>
                                    </div>
                                    <span className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border px-2 py-0.5 rounded text-[10px] font-black text-ink-muted">
                                        {jobs.length}
                                    </span>
                                </div>

                                <div className="flex-1 bg-surface-card/30 dark:bg-dark-card/30 rounded-2xl border border-dashed border-surface-border dark:border-dark-border p-3 space-y-3 overflow-y-auto custom-scrollbar">
                                    {jobs.map((job) => (
                                        <div
                                            key={job.id}
                                            className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border p-4 rounded-xl shadow-sm hover:shadow-md hover:border-brand/40 transition-all group cursor-pointer animate-fade"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-brand tracking-tighter">#{job.jobNo}</span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-ink-muted">
                                                    <Clock size={12} />
                                                    {new Date(job.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <h4 className="font-bold text-sm text-ink-heading dark:text-white mb-1 truncate">{job.customerId}</h4>
                                            <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-3">
                                                <Bike size={12} className="text-brand" />
                                                <span>{job.vehicleId}</span>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-surface-border dark:border-dark-border/50">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-brand-soft flex items-center justify-center text-[8px] font-black text-brand">
                                                        {job.assignedTechnicianId?.substring(0, 2)}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-ink-muted">T-ID: {job.assignedTechnicianId}</span>
                                                </div>
                                                <ChevronRight size={14} className="text-ink-muted group-hover:text-brand transition-colors" />
                                            </div>
                                        </div>
                                    ))}

                                    {jobs.length === 0 && (
                                        <div className="h-20 flex items-center justify-center border border-dashed border-surface-border dark:border-dark-border rounded-xl">
                                            <span className="text-[10px] font-bold text-ink-muted uppercase">No Jobs</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StatusBoardPage;
