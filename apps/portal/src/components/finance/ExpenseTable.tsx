'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ExpenseEntry } from '@/types/finance';

interface ExpenseTableProps {
    data: ExpenseEntry[];
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ data }) => {
    const totalExpense = data.reduce((sum, entry) => sum + entry.totalAmount, 0);

    return (
        <Card className="overflow-hidden border-surface-border dark:border-dark-border">
            <CardHeader className="bg-surface-page dark:bg-dark-page/50 border-b border-surface-border dark:border-dark-border">
                <CardTitle className="text-xl font-bold text-center">Expense</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-page/50 dark:bg-white/5 border-b border-surface-border dark:border-dark-border">
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase text-right">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                            {data.map((entry) => (
                                <tr key={entry.id} className="hover:bg-surface-hover/30 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm text-ink-body dark:text-gray-300">
                                        <div className="font-bold text-ink-heading dark:text-white">{entry.date}</div>
                                        <div className="text-[10px] text-ink-muted">{entry.time}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-brand-soft text-brand text-[10px] font-bold rounded-full border border-brand/10 uppercase">
                                            {entry.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-ink-body dark:text-gray-300 max-w-md line-clamp-2" title={entry.description}>
                                        {entry.description}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-right text-danger">Tk {entry.totalAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-surface-page/80 dark:bg-white/5 font-black border-t-2 border-surface-border dark:border-dark-border">
                            <tr className="text-ink-heading dark:text-white">
                                <td colSpan={3} className="px-6 py-4 text-sm uppercase text-right">Total Expense</td>
                                <td className="px-6 py-4 text-sm text-right text-danger">Tk {totalExpense.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default ExpenseTable;
