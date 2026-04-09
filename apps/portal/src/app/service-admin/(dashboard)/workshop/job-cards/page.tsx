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
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent, Button } from '@/components/service-admin/ui';
import { useWorkshopStore } from '@/stores/service-admin/workshopStore';
import { cn } from '@/lib/utils';

const JobCardListPage = () => {
    const { jobCards, ramps, fetchPaginatedJobs, isJobsLoading, jobPagination } = useWorkshopStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const statuses = [
        { id: 'all', label: 'All Jobs', group: 'all' },
        { id: 'created', label: 'Created', group: 'active' },
        { id: 'diagnosed', label: 'Diagnosed', group: 'active' },
        { id: 'in_progress', label: 'In Progress', group: 'active' },
        { id: 'qc_pending', label: 'QC Pending', group: 'active' },
        { id: 'completed', label: 'Completed', group: 'done' },
        { id: 'delivered', label: 'Delivered', group: 'done' },
    ];

    const [activeTabGroup, setActiveTabGroup] = useState<'all' | 'active' | 'done'>('active');

    // Fetch paginated jobs on mount and when filters/page change
    React.useEffect(() => {
        // If "active" tab group is selected but the specific status is 'all', 
        // we ideally want to fetch only active jobs. Since the backend handles exact match, 
        // we'll fetch all and filter locally for now if needed, or rely on the backend.
        // Actually, backend supports specific status. If "active" tab is clicked, we default to 'in_progress' or keep 'all' and filter locally.
        fetchPaginatedJobs({
            page: currentPage,
            limit: 20,
            status: statusFilter === 'all' && activeTabGroup !== 'all' ? 'all' : statusFilter, 
            search: searchQuery
        });
    }, [currentPage, statusFilter, searchQuery, activeTabGroup, fetchPaginatedJobs]);

    // Reset to page 1 when filters change
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'created':
            case 'pending':
                return 'bg-slate-100 text-slate-600 dark:bg-slate-900/50 dark:text-slate-400';
            case 'diagnosed':
            case 'in-diagnosis':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400';
            case 'waiting_parts':
            case 'waiting-parts':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400';
            case 'in_progress':
                return 'bg-brand/10 text-brand';
            case 'qc_pending':
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 border border-amber-200';
            case 'qc_approved':
            case 'completed':
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400';
            case 'delivered':
                return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const filteredJobs = jobCards.filter(job => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = job.jobNo.toLowerCase().includes(query) ||
            (job.customerName && job.customerName.toLowerCase().includes(query)) ||
            job.customerId.toLowerCase().includes(query);
            
        let matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        
        // Apply group filtering if 'all' is selected within a group
        if (statusFilter === 'all') {
            if (activeTabGroup === 'active') {
                matchesStatus = ['created', 'diagnosed', 'in_progress', 'qc_pending', 'pending'].includes(job.status);
            } else if (activeTabGroup === 'done') {
                matchesStatus = ['completed', 'delivered'].includes(job.status);
            }
        }
        
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'Workshop', href: '/service-admin/workshop' }, { label: 'Job Cards' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Job Case Board</h1>
                    <p className="text-sm text-ink-muted mt-1">Real-time tracking of active workshop services.</p>
                </div>
                <Link href="/service-admin/workshop/job-cards/new">
                    <Button className="rounded-2xl h-12 px-6 gap-2 shadow-lg shadow-brand/20">
                        <Plus size={20} />
                        NEW JOB CARD
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col gap-8">
                {/* Filters & Search Row */}
                <div className="flex flex-col gap-5 bg-white dark:bg-black/20 p-5 lg:p-6 rounded-[2rem] border border-surface-border dark:border-white/5 shadow-sm">
                    {/* Primary Tabs */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-surface-border dark:border-white/5 pb-5">
                        <div className="flex bg-surface-page dark:bg-black/40 p-1.5 rounded-2xl w-full md:w-auto">
                            {[
                                { id: 'active', label: 'Active Pipeline' },
                                { id: 'done', label: 'Completed & Delivered' },
                                { id: 'all', label: 'All Records' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTabGroup(tab.id as any);
                                        setStatusFilter('all');
                                        setCurrentPage(1);
                                    }}
                                    className={cn(
                                        "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        activeTabGroup === tab.id
                                            ? "bg-white dark:bg-white/10 text-brand shadow-sm"
                                            : "text-ink-muted hover:text-ink-heading dark:hover:text-white"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        <div className="relative w-full md:w-[350px] group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Job, Customer..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full bg-surface-page dark:bg-black/40 border-2 border-transparent dark:border-transparent rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-brand/30 focus:bg-white dark:focus:bg-black/60 transition-all text-sm font-bold shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Secondary Filters (Sub-statuses based on active group) */}
                    <div className="flex flex-wrap items-center gap-2">
                        {statuses.filter(s => activeTabGroup === 'all' || s.group === activeTabGroup || s.id === 'all').map((status) => (
                            <button
                                key={status.id}
                                onClick={() => handleStatusChange(status.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    statusFilter === status.id
                                        ? "bg-brand/10 text-brand border border-brand/20 shadow-inner"
                                        : "bg-surface-page dark:bg-dark-card border border-surface-border dark:border-dark-border text-ink-muted hover:border-brand/30 hover:text-brand/80"
                                )}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {isJobsLoading ? (
                        // Loading Skeletons
                        Array.from({ length: 6 }).map((_, idx) => (
                            <Card key={`skeleton-${idx}`} className="rounded-[2.5rem] overflow-hidden border-surface-border dark:border-dark-border shadow-card animate-pulse">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                                            <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
                                        </div>
                                        <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                                    </div>
                                    <div className="h-16 bg-surface-page dark:bg-black/20 rounded-2xl border border-surface-border dark:border-white/5"></div>
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                                    </div>
                                    <div className="pt-6 flex items-center justify-between border-t border-surface-border dark:border-dark-border/50">
                                        <div className="space-y-1">
                                            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
                                            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
                                        </div>
                                        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-24"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : jobCards.length === 0 ? (
                        // Empty State
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-dark-card rounded-[3rem] border-4 border-dashed border-surface-border dark:border-dark-border shadow-inner">
                            <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-full text-slate-300">
                                <AlertCircle size={64} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">No Matching Jobs</h3>
                                <p className="text-ink-muted font-bold mt-2">Adjust your filters or try searching with a different term.</p>
                            </div>
                            <Button variant="outline" onClick={() => handleStatusChange('all')} className="rounded-xl px-8 h-12 uppercase tracking-widest text-xs font-black">
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        jobCards.map((job) => {
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
                                            <Link href={`/service-admin/workshop/job-cards/${job.id}`}>
                                                <button className="h-10 px-4 bg-brand/5 text-brand rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand hover:text-white transition-all duration-300">
                                                    Manage
                                                    <ChevronRight size={14} />
                                                </button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Pagination Controls */}
                {jobPagination && jobPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-12 p-6 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-[2rem] shadow-card">
                        <p className="text-xs font-bold text-ink-muted uppercase tracking-widest">
                            Showing page <span className="text-brand">{jobPagination.page}</span> of {jobPagination.totalPages} ({jobPagination.total} total cases)
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                disabled={jobPagination.page <= 1 || isJobsLoading}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className="bg-surface-page dark:bg-dark-page rounded-xl h-12 px-6 text-[10px] font-black uppercase tracking-widest border-2"
                            >
                                Previous Stream
                            </Button>
                            <Button
                                variant="outline"
                                disabled={jobPagination.page >= jobPagination.totalPages || isJobsLoading}
                                onClick={() => setCurrentPage(p => Math.min(jobPagination.totalPages, p + 1))}
                                className="bg-surface-page dark:bg-dark-page rounded-xl h-12 px-6 text-[10px] font-black uppercase tracking-widest border-2"
                            >
                                Next Stream
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobCardListPage;
