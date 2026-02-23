'use client';

import React from 'react';
import { JobCard, JobCardItem } from '@/types/workshop';
import { Printer, Download, Mail, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface InvoicePreviewProps {
    job: JobCard;
    editable?: boolean;
    onUpdateQty?: (index: number, newQty: number) => void;
    onRemoveItem?: (index: number) => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
    job,
    editable = false,
    onUpdateQty,
    onRemoveItem
}) => {
    return (
        <div className="bg-white dark:bg-dark-card rounded-[2.5rem] border-2 border-surface-border dark:border-dark-border shadow-2xl overflow-hidden max-w-4xl mx-auto ring-1 ring-black/5">
            {/* Action Bar */}
            <div className="bg-surface-page dark:bg-black/20 p-6 border-b border-surface-border dark:border-dark-border flex justify-between items-center print:hidden">
                <p className="text-xs font-black text-ink-muted uppercase tracking-widest">Invoicing Preview</p>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl h-10 px-4 text-xs" onClick={() => window.print()}>
                        <Printer size={16} className="mr-2" /> Print
                    </Button>
                    <Button variant="outline" className="rounded-xl h-10 px-4 text-xs">
                        <Download size={16} className="mr-2" /> PDF
                    </Button>
                    <Button variant="primary" className="rounded-xl h-10 px-4 text-xs">
                        <Mail size={16} className="mr-2" /> Send Email
                    </Button>
                </div>
            </div>

            {/* Actual Invoice Body */}
            <div className="p-12 space-y-12 bg-white text-slate-900 print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center font-black text-white text-2xl">RC</div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Royalconsortium</h1>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service & Parts Center</p>
                            </div>
                        </div>
                        <div className="text-xs font-medium text-slate-500 space-y-1">
                            <p>123 Workshop Avenue, Dhaka, Bangladesh</p>
                            <p>Phone: +880 1700 000000 | Email: support@royalconsortium.com</p>
                            <p>Trade License: #RC-2024-9901</p>
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <h2 className="text-5xl font-black text-slate-200 uppercase tracking-tighter">INVOICE</h2>
                        <div className="space-y-1">
                            <p className="text-sm font-black uppercase tracking-widest">#INV-{job.jobNo}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Billing Info */}
                <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill To:</p>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-900">{job.customerName}</p>
                            <p className="text-sm font-bold text-slate-500">{job.customerPhone}</p>
                            <p className="text-xs font-medium text-slate-500">Regular Customer | ID: {job.customerId}</p>
                        </div>
                    </div>
                    <div className="space-y-4 text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Details:</p>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-900">{job.vehicleModel}</p>
                            <p className="text-sm font-bold text-slate-700 uppercase tracking-widest font-mono bg-slate-100 px-3 py-1 rounded inline-block">{job.vehicleRegNo}</p>
                            <p className="text-xs font-medium text-slate-500">Chassis: {job.chassisNo || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="space-y-4">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</th>
                                <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {job.items.map((item, idx) => (
                                <tr key={idx} className={cn(
                                    "group/row transition-colors",
                                    editable ? "hover:bg-slate-50/80" : ""
                                )}>
                                    <td className="py-5">
                                        <div className="flex items-center gap-3">
                                            {editable && onRemoveItem && (
                                                <button
                                                    onClick={() => onRemoveItem(idx)}
                                                    className="p-1.5 text-slate-300 hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover/row:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <div>
                                                <p className="font-black text-sm text-slate-900">{item.description}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Workshop Service</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-200">Labor</span>
                                    </td>
                                    <td className="py-5 text-right font-bold text-sm">
                                        {editable && onUpdateQty ? (
                                            <div className="flex items-center justify-end gap-3">
                                                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                                                    <button
                                                        onClick={() => onUpdateQty(idx, Math.max(1, (item.qty || 1) - 1))}
                                                        className="p-1 hover:text-danger transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-black">{item.qty || 1}</span>
                                                    <button
                                                        onClick={() => onUpdateQty(idx, (item.qty || 1) + 1)}
                                                        className="p-1 hover:text-success transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unit || 'pcs'}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1">
                                                <span>{item.qty || 1}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unit || 'pcs'}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-5 text-right font-black text-sm text-slate-900">৳{item.cost.toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50/50">
                                <td className="py-5 px-4" colSpan={3}>
                                    <p className="font-black text-sm text-slate-900 uppercase tracking-widest">Service & Labor Charges</p>
                                </td>
                                <td className="py-5 pr-4 text-right font-black text-sm text-slate-900">৳{job.laborCost.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer Totals */}
                <div className="grid grid-cols-2 gap-12 pt-8">
                    <div className="p-8 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terms & Notes:</p>
                        <ul className="text-[10px] text-slate-500 space-y-1.5 font-medium italic">
                            <li>• All service items come with 30-day labor warranty.</li>
                            <li>• Parts warranty as provided by respective manufacturers.</li>
                            <li>• Final invoice subject to audit.</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2 border-b border-slate-100 pb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Parts Subtotal</span>
                                <span className="text-sm font-black text-slate-900">৳{job.partsCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-brand">
                                <span className="text-xs font-black uppercase tracking-widest">Discount ({job.discount}%)</span>
                                <span className="text-sm font-black">-৳{((job.total * job.discount) / 100).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xl font-black uppercase tracking-tighter text-slate-900">Grand Total</span>
                            <div className="text-right">
                                <p className="text-4xl font-black text-brand tracking-tighter leading-none">৳{job.total.toLocaleString()}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">VAT Inclusive (7.5%)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Signature */}
                <div className="pt-24 flex justify-between items-end">
                    <div className="text-center space-y-2 border-t border-slate-200 pt-3 px-12">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">Customer Signature</p>
                    </div>
                    <div className="text-center space-y-2 border-t border-slate-200 pt-3 px-12">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">Manager Approval</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
