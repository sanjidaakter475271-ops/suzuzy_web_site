'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartData } from '@/types/service-admin';

const COLORS = ['#C75B12', '#8B5A2B', '#E7B089', '#5F5147', '#D6A100'];

interface ExpensePieChartProps {
    data?: ChartData[];
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data = [] }) => {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-card border border-surface-border dark:border-dark-border flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-ink-heading dark:text-white">Expense Breakdown</h3>
                    <p className="text-xs text-ink-muted">Distribution of expenses</p>
                </div>
            </div>
            <div className="flex-1 min-h-[250px] relative">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-dark-card p-2 border border-surface-border dark:border-dark-border shadow-md rounded-lg text-xs">
                                                <p className="font-bold">{payload[0].name}</p>
                                                <p className="text-brand">${payload[0].value?.toLocaleString()}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-ink-muted text-sm">
                        No expense data available
                    </div>
                )}
                {data.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className="text-sm text-ink-muted">Total</p>
                            <p className="text-xl font-bold text-ink-heading dark:text-white">
                                ${total >= 1000 ? `${Math.round(total / 1000)}k` : total.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-ink-body dark:text-gray-400">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="truncate">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpensePieChart;
