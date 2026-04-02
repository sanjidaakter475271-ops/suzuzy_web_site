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
import { MoreHorizontal, Calendar, ArrowUpRight, TrendingDown } from 'lucide-react';
import { ChartData } from '@/types/service-admin';
import { cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0D0D0F]/90 backdrop-blur-md p-3 border border-white/10 shadow-2xl rounded-2xl">
                <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1">{label} Overview</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-6 mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{entry.name}:</span>
                        </div>
                        <span className="text-xs font-black text-white tabular-nums">
                            ৳{entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface RevenueChartProps {
    data?: ChartData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data = [] }) => {
    const [range, setRange] = React.useState('6m');

    const filteredData = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        const count = range === '1y' ? 12 : range === '6m' ? 6 : 3;
        return data.slice(-count);
    }, [data, range]);

    return (
        <div className="bg-white dark:bg-[#080809] p-8 rounded-[2.5rem] shadow-card border border-surface-border dark:border-white/5 transition-all group hover:border-brand/20 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight italic">Revenue <span className="text-brand">&</span> Expenses</h3>
                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mt-1">Monthly performance stream</p>
                </div>

                <div className="flex items-center gap-1 bg-surface-page dark:bg-white/5 p-1 rounded-xl border border-surface-border dark:border-white/5">
                    {[
                        { label: '3M', value: '3m' },
                        { label: '6M', value: '6m' },
                        { label: '1Y', value: '1y' }
                    ].map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setRange(item.value)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                range === item.value
                                    ? "bg-brand text-white shadow-lg shadow-brand/20"
                                    : "text-ink-muted hover:text-ink-heading dark:hover:text-white"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-[300px] w-full">
                {filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#C75B12" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#C75B12" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5A2B" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#8B5A2B" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.03} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#8A7B6E', fontWeight: 'bold' }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#8A7B6E', fontWeight: 'bold' }}
                                tickFormatter={(value) => `৳${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="income"
                                name="Income"
                                stroke="#C75B12"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                name="Expense"
                                stroke="#8B5A2B"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-ink-muted space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-surface-muted dark:bg-white/5 flex items-center justify-center">
                            <TrendingDown size={24} className="opacity-20" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Awaiting financial sync...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueChart;
