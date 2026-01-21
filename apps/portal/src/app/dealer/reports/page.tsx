"use client";

import {
    BarChart3,
    TrendingUp,
    PieChart,
    Boxes,
    ShoppingCart,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    LayoutDashboard,
    FileBarChart,
    Banknote,
    Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format, startOfDay, endOfDay } from "date-fns";

interface ReportCategory {
    title: string;
    description: string;
    icon: any;
    reports: {
        id: string;
        name: string;
        description: string;
        href: string;
        badge?: string;
    }[];
}

const REPORT_CATEGORIES: ReportCategory[] = [
    {
        title: "Sales & Revenue",
        description: "Analyze performance trends and top-performing assets.",
        icon: TrendingUp,
        reports: [
            { id: "daily-sales", name: "Daily Sales Registry", description: "Granular breakdown of sales for today or a specific date.", href: "/dealer/reports/daily-sales" },
            { id: "sales-summary", name: "Executive Summary", description: "Aggregated weekly and monthly performance metrics.", href: "/dealer/reports/sales-summary", badge: "POPULAR" },
            { id: "product-performance", name: "Merchant Intelligence", description: "Leaderboard of top-selling products and categories.", href: "/dealer/reports/product-performance" },
        ]
    },
    {
        title: "Financial Governance",
        description: "Monitor profitability, expenses, and capital allocation.",
        icon: Wallet,
        reports: [
            { id: "profit-loss", name: "Profit & Loss Protocol", description: "Net income vs overhead and acquisition costs.", href: "/dealer/reports/profit-loss" },
            { id: "expense-analysis", name: "Operational Overhead", description: "Detailed tracking of business expenditures.", href: "/dealer/reports/expense-analysis" },
            { id: "payment-collection", name: "Capital Inflow", description: "Cash vs Digital payment method distribution.", href: "/dealer/reports/payment-collection" },
        ]
    },
    {
        title: "Inventory Intelligence",
        description: "Valuation of assets and lifecycle management.",
        icon: Boxes,
        reports: [
            { id: "stock-valuation", name: "Asset Valuation", description: "Total capital locked in inventory at MSRP vs Cost.", href: "/dealer/reports/stock-valuation", badge: "CRITICAL" },
            { id: "batch-lifecycle", name: "Batch Audit", description: "Tracking aging stock and expiration timelines.", href: "/dealer/reports/batch-lifecycle" },
            { id: "vendor-performance", name: "Supply Chain Analytics", description: "Purchasing efficiency and vendor reliability.", href: "/dealer/reports/vendor-performance" },
        ]
    }
];

export default function ReportsHubPage() {
    const { profile } = useUser();
    const [todayStats, setTodayStats] = useState({ sales: 0, orderCount: 0, growth: 0 });

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchTodayStats();
        }
    }, [profile]);

    const fetchTodayStats = async () => {
        try {
            const today = new Date();
            const start = startOfDay(today).toISOString();
            const end = endOfDay(today).toISOString();

            const { data, error } = await supabase
                .from("sales")
                .select("total_amount")
                .eq("dealer_id", profile?.dealer_id)
                .gte("sale_date", start)
                .lte("sale_date", end);

            if (data) {
                const total = data.reduce((acc, s) => acc + (s.total_amount || 0), 0);
                setTodayStats({ sales: total, orderCount: data.length, growth: 12.5 }); // Static growth for demo
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header / Premium Banner */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0D0D0F] border border-[#D4AF37]/10 p-12">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#D4AF37]/10 via-transparent to-transparent blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[#D4AF37]">
                            <BarChart3 className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Analytics Engine</span>
                        </div>
                        <h1 className="text-5xl font-display font-black tracking-tighter text-[#F8F8F8]">Reports Hub</h1>
                        <p className="text-white/40 max-w-xl text-lg font-medium leading-relaxed">
                            Access the terminal's secure reporting protocols. Monitor real-time growth, oversee capital allocation, and command your dealership's intelligence.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-1 backdrop-blur-md">
                            <p className="text-[10px] font-black text-[#F8F8F8]/40 uppercase tracking-widest">Today's Protocol</p>
                            <p className="text-2xl font-display font-black text-[#D4AF37]">৳{todayStats.sales.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                                <ArrowUpRight className="w-3 h-3" />
                                {todayStats.growth}% VS AVG
                            </div>
                        </div>
                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-1 backdrop-blur-md">
                            <p className="text-[10px] font-black text-[#F8F8F8]/40 uppercase tracking-widest">Active Orders</p>
                            <p className="text-2xl font-display font-black text-[#F8F8F8]">{todayStats.orderCount}</p>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Real-time Fulfillment</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {REPORT_CATEGORIES.map((category, idx) => {
                    const CategoryIcon = category.icon;
                    return (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 px-2">
                                <div className="p-3 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37]">
                                    <CategoryIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-black text-[#F8F8F8] tracking-tight">{category.title}</h2>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{category.description}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {category.reports.map((report) => (
                                    <Link key={report.id} href={report.href}>
                                        <GlassCard className="p-6 group hover:border-[#D4AF37]/30 transition-all active:scale-[0.98]">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-black text-[#F8F8F8] group-hover:text-[#D4AF37] transition-colors">{report.name}</h3>
                                                        {report.badge && (
                                                            <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 text-[8px] font-black uppercase tracking-tighter h-4 px-1.5">{report.badge}</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-medium text-white/40 group-hover:text-white/60 transition-colors leading-snug">{report.description}</p>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-[#D4AF37] group-hover:text-[#0D0D0F] transition-all">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Insights Banner */}
            <GlassCard className="p-10 border-[#D4AF37]/10 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-[#D4AF37]">
                            <LayoutDashboard className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-black text-[#F8F8F8]">Bespoke Intelligence</h3>
                            <p className="text-sm font-medium text-white/40">Need a specialized report for your dealership audits? Contact system operators.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="border-white/10 hover:border-[#D4AF37]/50 text-[11px] font-black uppercase tracking-widest h-14 px-8 rounded-2xl bg-white/5">
                        <Activity className="w-4 h-4 mr-3" />
                        System Health
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
}
