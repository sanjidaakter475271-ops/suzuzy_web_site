'use client';

import React, { useState } from 'react';
import {
    Search,
    FileText,
    Download,
    Eye,
    Clock,
    Plus,
    MoreHorizontal
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

// Local Mock Data
const MOCK_QUOTATIONS = [
    { id: 'QT-1001', date: '2024-04-25T09:00:00Z', customer: 'Rafiqul Islam', amount: 5400, status: 'pending', items: 4 },
    { id: 'QT-1002', date: '2024-04-24T14:30:00Z', customer: 'Tanvir Ahmed', amount: 12500, status: 'converted', items: 8 },
    { id: 'QT-1003', date: '2024-04-23T11:15:00Z', customer: 'Corporate Client A', amount: 45000, status: 'expired', items: 12 },
];

const QuotationsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredQuotations = MOCK_QUOTATIONS.filter(q =>
        q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'POS', href: '/pos' }, { label: 'Quotations' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Quotations</h1>
                    <p className="text-sm text-ink-muted mt-1 font-medium">Manage price estimates and convert to invoices.</p>
                </div>
                <Button className="bg-brand hover:bg-brand-dark text-white rounded-xl h-10 px-5 text-xs font-black uppercase tracking-widest gap-2 shadow-lg shadow-brand/20">
                    <Plus size={16} /> New Quote
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search Quotation No or Customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-brand transition-all text-sm font-bold shadow-sm"
                />
            </div>

            <Card className="overflow-hidden border border-surface-border dark:border-dark-border rounded-[2rem] shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-page dark:bg-dark-page/50 border-b border-surface-border dark:border-dark-border">
                                <th className="p-5 text-[10px] font-black text-ink-muted uppercase tracking-widest">Quote No</th>
                                <th className="p-5 text-[10px] font-black text-ink-muted uppercase tracking-widest">Date</th>
                                <th className="p-5 text-[10px] font-black text-ink-muted uppercase tracking-widest">Customer</th>
                                <th className="p-5 text-[10px] font-black text-ink-muted uppercase tracking-widest">Items</th>
                                <th className="p-5 text-[10px] font-black text-ink-muted uppercase tracking-widest">Total Amount</th>
                                <th className="p-5 text-[10px] font-black text-ink-muted uppercase tracking-widest">Status</th>
                                <th className="p-5 text-[10px] font-black text-ink-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-dark-border/50 bg-white dark:bg-dark-card">
                            {filteredQuotations.map((q) => (
                                <tr key={q.id} className="hover:bg-brand-soft/10 transition-colors group">
                                    <td className="p-5 font-black text-brand text-xs">{q.id}</td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-ink-muted whitespace-nowrap">
                                            <Clock size={14} />
                                            {new Date(q.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm font-bold text-ink-heading dark:text-white">{q.customer}</td>
                                    <td className="p-5 text-xs font-bold text-ink-muted">{q.items} Items</td>
                                    <td className="p-5 font-black text-ink-heading dark:text-white">৳{q.amount.toLocaleString()}</td>
                                    <td className="p-5">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center w-fit gap-1.5",
                                            q.status === 'converted' ? "bg-success-bg text-success border border-success/20" :
                                                q.status === 'pending' ? "bg-warning-bg text-warning border border-warning/20" :
                                                    "bg-surface-page text-ink-muted border border-surface-border"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full",
                                                q.status === 'converted' ? "bg-success" :
                                                    q.status === 'pending' ? "bg-warning" : "bg-ink-muted"
                                            )}></div>
                                            {q.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-brand/10 text-ink-muted hover:text-brand rounded-xl transition-colors" title="View">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-brand/10 text-ink-muted hover:text-brand rounded-xl transition-colors" title="Download">
                                                <Download size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-surface-page text-ink-muted rounded-xl transition-colors" title="More">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredQuotations.length === 0 && (
                        <div className="p-12 text-center text-ink-muted/50 text-sm font-bold italic">
                            No quotations found.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default QuotationsPage;
