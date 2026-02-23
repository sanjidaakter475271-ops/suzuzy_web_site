'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobCard } from '@/types/workshop';

interface JobCardTimelineProps {
    status: JobCard['status'];
}

const JobCardTimeline: React.FC<JobCardTimelineProps> = ({ status }) => {
    const steps: { label: string; value: JobCard['status'] }[] = [
        { label: 'Received', value: 'received' },
        { label: 'In Diagnosis', value: 'in-diagnosis' },
        { label: 'Wait Parts', value: 'waiting-parts' },
        { label: 'In Service', value: 'in-service' },
        { label: 'QC Done', value: 'qc-done' },
        { label: 'Ready', value: 'ready' },
        { label: 'Delivered', value: 'delivered' },
    ];

    const currentIdx = steps.findIndex(s => s.value === status);

    return (
        <div className="w-full py-8">
            <div className="relative flex items-center justify-between">
                {/* Connecting Lines */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-border dark:bg-dark-border z-0"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand transition-all duration-1000 z-0"
                    style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                ></div>

                {/* Step Icons */}
                {steps.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-lg",
                            idx < currentIdx ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20" :
                                idx === currentIdx ? "bg-brand border-white dark:border-dark-card text-white shadow-brand/40 scale-125" :
                                    "bg-white dark:bg-dark-card border-surface-border dark:border-dark-border text-ink-muted"
                        )}>
                            {idx < currentIdx ? <CheckCircle2 size={20} /> :
                                idx === currentIdx ? <Clock size={20} className="animate-spin-slow" /> :
                                    <Circle size={16} />}
                        </div>
                        <div className="absolute -bottom-8 whitespace-nowrap">
                            <p className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                idx <= currentIdx ? "text-ink-heading dark:text-white" : "text-ink-muted"
                            )}>
                                {step.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobCardTimeline;
