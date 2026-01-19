"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import {
    Users,
    Package,
    Clock,
    ShieldCheck,
    ArrowRight,
    AlertCircle,
    ShoppingBag,
    TrendingUp,
    LayoutGrid,
    Zap,
    Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [stats, setStats] = useState({
        pendingDealers: 0,
        pendingProducts: 0,
        totalActiveDealers: 0,
        recentOrders: 0,
    });
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);

    async function fetchAdminData() {
        setIsSyncing(true);
        try {
            const [
                { count: pDCount },
                { count: pPCount },
                { count: aDCount },
                { count: rOCount },
                { data: revData },
                { data: catData }
            ] = await Promise.all([
                supabase.from('dealers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('dealers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('orders').select('*', { count: 'exact', head: true }).limit(50),
                supabase.from('sub_orders').select('dealer_amount, created_at').eq('status', 'delivered'),
                supabase.from('categories').select('name, products(count)')
            ]);

            setStats({
                pendingDealers: pDCount || 0,
                pendingProducts: pPCount || 0,
                totalActiveDealers: aDCount || 0,
                recentOrders: rOCount || 0,
            });

            // Process revenue chart data
            const revMap = new Map();
            revData?.forEach(r => {
                const date = new Date(r.created_at).toLocaleDateString();
                revMap.set(date, (revMap.get(date) || 0) + Number(r.dealer_amount));
            });
            const processedRev = Array.from(revMap).map(([date, value]) => ({ date, value })).slice(-7);
            setRevenueData(processedRev.length > 0 ? processedRev : [{ date: "Launch", value: 0 }]);

            // Process category distribution
            const processedCats = catData?.map(c => ({
                name: c.name,
                value: (c.products as any)?.[0]?.count || 0
            })).sort((a, b) => b.value - a.value).slice(0, 5) || [];
            setCategoryData(processedCats);

        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
            setTimeout(() => setIsSyncing(false), 1000);
        }
    }

    useEffect(() => {
        fetchAdminData();

        // Real-time subscriptions
        const sub = supabase.channel('admin-dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'dealers' }, () => fetchAdminData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchAdminData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_orders' }, () => fetchAdminData())
            .subscribe();

        return () => {
            supabase.removeChannel(sub);
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        ADMIN <span className="text-[#D4AF37]">CONSOLE</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-sm font-medium tracking-wide flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        OPERATIONAL MODERATION HUB
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500",
                        isSyncing
                            ? "bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    )}>
                        {isSyncing ? (
                            <Zap className="w-3 h-3 animate-pulse" />
                        ) : (
                            <Activity className="w-3 h-3" />
                        )}
                        <span className="text-[10px] font-black tracking-widest uppercase italic">
                            {isSyncing ? "Syncing..." : "Systems Live"}
                        </span>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Pending Dealers"
                    value={stats.pendingDealers}
                    icon={Users}
                    trend={stats.pendingDealers > 0 ? "up" : "neutral"}
                    loading={loading}
                    className={stats.pendingDealers > 0 ? "border-[#D4AF37]/40 bg-[#D4AF37]/5" : ""}
                />
                <KPICard
                    title="Pending Products"
                    value={stats.pendingProducts}
                    icon={Package}
                    trend={stats.pendingProducts > 0 ? "up" : "neutral"}
                    loading={loading}
                    className={stats.pendingProducts > 0 ? "border-[#D4AF37]/40 bg-[#D4AF37]/5" : ""}
                />
                <KPICard
                    title="Active Network"
                    value={stats.totalActiveDealers}
                    icon={ShieldCheck}
                    trend="up"
                    loading={loading}
                />
                <KPICard
                    title="Registry Volume"
                    value={stats.recentOrders}
                    icon={ShoppingBag}
                    trend="neutral"
                    loading={loading}
                />
            </div>

            {/* Intelligence Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Global Revenue Velocity */}
                <div className="lg:col-span-2 bg-[#0D0D0F]/40 backdrop-blur-xl border border-[#D4AF37]/10 rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-display font-black italic text-[#F8F8F8]">Platform <span className="text-[#D4AF37]">Velocity</span></h3>
                            <p className="text-[10px] uppercase tracking-widest text-[#A1A1AA] font-bold mt-1">Aggregate Settlement Value (NPR)</p>
                        </div>
                    </div>
                    <AreaChart
                        data={revenueData}
                        xKey="date"
                        yKey="value"
                        height={320}
                        gradientId="adminRevenueGradient"
                    />
                </div>

                {/* Category Pulse */}
                <div className="bg-[#0D0D0F]/40 backdrop-blur-xl border border-[#D4AF37]/10 rounded-3xl p-8">
                    <h3 className="text-xl font-display font-black italic text-[#F8F8F8] mb-8">Category <span className="text-[#D4AF37]">Pulse</span></h3>
                    <BarChart
                        data={categoryData}
                        xKey="name"
                        yKey="value"
                        height={320}
                        layout="vertical"
                        barSize={20}
                    />
                </div>
            </div>

            {/* Moderation Queues Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Dealer Moderation Card */}
                <div className="rounded-3xl bg-[#0D0D0F] border border-[#D4AF37]/10 p-8 group hover:border-[#D4AF37]/30 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-[60px] rounded-full -mr-10 -mt-10" />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-5 h-5 text-[#D4AF37]" />
                            <h3 className="text-xl font-display font-bold text-[#F8F8F8] italic">Dealer <span className="text-[#D4AF37]">Waitlist</span></h3>
                        </div>

                        <p className="text-sm text-[#A1A1AA] mb-8 leading-relaxed">
                            {stats.pendingDealers} businesses are waiting for identity verification and platform access approval.
                        </p>

                        <div className="mt-auto">
                            <Link href="/admin/dealers">
                                <Button className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] h-12">
                                    Review Applications <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Product Moderation Card */}
                <div className="rounded-3xl bg-[#1A1A1C] border border-[#D4AF37]/10 p-8 group hover:border-[#D4AF37]/30 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#DC2626]/5 blur-[60px] rounded-full -mr-10 -mt-10" />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <Package className="w-5 h-5 text-[#DC2626]" />
                            <h3 className="text-xl font-display font-bold text-[#F8F8F8] italic">Product <span className="text-[#DC2626]">Audit</span></h3>
                        </div>

                        <p className="text-sm text-[#A1A1AA] mb-8 leading-relaxed">
                            {stats.pendingProducts} items currently in the moderation queue awaiting specification and image quality check.
                        </p>

                        <div className="mt-auto">
                            <Link href="/admin/products">
                                <Button className="w-full border border-[#DC2626]/20 bg-[#DC2626]/5 hover:bg-[#DC2626]/10 text-[#DC2626] font-black uppercase tracking-widest text-[10px] h-12">
                                    Audit Catalog <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Catalog Tools */}
            <div className="rounded-3xl bg-gradient-to-r from-[#1A1A1C] to-[#0D0D0F] border border-[#D4AF37]/10 p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <LayoutGrid className="w-4 h-4 text-[#D4AF37]" />
                            <h3 className="text-lg font-display font-bold text-[#F8F8F8] italic">Taxonomy <span className="text-[#D4AF37]">Engine</span></h3>
                        </div>
                        <p className="text-xs text-[#A1A1AA] uppercase tracking-widest font-black">Refine categories, manage global brands, and enforce catalog standards</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link href="/admin/catalog/categories" className="flex-1 md:flex-none">
                            <Button variant="outline" className="w-full border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-[10px] font-black uppercase tracking-widest">
                                Categories
                            </Button>
                        </Link>
                        <Link href="/admin/catalog/brands" className="flex-1 md:flex-none">
                            <Button variant="outline" className="w-full border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-[10px] font-black uppercase tracking-widest">
                                Brands
                            </Button>
                        </Link>
                        <Link href="/admin/catalog" className="flex-1 md:flex-none">
                            <Button className="w-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 text-[10px] font-black uppercase tracking-widest">
                                Catalog Hub
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
