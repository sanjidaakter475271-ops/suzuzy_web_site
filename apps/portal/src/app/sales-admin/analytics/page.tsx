"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    TrendingUp,
    Users,
    Package,
    BarChart3,
    ArrowUpRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { cn } from "@/lib/utils";

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [dealerData, setDealerData] = useState<any[]>([]);
    const [productData, setProductData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Parallel fetching
            const [weekly, dealers, products] = await Promise.all([
                supabase.from('v_weekly_comparison').select('*'),
                supabase.from('v_dealer_sales_summary').select('*').limit(5),
                supabase.from('v_top_selling_products').select('*').limit(5)
            ]);

            if (weekly.data) setWeeklyData(weekly.data.reverse()); // Ensure chronological order
            if (dealers.data) setDealerData(dealers.data);
            if (products.data) setProductData(products.data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-display font-black text-[#F8F8F8] italic uppercase tracking-tighter">Advanced Analytics</h1>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Deep Dive into Sales Performance</p>
            </div>

            {/* Weekly Comparison Chart */}
            <GlassCard className="p-6 h-[400px] border-white/5 bg-[#0D0D0F]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-sm font-black text-[#F8F8F8] uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#D4AF37]" /> Weekly Sales Velocity
                        </h3>
                        <p className="text-[10px] text-white/30 font-bold mt-1">This Week vs Last Week Revenue</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                            <span className="text-[10px] text-white/50 uppercase font-bold">This Week</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                            <span className="text-[10px] text-white/50 uppercase font-bold">Last Week</span>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="day_name"
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
                                dataKey="current_week_revenue"
                                stroke="#D4AF37"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCurrent)"
                                name="Current Revenue"
                            />
                            <Area
                                type="monotone"
                                dataKey="last_week_revenue"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth={2}
                                fillOpacity={0}
                                // strokeDasharray="5 5"
                                name="Previous Revenue"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dealer Performance */}
                <GlassCard className="p-6 h-[400px] border-white/5 bg-[#0D0D0F]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-black text-[#F8F8F8] uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#10B981]" /> Top Performing Dealers
                            </h3>
                            <p className="text-[10px] text-white/30 font-bold mt-1">Revenue by Dealer Context</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dealerData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="dealer_name"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="total_sales" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Product Performance */}
                <GlassCard className="p-6 h-[400px] border-white/5 bg-[#0D0D0F]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-black text-[#F8F8F8] uppercase tracking-widest flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#3B82F6]" /> Product Mix
                            </h3>
                            <p className="text-[10px] text-white/30 font-bold mt-1">Revenue Distribution by Product</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={productData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="total_revenue"
                                    nameKey="product_name"
                                >
                                    {productData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A1A1C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
