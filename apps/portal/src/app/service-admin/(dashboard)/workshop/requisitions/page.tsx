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
    MapPin,
    Star,
    Receipt,
    Info,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { RequisitionGroup } from '@/types/service-admin/requisitions';
import { toast } from 'sonner';

export default function RequisitionsPage() {
    const { requisitions, isLoading, error, fetchRequisitions, approveRequisitionGroup, rejectRequisitionGroup } = useRequisitionsStore();
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<RequisitionGroup | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        fetchRequisitions(statusFilter === 'all' ? undefined : statusFilter).then(() => {
            setLastUpdated(new Date());
        });
    }, [statusFilter, fetchRequisitions]);

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Sync Failed</h2>
                <p className="text-ink-muted max-w-md">{error}</p>
                <button
                    onClick={() => fetchRequisitions(statusFilter === 'all' ? undefined : statusFilter)}
                    className="px-6 py-2 bg-brand text-white font-black rounded-xl uppercase tracking-widest text-xs"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const filteredRequisitions = requisitions.filter(group =>
        group.technicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.jobNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const safeFormat = (date: any, formatStr: string) => {
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'N/A';
            return format(d, formatStr);
        } catch (e) {
            return 'N/A';
        }
    };

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
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white flex items-center gap-3 italic uppercase tracking-tight">
                        Parts <span className="text-brand">Requisitions</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-ink-muted font-medium">Manage and approve technician spare parts requests</p>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Updated {format(lastUpdated, "hh:mm:ss a")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-1 rounded-2xl border border-surface-border dark:border-white/5 shadow-sm">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-xs font-black transition-all capitalize tracking-widest",
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
                {isLoading && requisitions.length === 0 ? (
                    // Requisition Skeletons
                    Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="bg-white dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-[40px] overflow-hidden shadow-sm animate-pulse h-[300px]">
                            <div className="flex flex-col lg:flex-row h-full">
                                <div className="lg:w-80 p-8 border-r border-surface-border dark:border-white/5 bg-surface-muted/30 dark:bg-white/5 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-200 dark:bg-slate-800" />
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                    </div>
                                </div>
                                <div className="flex-1 p-8 space-y-6">
                                    <div className="flex justify-between">
                                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
                                        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
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
                                            <span className="text-ink-heading dark:text-white font-black">{safeFormat(group.createdAt, 'hh:mm a')}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-ink-muted font-bold flex items-center gap-2"><Calendar size={14} /> Date</span>
                                            <span className="text-ink-heading dark:text-white font-black">{safeFormat(group.createdAt, 'MMM dd, yyyy')}</span>
                                        </div>

                                        <div className="pt-4 mt-4 border-t border-surface-border dark:border-white/5 space-y-3">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Customer</p>
                                                <p className="text-xs font-bold text-ink-heading dark:text-white truncate">{group.customerName}</p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Problem Type</p>
                                                <p className="text-xs font-medium text-ink-muted italic line-clamp-2">"{group.problemType}"</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-4 border-t border-surface-border dark:border-white/5">
                                            <button className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand hover:bg-brand hover:text-white transition-all shadow-sm">
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
                                                    onClick={async () => {
                                                        const reason = prompt("Reason for rejection:");
                                                        if (!reason) return;
                                                        try {
                                                            await rejectRequisitionGroup(group.id, reason);
                                                            toast.success('Batch Rejected', { description: `Requisition REQ-${group.id.substring(0, 8)} has been rejected.` });
                                                        } catch (e: any) {
                                                            toast.error('Rejection Failed', { description: e.message });
                                                        }
                                                    }}
                                                    className="px-6 py-3 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <X size={16} />
                                                        Reject Batch
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await approveRequisitionGroup(group.id);
                                                            toast.success('Approved & Stock Updated', { description: `REQ-${group.id.substring(0, 8)} — ${group.items.length} items approved for issue.` });
                                                        } catch (e: any) {
                                                            toast.error('Approval Failed', { description: e.message });
                                                        }
                                                    }}
                                                    className="px-8 py-3 bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white hover:bg-emerald-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    <Check size={16} />
                                                    Approve for Issue
                                                </button>
                                            </div>
                                        )}

                                        {group.status !== 'pending' && (
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-ink-muted text-[10px] font-bold uppercase tracking-widest">
                                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                                    Finalized
                                                </div>
                                                <button
                                                    onClick={() => setSelectedGroup(group)}
                                                    className="p-2 bg-white dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-xl text-brand hover:bg-brand hover:text-white transition-all shadow-sm"
                                                    title="View Details"
                                                >
                                                    <Info size={18} />
                                                </button>
                                            </div>
                                        )}

                                        {group.status === 'pending' && (
                                            <button
                                                onClick={() => setSelectedGroup(group)}
                                                className="p-2 bg-white dark:bg-white/5 border border-surface-border dark:border-white/10 rounded-xl text-ink-muted hover:text-brand transition-all shadow-sm"
                                                title="View Details"
                                            >
                                                <Info size={18} />
                                            </button>
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

            {/* Details Modal */}
            {selectedGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        className="bg-white dark:bg-[#0D0D0F] w-full max-w-lg rounded-[40px] border border-surface-border dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-8 pb-0 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                                    <Info size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Requisition Details</h3>
                                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em]">Job Card #{selectedGroup.jobNumber}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedGroup(null)}
                                className="p-2 hover:bg-surface-muted dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={24} className="text-ink-muted" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Problem Section */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-black text-brand uppercase tracking-widest">
                                    <AlertCircle size={14} />
                                    Reported Problem
                                </div>
                                <div className="p-4 bg-surface-muted/30 dark:bg-white/5 rounded-2xl border border-surface-border dark:border-white/5">
                                    <p className="text-sm font-medium text-ink-body dark:text-slate-300 italic leading-relaxed">
                                        "{selectedGroup.problemType}"
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Rating Section */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Service Rating</p>
                                    <div className="flex items-center gap-2">
                                        {selectedGroup.rating ? (
                                            <>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={cn(
                                                                i < selectedGroup.rating! ? "fill-brand text-brand" : "text-ink-muted/30"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-black text-ink-heading dark:text-white">{selectedGroup.rating}/5</span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-ink-muted italic font-medium">Pending Feedback</span>
                                        )}
                                    </div>
                                </div>

                                {/* Bill Section */}
                                <div className="space-y-2 text-right">
                                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest text-right">Total Invoice Bill</p>
                                    <div className="flex items-center justify-end gap-2 text-emerald-500 font-black">
                                        <Receipt size={16} />
                                        <span className="text-xl tracking-tighter">
                                            {selectedGroup.invoiceAmount ? `৳${selectedGroup.invoiceAmount.toLocaleString()}` : "৳0.00"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="pt-6 border-t border-surface-border dark:border-white/5 grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-1">Customer</p>
                                    <p className="text-sm font-bold text-ink-heading dark:text-white">{selectedGroup.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-1">Technician</p>
                                    <p className="text-sm font-bold text-ink-heading dark:text-white">{selectedGroup.technicianName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-surface-muted/20 dark:bg-white/5 flex justify-end">
                            <button
                                onClick={() => setSelectedGroup(null)}
                                className="px-8 py-3 bg-brand text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-brand/20 active:scale-95 transition-all"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
