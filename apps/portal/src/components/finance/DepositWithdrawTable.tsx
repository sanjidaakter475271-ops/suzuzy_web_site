'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { DepositWithdrawEntry } from '@/types/finance';

interface DepositWithdrawTableProps {
    data: DepositWithdrawEntry[];
}

const DepositWithdrawTable: React.FC<DepositWithdrawTableProps> = ({ data }) => {
    const totals = data.reduce((acc, curr) => ({
        cashIn: acc.cashIn + curr.cashIn,
        cashOut: acc.cashOut + curr.cashOut,
    }), { cashIn: 0, cashOut: 0 });

    return (
        <Card className="overflow-hidden border-surface-border dark:border-dark-border">
            <CardHeader className="bg-surface-page dark:bg-dark-page/50 border-b border-surface-border dark:border-dark-border">
                <CardTitle className="text-xl font-bold text-center">Cash Deposit/Withdraw</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-page/50 dark:bg-white/5 border-b border-surface-border dark:border-dark-border">
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase">Note</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase text-right">Cash In</th>
                                <th className="px-6 py-4 text-xs font-bold text-ink-muted uppercase text-right">Cash Out</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                            {data.map((entry) => (
                                <tr key={entry.id} className="hover:bg-surface-hover/30 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-ink-heading dark:text-white">{entry.date}</td>
                                    <td className="px-6 py-4 text-sm text-ink-body dark:text-gray-300 italic">{entry.note}</td>
                                    <td className="px-6 py-4 text-sm text-right font-black text-success">
                                        {entry.cashIn > 0 ? `Tk ${entry.cashIn.toLocaleString()}` : 'Tk 0'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-black text-danger">
                                        {entry.cashOut > 0 ? `Tk ${entry.cashOut.toLocaleString()}` : 'Tk 0'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-surface-page/80 dark:bg-white/5 font-black border-t-2 border-surface-border dark:border-dark-border">
                            <tr className="text-ink-heading dark:text-white">
                                <td colSpan={2} className="px-6 py-4 text-sm uppercase text-right">Settlement Totals</td>
                                <td className="px-6 py-4 text-sm text-right text-success">Tk {totals.cashIn.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-right text-danger">Tk {totals.cashOut.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default DepositWithdrawTable;
