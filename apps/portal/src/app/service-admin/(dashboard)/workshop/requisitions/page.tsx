'use client';

import React, { useEffect, useState } from 'react';
import { useRequisitionsStore } from '@/stores/service-admin/requisitionsStore';
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Eye,
    Check,
    X,
    User,
    Calendar,
    ArrowRight,
    MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function RequisitionsPage() {
    const { requisitions, isLoading, fetchRequisitions, approveRequisitionItem, rejectRequisitionItem } = useRequisitionsStore();
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRequisitions(statusFilter === 'all' ? undefined : statusFilter);
    }, [statusFilter, fetchRequisitions]);

    const filteredRequisitions = requisitions.filter(group =>
        group.technicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.jobNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'issued': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white flex items-center gap-3">
                        <Package className="text-brand" size={32} strokeWidth={2.5} />
                        Parts Requisitions
                    </h1>
                    <p className="text-ink-muted mt-2 font-medium">Manage and approve technician spare parts requests</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-1 rounded-2xl border border-surface-border dark:border-white/5 shadow-sm">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-black transition-all capitalize",
                                statusFilter === status
                                    ? "bg-brand text-white shadow-lg shadow-brand/20"
                                    : "text-ink-muted hover:text-ink-heading dark:hover:text-white"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats/Search Bar */}
            <div className="grid lg:grid-cols-4 gap-4 items-center">
                <div className="lg:col-span-3 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by technician name, job card #..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm"
                    />
                </div>
                <button className="h-full bg-white dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-2xl px-6 flex items-center justify-center gap-2 text-sm font-bold text-ink-heading dark:text-white hover:bg-surface-hover transition-all">
                    <Filter size={18} />
                    <span>Advanced</span>
                </button>
            </div>

            {/* Content List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
                        <p className="text-sm font-black uppercase tracking-widest text-ink-muted">Loading Requisitions...</p>
                    </div>
                ) : filteredRequisitions.length > 0 ? (
                    filteredRequisitions.map((group) => (
                        <div
                            key={group.id}
                            className="bg-white dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl hover:border-brand/30 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-stretch h-full">
                                {/* Left Section: Tech Info */}
                                <div className="lg:w-80 p-8 border-r border-surface-border dark:border-white/5 bg-surface-muted/30 dark:bg-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-3xl bg-brand/10 border-2 border-brand/20 flex items-center justify-center overflow-hidden">
                                                {group.technicianAvatar ? (
                                                    <Image src={group.technicianAvatar} alt={group.technicianName} fill className="object-cover" />
                                                ) : (
                                                    <User className="text-brand" size={32} />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-dark-page rounded-full shadow-lg" title="Technician is online" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-ink-heading dark:text-white uppercase tracking-wider">{group.technicianName}</h3>
                                            <p className="text-[10px] text-brand font-black bg-brand/10 px-2 py-0.5 rounded-full mt-1 inline-block uppercase tracking-tighter">Technician</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-ink-muted font-bold flex items-center gap-2"><Clock size={14} /> Time</span>
                                            <span className="text-ink-heading dark:text-white font-black">{format(new Date(group.createdAt), 'hh:mm a')}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-ink-muted font-bold flex items-center gap-2"><Calendar size={14} /> Date</span>
                                            <span className="text-ink-heading dark:text-white font-black">{format(new Date(group.createdAt), 'MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="pt-4 mt-4 border-t border-surface-border dark:border-white/5">
                                            <button className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand hover:bg-brand hover:text-white transition-all">
                                                <MapPin size={14} />
                                                Locate Tech
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Section: Items Table */}
                                <div className="flex-1 flex flex-col">
                                    <div className="p-8 pb-4 flex items-center justify-between border-b border-surface-border dark:border-white/5">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Job Card Number</p>
                                                <h4 className="text-xl font-black text-ink-heading dark:text-white mt-1">#{group.jobNumber}</h4>
                                            </div>
                                            <div className="w-px h-10 bg-surface-border dark:border-white/5" />
                                            <div>
                                                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Requisition ID</p>
                                                <h4 className="text-xl font-black text-brand mt-1 truncate max-w-[120px]">REQ-{group.id.substring(0, 8)}</h4>
                                            </div>
                                        </div>
                                        <div className={cn("px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-[0.1em] shadow-sm", getStatusStyles(group.status))}>
                                            {group.status}
                                        </div>
                                    </div>

                                    <div className="flex-1 p-8">
                                        <div className="grid grid-cols-12 gap-4 text-[10px] font-black text-ink-muted uppercase tracking-widest border-b border-surface-border dark:border-white/5 pb-4 mb-4">
                                            <div className="col-span-6">Product Description</div>
                                            <div className="col-span-2 text-center">Qty</div>
                                            <div className="col-span-2 text-right">Unit Price</div>
                                            <div className="col-span-2 text-right">Total</div>
                                        </div>

                                        <div className="space-y-4">
                                            {group.items.map((item) => (
                                                <div key={item.id} className="grid grid-cols-12 gap-4 items-center group/item">
                                                    <div className="col-span-6 flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-surface-muted dark:bg-white/5 rounded-xl border border-surface-border dark:border-white/10 flex items-center justify-center text-ink-muted group-hover/item:text-brand transition-colors">
                                                            <Package size={20} strokeWidth={1.5} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-ink-heading dark:text-white leading-tight">{item.productName}</p>
                                                            {item.notes && <p className="text-[10px] text-ink-muted mt-0.5 line-clamp-1 italic">"{item.notes}"</p>}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <span className="text-sm font-black text-ink-heading dark:text-white bg-surface-muted dark:bg-white/10 px-3 py-1 rounded-lg border border-surface-border dark:border-white/5">
                                                            {item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 text-right font-bold text-ink-muted text-sm">৳{item.unitPrice.toLocaleString()}</div>
                                                    <div className="col-span-2 text-right font-black text-ink-heading dark:text-white text-sm">৳{item.totalPrice.toLocaleString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-8 pt-4 bg-surface-muted/20 dark:bg-white/5 border-t border-surface-border dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Estimated Grand Total:</span>
                                            <span className="text-2xl font-black text-brand tracking-tight">৳{group.totalAmount.toLocaleString()}</span>
                                        </div>

                                        {group.status === 'pending' && (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt("Reason for rejection:");
                                                        if (reason) group.items.forEach(i => rejectRequisitionItem(i.id, reason));
                                                    }}
                                                    className="px-6 py-3 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <X size={16} />
                                                        Reject Batch
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => group.items.forEach(i => approveRequisitionItem(i.id))}
                                                    className="px-8 py-3 bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white hover:bg-emerald-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    <Check size={16} />
                                                    Approve for Issue
                                                </button>
                                            </div>
                                        )}

                                        {group.status !== 'pending' && (
                                            <div className="flex items-center gap-2 text-ink-muted text-[10px] font-bold uppercase">
                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                                Request finalized by Admin
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-40 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-white/5 rounded-[60px] border border-dashed border-surface-border dark:border-white/10">
                        <div className="w-20 h-20 bg-surface-muted dark:bg-white/5 rounded-[32px] flex items-center justify-center text-ink-muted mb-4">
                            <Package size={40} strokeWidth={1} />
                        </div>
                        <h2 className="text-2xl font-black text-ink-heading dark:text-white">Empty Queue</h2>
                        <p className="text-ink-muted max-w-[300px] font-medium leading-relaxed">Everything is up to date. No pending part requisitions found for this criteria.</p>
                        <button
                            onClick={() => setStatusFilter('all')}
                            className="mt-4 px-8 py-3 bg-brand text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-brand/20 active:scale-95 transition-all"
                        >
                            View All History
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
