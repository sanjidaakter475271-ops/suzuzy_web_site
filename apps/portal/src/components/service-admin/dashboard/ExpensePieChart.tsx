'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartData } from '@/types/service-admin';
import { cn } from '@/lib/utils';
import { PieChart as PieIcon, Filter } from 'lucide-react';

const COLORS = ['#D4AF37', '#C75B12', '#DC2626', '#1F9D55', '#3B82F6', '#8B5CF6'];

interface ExpensePieChartProps {
    data?: ChartData[];
    lastMonthData?: ChartData[];
}

// ... (CustomTooltip stays same)

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data = [], lastMonthData = [] }) => {
    const [range, setRange] = React.useState('month');

    const activeData = React.useMemo(() => {
        return range === 'month' ? data : lastMonthData;
    }, [range, data, lastMonthData]);

    const total = activeData.reduce((sum, item) => sum + (item.value || 0), 0);

    // Add total to each item for tooltip percentage calculation
    const chartData = activeData.map(item => ({ ...item, total }));

    return (
        <div className="bg-white dark:bg-[#080809] p-8 rounded-[2.5rem] shadow-card border border-surface-border dark:border-white/5 transition-all group hover:border-brand/20 flex flex-col h-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight italic">Expense <span className="text-brand">Breakdown</span></h3>
                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mt-1">Categorized distribution</p>
                </div>

                <div className="flex items-center gap-1 bg-surface-page dark:bg-white/5 p-1 rounded-xl border border-surface-border dark:border-white/5">
                    {[
                        { label: 'MTD', value: 'month' },
                        { label: 'LMTD', value: 'last' }
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

            <div className="flex-1 min-h-[250px] relative mt-4">
                {activeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {activeData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        className="outline-none"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-ink-muted space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-surface-muted dark:bg-white/5 flex items-center justify-center text-ink-muted">
                            <PieIcon size={24} className="opacity-20" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">No data records found</p>
                    </div>
                )}

                {activeData.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className="text-[9px] font-black text-ink-muted uppercase tracking-[0.2em]">Total Out</p>
                            <p className="text-2xl font-black text-ink-heading dark:text-white tabular-nums italic">
                                ৳{total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-8 pt-6 border-t border-surface-border dark:border-white/5">
                {activeData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between min-w-0 group/item">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="text-[10px] font-black text-ink-muted uppercase tracking-tight truncate group-hover/item:text-brand transition-colors">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-ink-heading dark:text-white tabular-nums ml-2">
                            {((item.value! / total) * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpensePieChart;
