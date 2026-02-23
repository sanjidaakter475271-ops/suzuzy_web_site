'use client';

import React from 'react';
import { Trash2, Plus, Minus, CreditCard, Tag, User, Bike } from 'lucide-react';
import { JobCard } from '@/types/workshop';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface BillingSidebarProps {
    job: JobCard;
    onUpdateQty: (index: number, newQty: number) => void;
    onRemoveItem: (index: number) => void;
    onGenerate: () => void;
}

const BillingSidebar: React.FC<BillingSidebarProps> = ({ job, onUpdateQty, onRemoveItem, onGenerate }) => {
    const subtotal = job.partsCost + job.laborCost;
    const discountAmount = (subtotal * job.discount) / 100;
    const total = subtotal - discountAmount;

    return (
        <div className="flex flex-col h-full bg-surface-card dark:bg-dark-card border-l border-surface-border dark:border-dark-border shadow-2xl z-10 w-[400px] shrink-0">
            {/* Customer & Vehicle Header */}
            <div className="p-6 border-b border-surface-border dark:border-dark-border bg-surface-page dark:bg-black/20 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h2 className="font-black text-lg text-ink-heading dark:text-white uppercase tracking-tight">Billing Terminal</h2>
                        <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em]">Job #{job.jobNo}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-surface-border dark:border-dark-border space-y-1">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-ink-muted uppercase tracking-widest">
                            <User size={10} className="text-brand" /> Customer
                        </div>
                        <p className="text-[11px] font-bold text-ink-heading dark:text-white truncate">{job.customerName}</p>
                    </div>
                    <div className="bg-white dark:bg-dark-card p-3 rounded-xl border border-surface-border dark:border-dark-border space-y-1">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-ink-muted uppercase tracking-widest">
                            <Bike size={10} className="text-brand" /> Vehicle
                        </div>
                        <p className="text-[11px] font-bold text-ink-heading dark:text-white truncate">{job.vehicleRegNo}</p>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <p className="text-[10px] font-black uppercase text-ink-muted tracking-[0.2em] mb-2">Order Items</p>

                {job.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-12">
                        <div className="w-16 h-16 rounded-full bg-surface-page dark:bg-black/20 flex items-center justify-center border-2 border-dashed border-surface-border dark:border-dark-border">
                            <Minus size={32} className="text-ink-muted" strokeWidth={1} />
                        </div>
                        <p className="text-xs font-bold text-ink-muted uppercase tracking-widest">No Items Added</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {job.items.map((item, idx) => (
                            <div key={idx} className="bg-surface-page dark:bg-black/20 p-4 rounded-2xl border border-surface-border dark:border-dark-border group hover:border-brand/40 transition-all shadow-sm">
                                <div className="flex justify-between items-start gap-4 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-black text-ink-heading dark:text-white truncate leading-tight uppercase tracking-tight">{item.description}</h4>
                                        <p className="text-[9px] font-bold text-ink-muted uppercase tracking-widest mt-1 opacity-60">Workshop Service</p>
                                    </div>
                                    <button
                                        onClick={() => onRemoveItem(idx)}
                                        className="text-ink-muted hover:text-danger transition-colors p-1 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 bg-white dark:bg-dark-card rounded-lg p-1 border border-surface-border dark:border-dark-border shadow-inner">
                                        <button
                                            onClick={() => onUpdateQty(idx, Math.max(1, (item.qty || 1) - 1))}
                                            className="p-1 hover:text-danger transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-xs font-black">{item.qty || 1}</span>
                                        <button
                                            onClick={() => onUpdateQty(idx, (item.qty || 1) + 1)}
                                            className="p-1 hover:text-success transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-brand tracking-tighter">৳{(item.cost * (item.qty || 1)).toLocaleString()}</p>
                                        <p className="text-[9px] font-bold text-ink-muted uppercase">৳{item.cost}/unit</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Labor Row */}
                        <div className="bg-brand/5 p-4 rounded-2xl border border-brand/10 flex justify-between items-center italic">
                            <div>
                                <h4 className="text-xs font-black text-brand uppercase tracking-tight">Service Labor</h4>
                                <p className="text-[9px] font-bold text-brand/60 uppercase tracking-widest">Base Diagnosis & Labor</p>
                            </div>
                            <p className="text-sm font-black text-brand tracking-tighter">৳{job.laborCost.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Calculations & Action */}
            <div className="p-6 bg-surface-page dark:bg-black/30 border-t border-surface-border dark:border-dark-border space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-black text-ink-muted uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span className="text-ink-heading dark:text-white">৳{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black text-brand uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Tag size={14} /> Discount ({job.discount}%)</div>
                        <span>- ৳{discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t border-dashed border-surface-border dark:border-dark-border">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] leading-none mb-1">Grand Total</p>
                                <p className="text-4xl font-black text-ink-heading dark:text-brand tracking-tighter leading-none">৳{total.toLocaleString()}</p>
                            </div>
                            <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                                Final Payable
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={onGenerate}
                    disabled={job.items.length === 0}
                    className="w-full h-16 bg-brand hover:bg-brand-hover text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-brand/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    Generate Bill
                    <div className="bg-white/20 px-2 py-0.5 rounded text-[10px]">F10</div>
                </Button>
            </div>
        </div>
    );
};

export default BillingSidebar;
