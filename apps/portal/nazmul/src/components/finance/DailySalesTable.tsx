'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { DailySalesEntry } from '@/types/finance';

interface DailySalesTableProps {
    data: DailySalesEntry[];
}

const DailySalesTable: React.FC<DailySalesTableProps> = ({ data }) => {
    const totals = data.reduce((acc, curr) => ({
        qty: acc.qty + curr.qty,
        subtotal: acc.subtotal + curr.subtotal,
        discount: acc.discount + curr.discount,
        total: acc.total + curr.total,
    }), { qty: 0, subtotal: 0, discount: 0, total: 0 });

    return (
        <Card className="overflow-hidden border-surface-border dark:border-dark-border">
            <CardHeader className="bg-surface-page dark:bg-dark-page/50 border-b border-surface-border dark:border-dark-border">
                <CardTitle className="text-xl font-bold text-center">Daily Sales</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-page/50 dark:bg-white/5 border-b border-surface-border dark:border-dark-border">
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Invoice</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase text-center">Qty</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase text-right">Subtotal</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase text-right">Discount</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase text-right">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Comment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                            {data.length > 0 ? (
                                data.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-surface-hover/30 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm text-ink-body dark:text-gray-300">{entry.date}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-ink-heading dark:text-white">{entry.invoice}</td>
                                        <td className="px-6 py-4 text-sm text-center">{entry.qty}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium">Tk {entry.subtotal.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-right text-danger font-medium">Tk {entry.discount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-right font-black text-ink-heading dark:text-white">Tk {entry.total.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-ink-muted italic">{entry.comment || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-ink-muted bg-surface-page/20 dark:bg-transparent italic">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <span className="text-4xl">🧾</span>
                                            <p>No sales activity recorded for this period.</p>
                                            <div className="grid grid-cols-6 gap-4 w-full mt-4 max-w-2xl text-xs font-bold uppercase py-2 border-t border-b border-surface-border dark:border-dark-border">
                                                <span>0</span>
                                                <span>Tk 0</span>
                                                <span>Tk 0</span>
                                                <span>Tk 0</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {data.length > 0 && (
                            <tfoot className="bg-surface-page/80 dark:bg-white/5 font-black border-t-2 border-surface-border dark:border-dark-border">
                                <tr className="text-ink-heading dark:text-white">
                                    <td colSpan={2} className="px-6 py-4 text-sm uppercase">Grand Total</td>
                                    <td className="px-6 py-4 text-sm text-center">{totals.qty}</td>
                                    <td className="px-6 py-4 text-sm text-right">Tk {totals.subtotal.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-right text-danger">Tk {totals.discount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-right text-brand">Tk {totals.total.toLocaleString()}</td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default DailySalesTable;
