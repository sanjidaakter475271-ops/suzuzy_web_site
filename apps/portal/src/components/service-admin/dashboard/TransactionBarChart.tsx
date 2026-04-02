'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartData } from '@/types/service-admin';
import { cn } from '@/lib/utils';
import { BarChart3, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0D0D0F]/90 backdrop-blur-md p-3 border border-white/10 shadow-2xl rounded-2xl">
                <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1">{label} Pulse</p>
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

interface TransactionBarChartProps {
    data?: ChartData[];
}

const TransactionBarChart: React.FC<TransactionBarChartProps> = ({ data = [] }) => {
    const [range, setRange] = React.useState('monthly');

    const filteredData = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        // For monthly vs weekly, since our data is monthly,
        // we'll just show fewer months for 'weekly' as a mock filter
        // unless we update the API to support real weekly buckets.
        const count = range === 'monthly' ? 12 : 4;
        return data.slice(-count);
    }, [data, range]);

    return (
        <div className="bg-white dark:bg-[#080809] p-8 rounded-[2.5rem] shadow-card border border-surface-border dark:border-white/5 transition-all group hover:border-brand/20 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight italic">Financial <span className="text-brand">Velocity</span></h3>
                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mt-1">Transaction volume dynamics</p>
                </div>

                <div className="flex items-center gap-1 bg-surface-page dark:bg-white/5 p-1 rounded-xl border border-surface-border dark:border-white/5">
                    {[
                        { label: 'Weekly', value: 'weekly' },
                        { label: 'Monthly', value: 'monthly' }
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

            <div className="flex-1 min-h-[250px] w-full">
                {filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredData} barGap={8} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.03} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: '#8A7B6E', fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: '#8A7B6E', fontWeight: 'bold' }}
                                tickFormatter={(value) => `৳${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                            />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                            <Bar
                                name="Inflow"
                                dataKey="income"
                                fill="#C75B12"
                                radius={[6, 6, 0, 0]}
                                barSize={16}
                                animationDuration={1500}
                            />
                            <Bar
                                name="Outflow"
                                dataKey="expense"
                                fill="#2A2A2D"
                                radius={[6, 6, 0, 0]}
                                barSize={16}
                                animationDuration={1500}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-ink-muted space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-surface-muted dark:bg-white/5 flex items-center justify-center">
                            <BarChart3 size={24} className="opacity-20" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Synchronizing transaction logs...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionBarChart;
