'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/service-admin/ui';
import { ChevronLeft, History, FileText, Download, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CustomerRecordsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/v1/customer/records')
            .then(res => res.json())
            .then(data => {
                if (data.success) setRecords(data.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = (id: string) => {
        // Implement invoice download logic or alert
        alert(`Downloading Invoice for Job #${id}`);
    };

    return (
        <div className="min-h-screen bg-surface-page dark:bg-dark-page p-6 lg:p-8 animate-fade pb-24">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/service-admin/customer/portal">
                    <button className="p-3 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl text-ink-muted hover:text-brand transition-all">
                        <ChevronLeft size={20} />
                    </button>
                </Link>
                <div>
                    <p className="text-[10px] font-black uppercase text-brand tracking-widest">Customer Portal</p>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Service Records</h1>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-12 text-ink-muted"><p>Loading your service history...</p></div>
            ) : records.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-dark-card rounded-3xl border border-surface-border dark:border-dark-border">
                    <History size={48} className="mx-auto text-ink-muted/30 mb-4" />
                    <h2 className="text-xl font-black">No Records Found</h2>
                    <p className="text-ink-muted text-sm mt-2">You don't have any service history yet.</p>
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl">
                    {records.map((record, i) => (
                        <Card key={i} className="rounded-[1.5rem] border-2 border-surface-border dark:border-dark-border hover:border-brand/30 transition-all group overflow-hidden bg-white dark:bg-dark-card">
                            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-brand/5 dark:bg-white/5 border border-brand/10 flex items-center justify-center flex-shrink-0">
                                    <FileText className="text-brand" size={24} />
                                </div>
                                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-ink-muted uppercase tracking-widest">Job #{record.job_card_ref || 'N/A'}</span>
                                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <Calendar size={12} /> {record.service_date ? new Date(record.service_date).toLocaleDateString() : 'Unknown Date'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight">
                                            {record.service_vehicles?.bike_models?.name || 'Unknown Vehicle'}
                                        </h3>
                                        <p className="text-sm text-ink-muted font-medium mt-1">
                                            Ref: {record.notes || 'Routine Servicing'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-1">Invoice Amount</p>
                                            <p className="text-xl font-black text-ink-heading dark:text-white border-b-2 border-slate-100 dark:border-white/10 pb-1 w-24">
                                                ৳{record.total_cost || 0}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleDownload(record.job_card_ref || record.id)}
                                                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-ink-muted hover:bg-brand/10 hover:text-brand transition-colors flex items-center justify-center"
                                                title="Download Invoice"
                                            >
                                                <Download size={18} />
                                            </button>
                                            <Link href={`/service-admin/workshop/job-cards/${record.id}`}>
                                                <button
                                                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-ink-muted hover:bg-brand/10 hover:text-brand transition-colors flex items-center justify-center"
                                                    title="View Detail"
                                                >
                                                    <ArrowRight size={18} />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
