'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    FileText,
    Search,
    Printer,
    CheckCircle2,
    Clock,
    Bike,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent, Button } from '@/components/ui';
import { useWorkshopStore } from '@/stores/workshopStore';
import { cn } from '@/lib/utils';

const ServiceBillingPage = () => {
    const { jobCards } = useWorkshopStore();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter jobs that are ready for billing
    const billableJobs = jobCards.filter(j =>
        (j.status === 'qc-done' || j.status === 'ready' || j.status === 'delivered') &&
        (j.jobNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (j.customerName && j.customerName.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb items={[{ label: 'POS', href: '/pos' }, { label: 'Service Billing' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Service Invoicing</h1>
                    <p className="text-sm text-ink-muted mt-2 font-medium">Generate professional invoices for completed workshop services.</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-600 px-5 py-2.5 rounded-2xl border-2 border-emerald-500/20 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {billableJobs.length} Jobs Ready
                </div>
            </div>

            <div className="relative max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search Job ID or Customer Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-brand transition-all text-sm font-bold shadow-soft"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {billableJobs.map((job) => (
                    <Card key={job.id} className="rounded-[2.5rem] border-2 border-transparent hover:border-brand/20 transition-all duration-500 hover:shadow-2xl group overflow-hidden bg-white dark:bg-dark-card">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-brand tracking-[0.2em] mb-1">JOB #{job.jobNo}</p>
                                    <h3 className="font-black text-xl text-ink-heading dark:text-white group-hover:text-brand transition-colors tracking-tighter">
                                        {job.customerName || job.customerId}
                                    </h3>
                                </div>
                                <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                    BILLABLE
                                </span>
                            </div>

                            <div className="p-5 bg-surface-page dark:bg-black/20 rounded-2xl border border-surface-border dark:border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-ink-muted uppercase tracking-widest">
                                        <Bike size={14} className="text-brand" />
                                        {job.vehicleModel}
                                    </div>
                                    <p className="text-[10px] font-black text-ink-heading dark:text-white uppercase opacity-80">{job.vehicleRegNo}</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-ink-muted uppercase tracking-widest">
                                    <Clock size={14} />
                                    Completed: {new Date(job.updatedAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black text-ink-muted uppercase tracking-widest opacity-60">Payable Amount</p>
                                    <p className="text-2xl font-black text-ink-heading dark:text-white">৳{job.total.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-surface-border dark:border-dark-border/50 flex items-center gap-3">
                                <Link
                                    href={`/pos/service-billing/${job.id}`}
                                    className="flex-1 bg-brand text-white hover:bg-brand-hover h-12 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-brand/20 transition-all"
                                >
                                    <FileText size={18} />
                                    GENERATE BILL
                                </Link>
                                <button className="p-3 bg-surface-page dark:bg-dark-page text-ink-muted rounded-2xl hover:text-brand transition-colors border-2 border-surface-border dark:border-dark-border hover:border-brand/40">
                                    <Printer size={20} />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {billableJobs.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-dark-card rounded-[3rem] border-4 border-dashed border-surface-border dark:border-dark-border shadow-inner">
                        <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-full text-slate-300">
                            <AlertCircle size={64} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">No Pending Bills</h3>
                            <p className="text-ink-muted font-bold mt-2">All completed jobs have been invoiced or there are no completed jobs.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceBillingPage;
