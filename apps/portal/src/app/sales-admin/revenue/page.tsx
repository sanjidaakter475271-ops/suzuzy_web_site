"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    Calculator,
    DollarSign,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Target
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { cn } from "@/lib/utils";

export default function RevenuePage() {
    // Calculator State
    const [saleAmount, setSaleAmount] = useState<number>(0);
    const [commissionRate, setCommissionRate] = useState<number>(10); // Default 10%
    const [activeCalcTab, setActiveCalcTab] = useState<'commission' | 'payout'>('commission');

    // Chart State
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenueData = async () => {
            const { data } = await supabase.from('v_monthly_revenue_trend').select('*');
            if (data) {
                // Transform for Recharts
                const formatted = data.map(d => ({
                    month: new Date(d.month).toLocaleDateString('en-US', { month: 'short' }),
                    revenue: Number(d.total_revenue),
                    profit: Number(d.total_revenue) * 0.15 // Simulated profit data for demo
                })).reverse();
                setRevenueData(formatted);
            }
            setLoading(false);
        };
        fetchRevenueData();
    }, []);

    // Calculator Logic
    const platformEarnings = (saleAmount * commissionRate) / 100;
    const dealerPayout = saleAmount - platformEarnings;
    const annualProjection = platformEarnings * 12 * 30; // Rough valid projection based on daily input

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 overflow-hidden">

            {/* Left: Calculator Suite */}
            <div className="w-full lg:w-[450px] flex flex-col gap-6">
                <GlassCard className="p-8 flex-1 border-[#D4AF37]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 space-y-8">
                        <div>
                            <h2 className="text-2xl font-display font-black text-[#F8F8F8] italic uppercase tracking-tight flex items-center gap-3">
                                <Calculator className="w-6 h-6 text-[#D4AF37]" /> Revenue Engine
                            </h2>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Projection & Commission Tool</p>
                        </div>

                        {/* Input Section */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase text-white/50 tracking-widest">Sale Amount (BDT)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">৳</span>
                                    <Input
                                        type="number"
                                        value={saleAmount || ''}
                                        onChange={(e) => setSaleAmount(Number(e.target.value))}
                                        className="h-14 pl-10 text-xl font-bold bg-[#0D0D0F] border-white/10 rounded-xl focus:border-[#D4AF37]/50"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <label className="text-xs font-black uppercase text-white/50 tracking-widest">Commission Rate</label>
                                    <span className="text-xs font-bold text-[#D4AF37]">{commissionRate}%</span>
                                </div>
                                <Slider
                                    value={[commissionRate]}
                                    onValueChange={(v) => setCommissionRate(v[0])}
                                    max={30}
                                    step={0.5}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-[10px] text-white/20 font-bold uppercase">
                                    <span>0%</span>
                                    <span>Standard (10%)</span>
                                    <span>Max (30%)</span>
                                </div>
                            </div>
                        </div>

                        {/* Results Matrix */}
                        <div className="p-6 rounded-2xl bg-[#0D0D0F] border border-white/5 space-y-4">
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-[#10B981]" />
                                    </div>
                                    <span className="text-xs font-bold text-white/60 uppercase">Platform Cut</span>
                                </div>
                                <span className="text-xl font-black text-[#10B981]">৳{platformEarnings.toLocaleString()}</span>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                                        <Store className="w-4 h-4 text-[#3B82F6]" />
                                    </div>
                                    <span className="text-xs font-bold text-white/60 uppercase">Dealer Payout</span>
                                </div>
                                <span className="text-xl font-black text-[#F8F8F8]">৳{dealerPayout.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <Button className="h-12 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest border border-white/5">
                                Save Preset
                            </Button>
                            <Button className="h-12 bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] text-xs font-black uppercase tracking-widest">
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Right: Charts & Trends */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Projected ARR', value: '৳2.4M', trend: '+12%', icon: Target, color: 'text-purple-400' },
                        { label: 'Avg Commission', value: '8.5%', trend: '-0.5%', icon: PieChart, color: 'text-orange-400' },
                        { label: 'Active Streams', value: '24', trend: 'Stable', icon: TrendingUp, color: 'text-blue-400' },
                    ].map((stat, i) => (
                        <GlassCard key={i} className="p-5 flex flex-col justify-between h-32 border-white/5">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">{stat.label}</span>
                                <stat.icon className={cn("w-4 h-4", stat.color)} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-display font-black text-[#F8F8F8] italic">{stat.value}</h3>
                                <p className="text-[10px] text-green-500 font-bold flex items-center gap-1 mt-1">
                                    <ArrowUpRight className="w-3 h-3" /> {stat.trend} <span className="text-white/20">vs last period</span>
                                </p>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Main Chart */}
                <GlassCard className="flex-1 p-6 relative flex flex-col border-white/5 bg-[#0D0D0F]/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-[#F8F8F8] uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#D4AF37]" /> Revenue vs Profit Trend
                            </h3>
                            <p className="text-[10px] text-white/30 mt-1 pl-6">6 Month Rolling Average</p>
                        </div>
                        <div className="flex gap-2">
                            {['1M', '3M', '6M', '1Y'].map(range => (
                                <button key={range} className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-0">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <span className="text-xs text-white/20 animate-pulse font-bold uppercase tracking-widest">Loading Analytics Model...</span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        stroke="rgba(255,255,255,0.2)"
                                        tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.2)"
                                        tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#D4AF37"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="profit"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorProfit)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}

function Store(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
            <path d="M2 7h20" />
            <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
        </svg>
    )
}
