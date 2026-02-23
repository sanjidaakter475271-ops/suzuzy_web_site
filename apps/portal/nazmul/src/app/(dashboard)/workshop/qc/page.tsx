'use client';

import React, { useState } from 'react';
import {
    ClipboardCheck,
    Search,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    CheckCircle,
    User,
    Bike,
    Clock,
    FileText,
    ArrowRight
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useWorkshopStore } from '@/stores/workshopStore';
import { QC_CHECKLIST_TEMPLATE } from '@/constants/workshopData';
import { cn } from '@/lib/utils';

const QCChecklistPage = () => {
    const { jobCards } = useWorkshopStore();
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [checklist, setChecklist] = useState(QC_CHECKLIST_TEMPLATE);

    const readyForQC = jobCards.filter(job => job.status === 'in-service' || job.status === 'qc-done');
    const selectedJob = jobCards.find(j => j.id === selectedJobId);

    const handleToggleItem = (id: string) => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    };

    const allChecked = checklist.every(item => item.checked);

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade h-full overflow-hidden flex flex-col">
            <Breadcrumb items={[{ label: 'Workshop', href: '/workshop' }, { label: 'QC Checklist' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Quality Control (QC)</h1>
                    <p className="text-sm text-ink-muted">Final inspection before delivery to customer.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
                {/* Job Selection Sidebar */}
                <div className="lg:col-span-4 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted px-1 flex items-center justify-between">
                        Pending Inspection
                        <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full">{readyForQC.length}</span>
                    </h3>

                    {readyForQC.map((job) => (
                        <Card
                            key={job.id}
                            onClick={() => setSelectedJobId(job.id)}
                            className={cn(
                                "cursor-pointer transition-all border-2",
                                selectedJobId === job.id ? "border-brand bg-brand-soft/30 shadow-lg shadow-brand/5" : "border-surface-border dark:border-dark-border hover:border-brand/40"
                            )}
                        >
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black uppercase text-brand">JOB #{job.jobNo}</p>
                                        <h4 className="font-bold text-ink-heading dark:text-white truncate">{job.customerId}</h4>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                                        job.status === 'qc-done' ? 'bg-success-bg text-success' : 'bg-amber-100 text-amber-600'
                                    )}>
                                        {job.status.replace('-', ' ')}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-ink-muted">
                                    <div className="flex items-center gap-1">
                                        <Bike size={12} />
                                        {job.vehicleId}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        12m ago
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {readyForQC.length === 0 && (
                        <div className="py-20 text-center space-y-3 bg-surface-card/30 dark:bg-dark-card/30 rounded-2xl border-2 border-dashed border-surface-border dark:border-dark-border">
                            <CheckCircle size={32} className="mx-auto text-success/40" />
                            <p className="text-xs font-bold text-ink-muted uppercase">All Jobs Inspected</p>
                        </div>
                    )}
                </div>

                {/* Checklist Main Area */}
                <div className="lg:col-span-8 flex flex-col overflow-hidden">
                    {selectedJob ? (
                        <Card className="flex-1 flex flex-col overflow-hidden border-2 border-brand/20">
                            <CardContent className="p-0 flex flex-col h-full">
                                <div className="p-6 bg-brand/5 border-b border-brand/10 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
                                                <ClipboardCheck size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-ink-heading dark:text-white">Inspection: #{selectedJob.jobNo}</h3>
                                                <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">{selectedJob.customerId} • {selectedJob.vehicleId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] font-black text-ink-muted uppercase">Assigned Tech</p>
                                                <p className="text-sm font-bold text-ink-heading dark:text-white">Rafiq Ahmed</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-brand-soft border-2 border-brand/20 overflow-hidden">
                                                <img src="https://i.pravatar.cc/150?u=T1" alt="avatar" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {checklist.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleToggleItem(item.id)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                                                    item.checked
                                                        ? "bg-success-bg border-success text-success"
                                                        : "bg-surface-page dark:bg-dark-page border-surface-border dark:border-dark-border hover:border-brand/40"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-5 h-5 rounded flex items-center justify-center transition-colors",
                                                        item.checked ? "bg-success text-white" : "bg-white dark:bg-dark-page border-2 border-surface-border dark:border-dark-border group-hover:border-brand"
                                                    )}>
                                                        {item.checked && <CheckCircle2 size={14} />}
                                                    </div>
                                                    <span className="text-sm font-bold">{item.label}</span>
                                                </div>
                                                {!item.checked && <ArrowRight size={14} className="text-ink-muted opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <label className="text-xs font-black uppercase text-ink-muted flex items-center gap-2">
                                            <FileText size={14} />
                                            Inspection Notes
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder="Add any specific observations or pending work..."
                                            className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-xl px-4 py-3 outline-none focus:border-brand transition-colors text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-surface-page dark:bg-dark-page/50 border-t border-surface-border dark:border-dark-border/50 flex items-center justify-between gap-4">
                                    <button className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 text-danger hover:bg-danger-bg transition-all">
                                        <XCircle size={18} />
                                        Reject & Send Back
                                    </button>
                                    <button
                                        disabled={!allChecked}
                                        className={cn(
                                            "flex-1 md:flex-none px-12 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg",
                                            allChecked
                                                ? "bg-success text-white hover:bg-emerald-600 shadow-success/20 active:scale-95"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                        )}
                                    >
                                        <CheckCircle2 size={18} />
                                        Pass Inspection
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 bg-surface-card/30 dark:bg-dark-card/30 rounded-3xl border-2 border-dashed border-surface-border dark:border-dark-border">
                            <div className="w-20 h-20 rounded-full bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border flex items-center justify-center text-ink-muted">
                                <Search size={40} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-ink-heading dark:text-white">Select a Job Card</h3>
                                <p className="text-sm text-ink-muted max-w-xs mx-auto">Click on a job from the pending list to start the Quality Control inspection.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QCChecklistPage;
