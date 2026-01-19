"use client"

import { useState, useEffect } from "react";
import {
    BarChart3,
    TrendingUp,
    Users,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter,
    Download,
    Loader2
} from "lucide-react";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function DealerAnalyticsPage() {
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalViews: 12450,
        conversionRate: 3.2,
        avgOrderValue: 45000,
        customerGrowth: 12
    });

    useEffect(() => {
        if (profile?.dealer_id) {
            setLoading(false);
        }
    }, [profile?.dealer_id]);

    if (loading) {
        return (
            <div className="h-full w-full min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                        PERFORMANCE <MetallicText>COMMAND</MetallicText>
                    </h1>
                    <p className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest mt-2">
                        Advanced store intelligence & growth tracking
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 border-[#D4AF37]/20 bg-white/5 text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest">
                        <Download className="w-4 h-4 mr-2 text-[#D4AF37]" /> Export Report
                    </Button>
                    <Button className="h-10 bg-[#D4AF37] text-black hover:bg-[#B8962E] text-[10px] font-black uppercase tracking-widest px-6 shadow-[0_4px_20px_rgba(212,175,55,0.2)]">
                        Real-time Update
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Asset Views", value: stats.totalViews.toLocaleString(), change: "+14.5%", icon: Users, trend: 'up' },
                    { label: "Conversion Velocity", value: `${stats.conversionRate}%`, change: "+0.4%", icon: TrendingUp, trend: 'up' },
                    { label: "Efficiency Ratio", value: formatCurrency(stats.avgOrderValue), change: "-2.1%", icon: ShoppingBag, trend: 'down' },
                    { label: "Market Share", value: "8.4%", change: "+1.2%", icon: BarChart3, trend: 'up' }
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-6 relative group border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="w-12 h-12 text-[#D4AF37]" />
                        </div>
                        <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-1">{stat.label}</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-3xl font-display font-black text-white tracking-tighter">{stat.value}</h3>
                            <div className={`flex items-center gap-0.5 text-[10px] font-black uppercase tracking-tighter mb-1.5 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <GlassCard className="lg:col-span-2 p-8">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-display font-black italic text-[#F8F8F8]">Acquisition <span className="text-[#D4AF37]">Dynamics</span></h3>
                            <p className="text-[10px] uppercase tracking-widest text-[#A1A1AA] font-bold mt-1">Visit-to-Lead conversion window</p>
                        </div>
                        <div className="flex gap-2">
                            {['7D', '30D', '90D', 'ALL'].map((p) => (
                                <button key={p} className={`w-10 h-10 rounded-lg text-[9px] font-black transition-all ${p === '30D' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <AreaChart
                        data={[
                            { date: "Mon", value: 450 },
                            { date: "Tue", value: 520 },
                            { date: "Wed", value: 480 },
                            { date: "Thu", value: 610 },
                            { date: "Fri", value: 590 },
                            { date: "Sat", value: 720 },
                            { date: "Sun", value: 680 },
                        ]}
                        xKey="date"
                        yKey="value"
                        height={320}
                    />
                </GlassCard>

                <GlassCard className="p-8">
                    <h3 className="text-xl font-display font-black italic text-[#F8F8F8] mb-8">Category <span className="text-[#D4AF37]">Dominance</span></h3>
                    <BarChart
                        data={[
                            { name: "Sport", value: 45 },
                            { name: "Cruiser", value: 32 },
                            { name: "Naked", value: 28 },
                            { name: "Scooter", value: 15 },
                            { name: "Adventure", value: 12 },
                        ]}
                        xKey="name"
                        yKey="value"
                        height={320}
                        layout="vertical"
                        barSize={20}
                    />
                </GlassCard>
            </div>
        </div>
    );
}
