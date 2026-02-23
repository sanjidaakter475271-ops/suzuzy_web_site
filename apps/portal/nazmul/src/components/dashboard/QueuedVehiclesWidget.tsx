'use client';

import React from 'react';
import { useWorkshopStore } from '@/stores/workshopStore';
import { Card, CardContent } from '@/components/ui';
import { Car, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const QueuedVehiclesWidget = () => {
    const { jobCards } = useWorkshopStore();
    const queuedJobs = jobCards.filter(job => job.status === 'received' || job.status === 'waiting-parts').slice(0, 5);

    return (
        <Card className="rounded-[2rem] border border-surface-border dark:border-dark-border shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-ink-heading dark:text-white">In Queue</h3>
                    <Link href="/workshop/job-cards" className="text-[10px] font-bold text-brand uppercase tracking-widest hover:underline">View All</Link>
                </div>
                {queuedJobs.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-xs text-ink-muted font-bold">No vehicles in queue.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {queuedJobs.map(job => (
                            <div key={job.id} className="flex items-center justify-between group cursor-pointer hover:bg-surface-page dark:hover:bg-dark-page p-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-dark-border rounded-xl flex items-center justify-center text-ink-muted">
                                        <Car size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-ink-heading dark:text-white">{job.vehicleModel}</p>
                                        <p className="text-[10px] font-bold text-ink-muted uppercase">{job.jobNo}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] bg-brand/10 text-brand px-2 py-1 rounded-lg font-black uppercase tracking-widest">{job.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default QueuedVehiclesWidget;
