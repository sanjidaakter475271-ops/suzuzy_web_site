'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip } from 'recharts';

interface TransactionBarChartProps {
    data?: any[];
}

const TransactionBarChart = ({ data }: TransactionBarChartProps) => {
    // Basic aggregation by type
    const chartData = React.useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        if (data.length > 0 && 'income' in data[0] && 'name' in data[0]) {
            return data;
        }

        const grouped: Record<string, { income: number; expense: number }> = {};
        data.forEach(item => {
            const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!grouped[date]) grouped[date] = { income: 0, expense: 0 };

            if (item.type === 'income') grouped[date].income += Number(item.amount);
            else grouped[date].expense += Number(item.amount);
        });

        return Object.entries(grouped).map(([name, vals]) => ({
            name,
            ...vals
        })).slice(-7);
    }, [data]);

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-card border border-surface-border dark:border-dark-border h-full">
            <h3 className="text-lg font-bold text-ink-heading dark:text-white mb-1">Transaction Volume</h3>
            <p className="text-xs text-ink-muted mb-6">Income vs expenses by date</p>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DDD4" className="dark:opacity-10" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8A7B6E' }} dy={10} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-dark-card p-3 border border-surface-border dark:border-dark-border shadow-lg rounded-lg">
                                            <p className="text-xs font-bold text-ink-heading dark:text-white mb-1">{label}</p>
                                            {payload.map((entry: any, index: number) => (
                                                <p key={index} className="text-xs" style={{ color: entry.dataKey === 'income' ? '#C75B12' : '#8A7B6E' }}>
                                                    {entry.name}: ${Number(entry.value).toLocaleString()}
                                                </p>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar name="Income" dataKey="income" fill="#C75B12" radius={[4, 4, 0, 0]} barSize={24} />
                        <Bar name="Expense" dataKey="expense" fill="#E6DDD4" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {chartData.length === 0 && (
                <div className="h-full flex items-center justify-center text-xs text-ink-muted">No transaction data.</div>
            )}
        </div>
    );
};

export default TransactionBarChart;
