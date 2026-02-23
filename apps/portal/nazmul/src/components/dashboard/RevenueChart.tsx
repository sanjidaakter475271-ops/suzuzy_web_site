'use client';

import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import { REVENUE_DATA } from '@/constants/mockData';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-dark-card p-3 border border-surface-border dark:border-dark-border shadow-lg rounded-lg">
                <p className="text-xs font-bold text-ink-heading dark:text-white mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: ${entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const RevenueChart = () => {
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-card border border-surface-border dark:border-dark-border transition-all">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-ink-heading dark:text-white">Revenue & Expenses</h3>
                    <p className="text-xs text-ink-muted">Monthly financial overview for the year</p>
                </div>
                <button className="p-2 hover:bg-surface-hover dark:hover:bg-dark-border rounded-lg transition-colors">
                    <MoreHorizontal size={20} className="text-ink-muted" />
                </button>
            </div>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C75B12" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#C75B12" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5A2B" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#8B5A2B" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DDD4" className="dark:opacity-10" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A7B6E' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A7B6E' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="income" stroke="#C75B12" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" stroke="#8B5A2B" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;
