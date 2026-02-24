'use client';

import React, { useState } from 'react';
import {
    Wrench,
    Search,
    CheckCircle2,
    XCircle,
    ClipboardList,
    Clock,
    User
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useInventoryStore } from '@/stores/inventoryStore';
import { cn } from '@/lib/utils';
// Mock logic: Job cards requesting parts would appear here

const PartsIssuePage = () => {
    const { partsIssues, fetchRequisitions, approveRequisition, rejectRequisition, isLoading } = useInventoryStore();

    React.useEffect(() => {
        fetchRequisitions();
    }, [fetchRequisitions]);

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'Inventory', href: '/inventory' }, { label: 'Workshop Issue' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Issue to Workshop</h1>
                    <p className="text-sm text-ink-muted">Allocate parts and consumables to job cards.</p>
                </div>
                {isLoading && <div className="text-brand font-black animate-pulse">SYNCING...</div>}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {partsIssues.map((issue) => (
                    <Card key={issue.id} className="hover:border-brand transition-all group">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                        <Wrench size={24} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-ink-heading dark:text-white truncate max-w-[200px]">
                                                Job: {issue.jobCardId?.substring(0, 8) || 'Unknown'}
                                            </h3>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                                issue.status === 'pending' ? "bg-amber-500/10 text-amber-600" : "bg-success-bg text-success"
                                            )}>
                                                {issue.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted font-bold">
                                            <span className="flex items-center gap-1.5"><ClipboardList size={14} /> ID: {issue.id.substring(0, 8)}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(issue.issuedAt).toLocaleTimeString()}</span>
                                            <span className="flex items-center gap-1.5"><User size={14} /> {issue.issuedBy}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 bg-surface-page dark:bg-dark-page rounded-xl p-4 border border-surface-border dark:border-dark-border">
                                    <h4 className="text-[10px] font-black uppercase text-ink-muted tracking-wider mb-2">Requested Item</h4>
                                    <div className="space-y-2">
                                        {issue.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-ink-heading dark:text-white">{(item as any).productName}</span>
                                                <span className="font-black text-brand bg-brand/5 px-2 py-0.5 rounded-lg">Qty: {item.qty}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    <button
                                        onClick={() => approveRequisition(issue.id)}
                                        className="bg-brand text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-hover shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={16} />
                                        Approve & Issue
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = prompt("Reason for rejection?");
                                            if (reason) rejectRequisition(issue.id, reason);
                                        }}
                                        className="py-2 bg-surface-page dark:bg-dark-page text-danger font-bold rounded-xl hover:bg-danger-bg transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider border border-surface-border dark:border-dark-border"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {partsIssues.length === 0 && !isLoading && (
                    <div className="py-20 text-center space-y-4 bg-surface-card dark:bg-dark-card rounded-2xl border-2 border-dashed border-surface-border dark:border-dark-border">
                        <CheckCircle2 size={48} className="mx-auto text-success/40" />
                        <p className="text-ink-muted font-bold">No pending requisitions from workshop.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartsIssuePage;
