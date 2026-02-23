'use client';

import React, { useState } from 'react';
import {
    Search,
    FileText,
    Download,
    Eye,
    CheckCircle2,
    Clock
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui'; // Assuming default Card import
import { usePOSStore } from '@/stores/posStore';
import { cn } from '@/lib/utils'; // Assuming utils exists

const InvoiceListPage = () => {
    const { invoices } = usePOSStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNo.includes(searchQuery) ||
        (inv.customerId || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'POS', href: '/pos' }, { label: 'Invoices' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Invoice History</h1>
                    <p className="text-sm text-ink-muted">View past sales and reprint receipts.</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search Invoice No or Customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand transition-colors text-sm"
                />
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-page dark:bg-dark-page/50 border-b border-surface-border dark:border-dark-border">
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Invoice No</th>
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Date</th>
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Customer</th>
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Amount</th>
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Status</th>
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-dark-border/50">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-brand-soft/10 transition-colors group">
                                    <td className="p-4 font-bold text-brand">#{inv.invoiceNo}</td>
                                    <td className="p-4 text-xs font-bold text-ink-muted">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                            <Clock size={12} />
                                            {new Date(inv.createdAt).toLocaleDateString('en-GB')}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-ink-heading dark:text-white">{inv.customerId}</td>
                                    <td className="p-4 font-black">৳{inv.total.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center w-fit gap-1",
                                            inv.status === 'paid' ? "bg-success-bg text-success" : "bg-warning-bg text-warning"
                                        )}>
                                            {inv.status === 'paid' && <CheckCircle2 size={10} />}
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-brand text-ink-muted hover:text-white rounded-lg transition-colors" title="View">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-1.5 hover:bg-brand text-ink-muted hover:text-white rounded-lg transition-colors" title="Download PDF">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default InvoiceListPage;
