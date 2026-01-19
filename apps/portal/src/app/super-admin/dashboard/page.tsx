"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { AreaChart } from "@/components/charts/area-chart";
import {
    DollarSign,
    Users,
    Package,
    TrendingUp,
    ArrowRight,
    Clock,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuperAdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeDealers: 0,
        pendingApprovals: 0,
        totalProducts: 0,
        revenueChange: 12.5, // Mock for now until we have history
    });

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                // Fetch real stats from Supabase
                const [
                    { data: revenueData },
                    { count: dealerCount },
                    { count: pendingCount },
                    { count: productCount }
                ] = await Promise.all([
                    supabase.from('orders').select('grand_total').eq('payment_status', 'paid').returns<{ grand_total: number | null }[]>(),
                    supabase.from('dealers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                    supabase.from('sub_orders').select('*', { count: 'exact', head: true }),
                    supabase.from('products').select('*', { count: 'exact', head: true })
                ]);

                const totalRevenue = revenueData?.reduce((acc: number, curr: { grand_total: number | null }) => acc + (curr.grand_total || 0), 0) || 0;

                setStats({
                    totalRevenue,
                    activeDealers: dealerCount || 0,
                    pendingApprovals: pendingCount || 0,
                    totalProducts: productCount || 0,
                    revenueChange: 12.5,
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();

        // Subscribe to changes for real-time updates
        const dealerSubscription = supabase
            .channel('dealer-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'dealers' }, () => fetchStats())
            .subscribe();

        const orderSubscription = supabase
            .channel('order-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchStats())
            .subscribe();

        return () => {
            supabase.removeChannel(dealerSubscription);
            supabase.removeChannel(orderSubscription);
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
        >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        DASHBOARD <span className="text-[#D4AF37]">OVERVIEW</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-sm font-medium tracking-wide flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        REAL-TIME PLATFORM INTELLIGENCE
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/super-admin/reports">
                        <Button variant="outline" className="border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs font-bold uppercase tracking-widest">
                            Extract Reports
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Platform Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    change={stats.revenueChange}
                    icon={DollarSign}
                    trend="up"
                    loading={loading}
                />
                <KPICard
                    title="Active Dealers"
                    value={stats.activeDealers}
                    change={5}
                    changeLabel="new this month"
                    icon={Users}
                    trend="up"
                    loading={loading}
                />
                <KPICard
                    title="Pending Approvals"
                    value={stats.pendingApprovals}
                    icon={ShieldCheck}
                    trend="neutral"
                    loading={loading}
                    className={stats.pendingApprovals > 0 ? "border-[#D4AF37]/40 bg-[#D4AF37]/5" : ""}
                />
                <KPICard
                    title="Total Catalog Size"
                    value={stats.totalProducts}
                    icon={Package}
                    trend="up"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-[#0D0D0F] border border-[#D4AF37]/10 p-8 group hover:border-[#D4AF37]/30 transition-all duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-display font-bold text-[#F8F8F8] italic">Revenue <span className="text-[#D4AF37]">Trajectory</span></h3>
                            <p className="text-[10px] text-[#A1A1AA] uppercase tracking-[0.2em] font-black mt-1">Global Transaction Volume</p>
                        </div>
                        <div className="flex gap-2">
                            {['30D', '90D', '1Y'].map((period) => (
                                <button key={period} className="px-3 py-1 rounded-full text-[10px] font-black border border-white/10 text-white/40 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all">
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        {/* Placeholder for real chart data integration */}
                        <AreaChart
                            data={[
                                { date: 'Jan', value: 45000 },
                                { date: 'Feb', value: 52000 },
                                { date: 'Mar', value: 48000 },
                                { date: 'Apr', value: 61000 },
                                { date: 'May', value: 55000 },
                                { date: 'Jun', value: 72000 },
                            ]}
                            xKey="date"
                            yKey="value"
                            height={300}
                        />
                    </div>
                </div>

                {/* Critical Alerts / Quick Actions */}
                <div className="space-y-6">
                    <div className="rounded-3xl bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F] border border-[#D4AF37]/10 p-8 h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
                            <h3 className="text-lg font-display font-bold text-[#F8F8F8]">Platform <span className="text-[#DC2626]">Pulse</span></h3>
                        </div>

                        <div className="space-y-4">
                            {stats.pendingApprovals > 0 ? (
                                <Link href="/super-admin/dealers" className="block p-4 rounded-2xl bg-[#DC2626]/5 border border-[#DC2626]/20 hover:bg-[#DC2626]/10 transition-all group">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-black text-[#DC2626] uppercase tracking-widest">Action Required</p>
                                            <p className="text-sm font-bold text-[#F8F8F8] mt-1">{stats.pendingApprovals} Pending Dealer Applications</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[#DC2626] group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ) : (
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50">
                                    <p className="text-xs font-black text-[#A1A1AA] uppercase tracking-widest">System Healthy</p>
                                    <p className="text-sm font-bold text-[#F8F8F8] mt-1">No pending applications</p>
                                </div>
                            )}

                            <div className="p-6 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10">
                                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-4">Quick Governance</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="p-3 rounded-xl bg-white/5 hover:bg-[#D4AF37]/10 border border-white/5 hover:border-[#D4AF37]/20 transition-all text-[10px] font-bold text-[#F8F8F8]">
                                        Freeze All Payouts
                                    </button>
                                    <button className="p-3 rounded-xl bg-white/5 hover:bg-[#D4AF37]/10 border border-white/5 hover:border-[#D4AF37]/20 transition-all text-[10px] font-bold text-[#F8F8F8]">
                                        System Blast
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
