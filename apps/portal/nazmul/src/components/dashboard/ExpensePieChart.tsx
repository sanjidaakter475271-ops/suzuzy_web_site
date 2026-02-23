'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { EXPENSE_BREAKDOWN_DATA } from '@/constants/mockData';

const COLORS = ['#C75B12', '#8B5A2B', '#E7B089', '#5F5147', '#D6A100'];

const ExpensePieChart = () => {
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-card border border-surface-border dark:border-dark-border flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-ink-heading dark:text-white">Expense Breakdown</h3>
                    <p className="text-xs text-ink-muted">Distribution of expenses</p>
                </div>
            </div>
            <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={EXPENSE_BREAKDOWN_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {EXPENSE_BREAKDOWN_DATA.map((entry, index) => (
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
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-sm text-ink-muted">Total</p>
                        <p className="text-xl font-bold text-ink-heading dark:text-white">$89k</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
                {EXPENSE_BREAKDOWN_DATA.map((item, i) => (
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
