'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartData } from '@/types/service-admin';

interface TransactionBarChartProps {
    data?: ChartData[];
}

const TransactionBarChart: React.FC<TransactionBarChartProps> = ({ data = [] }) => {
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-card border border-surface-border dark:border-dark-border">
            <h3 className="text-lg font-bold text-ink-heading dark:text-white mb-1">Transaction Volume</h3>
            <p className="text-xs text-ink-muted mb-6">Income vs expenses by category</p>
            <div className="h-64">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DDD4" className="dark:opacity-10" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8A7B6E' }} dy={10} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-dark-card p-3 border border-surface-border dark:border-dark-border shadow-lg rounded-lg">
                                                <p className="text-xs font-bold text-ink-heading dark:text-white mb-1">{label}</p>
                                                {payload.map((entry: any, index: number) => (
                                                    <p key={index} className="text-xs" style={{ color: entry.dataKey === 'income' ? '#C75B12' : '#8A7B6E' }}>
                                                        {entry.name}: ${entry.value.toLocaleString()}
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
                ) : (
                    <div className="h-full flex items-center justify-center text-ink-muted text-sm">
                        No transaction data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionBarChart;
