'use client';

import React, { useState } from 'react';
import {
    Plus,
    Search,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Hammer
} from 'lucide-react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent, Button } from '@/components/ui';
import { useWorkshopStore } from '@/stores/workshopStore';
import { cn } from '@/lib/utils';

const JobCardListPage = () => {
    const { jobCards, ramps } = useWorkshopStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const statuses = [
        { id: 'all', label: 'All Jobs' },
        { id: 'received', label: 'Received' },
        { id: 'in-diagnosis', label: 'In Diagnosis' },
        { id: 'in-service', label: 'In Service' },
        { id: 'qc-done', label: 'QC Done' },
        { id: 'ready', label: 'Ready' },
        { id: 'delivered', label: 'Delivered' },
    ];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'received': return 'bg-slate-100 text-slate-600 dark:bg-slate-900/50 dark:text-slate-400';
            case 'in-diagnosis': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400';
            case 'waiting-parts': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400';
            case 'in-service': return 'bg-brand/10 text-brand';
            case 'qc-done': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400';
            case 'ready': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400';
            case 'delivered': return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const filteredJobs = jobCards.filter(job => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = job.jobNo.toLowerCase().includes(query) ||
            (job.customerName && job.customerName.toLowerCase().includes(query)) ||
            job.customerId.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'Workshop', href: '/workshop' }, { label: 'Job Cards' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Job Case Board</h1>
                    <p className="text-sm text-ink-muted mt-1">Real-time tracking of active workshop services.</p>
                </div>
                <Link href="/workshop/job-cards/new">
                    <Button className="rounded-2xl h-12 px-6 gap-2 shadow-lg shadow-brand/20">
                        <Plus size={20} />
                        NEW JOB CARD
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col gap-8">
                {/* Filters & Search Row */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {statuses.map((status) => (
                            <button
                                key={status.id}
                                onClick={() => setStatusFilter(status.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    statusFilter === status.id
                                        ? "bg-brand text-white shadow-lg shadow-brand/20"
                                        : "bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border text-ink-muted hover:border-brand/50"
                                )}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:max-w-xs group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Job, Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-brand transition-all text-sm font-bold shadow-soft"
                        />
                    </div>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => {
                        const ramp = ramps.find(r => r.id === job.assignedRampId);
                        return (
                            <Card key={job.id} className="rounded-[2.5rem] border-2 border-transparent hover:border-brand/20 transition-all duration-500 hover:shadow-2xl group overflow-hidden">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-black uppercase text-brand tracking-[0.2em]">JOB: #{job.jobNo}</p>
                                                {ramp && (
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md text-[8px] font-black uppercase">
                                                        <Hammer size={8} /> {ramp.name}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-black text-ink-heading dark:text-white group-hover:text-brand transition-colors tracking-tight">
                                                {job.customerName || job.customerId}
                                            </h3>
                                        </div>
                                        <div className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm", getStatusStyles(job.status))}>
                                            {job.status.replace('-', ' ')}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-surface-page dark:bg-black/20 rounded-2xl border border-surface-border dark:border-white/5 relative">
                                        <p className="text-xs text-ink-body dark:text-ink-muted line-clamp-2 italic font-medium leading-relaxed">
                                            "{job.complaints}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-ink-muted uppercase tracking-wider">
                                            <Clock size={14} className="text-brand" />
                                            <span>{new Date(job.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                            <CheckCircle2 size={14} />
                                            <span>{job.items.filter(i => i.status === 'completed').length}/{job.items.length} Tasks</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex items-center justify-between border-t border-surface-border dark:border-dark-border/50">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-ink-muted uppercase tracking-widest">Bill Amount</p>
                                            <p className="text-lg font-black text-ink-heading dark:text-white">৳{job.total.toLocaleString()}</p>
                                        </div>
                                        <Link href={`/workshop/job-cards/${job.id}`}>
                                            <button className="h-10 px-4 bg-brand/5 text-brand rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand hover:text-white transition-all duration-300">
                                                Manage
                                                <ChevronRight size={14} />
                                            </button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredJobs.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-dark-card rounded-[3rem] border-4 border-dashed border-surface-border dark:border-dark-border shadow-inner">
                        <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-full text-slate-300">
                            <AlertCircle size={64} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">No Matching Jobs</h3>
                            <p className="text-ink-muted font-bold mt-2">Adjust your filters or try searching with a different term.</p>
                        </div>
                        <Button variant="outline" onClick={() => setStatusFilter('all')} className="rounded-xl px-8 h-12 uppercase tracking-widest text-xs font-black">
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobCardListPage;
