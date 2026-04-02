'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Activity, Clock, Calendar, Filter, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VolumeData {
    time: string;
    tickets: number;
    jobs: number;
    sales: number;
}

interface VolumeChartProps {
    data?: VolumeData[];
    title?: string;
    total?: number;
    today?: number;
    lastHour?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0D0D0F] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 pb-1 border-b border-white/5">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[10px] font-bold text-white/60 uppercase">{entry.name}:</span>
                        </div>
                        <span className="text-xs font-black text-white tabular-nums">
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const VolumeChart: React.FC<VolumeChartProps> = ({
    data = [],
    title = "Activity Volume",
    total = 0,
    today = 0,
    lastHour = 0
}) => {
    return (
        <div className="bg-[#080809] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group transition-all hover:border-white/10">
            {/* Header / Stats Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-1">{title}</h3>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/5 px-3 py-1 rounded-lg flex items-center gap-2 border border-white/5">
                                <span className="text-[9px] font-bold text-white/30 uppercase">Total:</span>
                                <span className="text-sm font-black text-white">{total.toLocaleString()}</span>
                            </div>
                            <div className="bg-emerald-500/5 px-3 py-1 rounded-lg flex items-center gap-2 border border-emerald-500/10">
                                <span className="text-[9px] font-bold text-emerald-500/40 uppercase">Today:</span>
                                <span className="text-sm font-black text-emerald-500">{today.toLocaleString()}</span>
                            </div>
                            <div className="bg-brand/5 px-3 py-1 rounded-lg flex items-center gap-2 border border-brand/10">
                                <span className="text-[9px] font-bold text-brand/40 uppercase">1H:</span>
                                <span className="text-sm font-black text-brand">{lastHour.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                        <Clock size={12} /> Last 24H
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                        <Box size={12} /> Entity
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                        <Filter size={12} /> Filter
                    </button>
                </div>
            </div>

            {/* Legend Area */}
            <div className="flex flex-wrap gap-4 mb-6">
                {[
                    { label: 'Tickets', color: '#10b981' },
                    { label: 'Job Cards', color: '#eab308' },
                    { label: 'Sales', color: '#8b5cf6' }
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Chart Container */}
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.03} />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: '#ffffff', opacity: 0.3 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: '#ffffff', opacity: 0.3 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="tickets"
                            name="Tickets"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTickets)"
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="jobs"
                            name="Job Cards"
                            stroke="#eab308"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorJobs)"
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            name="Sales"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default VolumeChart;
