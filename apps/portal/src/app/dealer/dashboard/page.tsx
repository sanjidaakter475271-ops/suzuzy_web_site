"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { LiveOperationsFeed } from "@/components/dashboard/live-operations-feed";
import { DollarSign, ShoppingBag, Package, TrendingUp, Loader2, Activity, Zap } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";

interface RevenueData {
    date: string;
    value: number;
    [key: string]: string | number;
}

interface TopProduct {
    name: string;
    value: number;
    [key: string]: string | number;
}

interface OrderItem {
    id: string;
    created_at: string;
    status: string;
    dealer_amount: number;
    orders?: {
        order_number: string;
        shipping_name: string;
    };
}


export default function DealerDashboard() {
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [stats, setStats] = useState({
        revenue: 0,
        activeOrders: 0,
        totalProducts: 0,
        lowStock: 0
    });
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);

    // Socket.io integration
    const { socket, isConnected } = useSocket();

    async function fetchDashboard() {
        if (!profile?.dealer_id) return;

        setIsSyncing(true);
        try {
            const res = await fetch('/api/v1/dashboard/stats');
            if (!res.ok) throw new Error("Dashboard sync failure");
            const result = await res.json();

            if (result.success && result.data) {
                const { deliveredOrders, activeCount, prodCount, lowStockCount, topProducts: topP, recentOrders: recent } = result.data;

                // Process revenue chart data (simple group by date)
                const revMap = new Map();
                deliveredOrders.forEach((r: any) => {
                    const date = new Date(r.created_at).toLocaleDateString();
                    revMap.set(date, (revMap.get(date) || 0) + Number(r.dealer_amount));
                });
                const processedRev = Array.from(revMap).map(([date, value]) => ({ date, value })).slice(-7);

                setStats({
                    revenue: deliveredOrders.reduce((acc: number, curr: any) => acc + Number(curr.dealer_amount), 0),
                    activeOrders: activeCount,
                    totalProducts: prodCount,
                    lowStock: lowStockCount
                });

                setRevenueData(processedRev.length > 0 ? processedRev : [{ date: "No sales", value: 0 }]);
                setTopProducts(topP as TopProduct[]);
                setRecentOrders(recent as any[]);
            }
        } catch (error) {
            console.error("Dashboard sync error:", error);
        } finally {
            setLoading(false);
            setTimeout(() => setIsSyncing(false), 1000);
        }
    }

    // Initial fetch only
    useEffect(() => {
        if (profile?.dealer_id) {
            fetchDashboard();
        }
    }, [profile?.dealer_id]); // Only runs when dealer_id changes/loads, preventing loops

    // Realtime events
    useEffect(() => {
        if (!socket) return;

        // Listener logic
        const handleUpdate = (data: any) => {
            console.log("Realtime update received:", data);
            toast.info("New activity detected", { description: "Dashboard updated" });
            fetchDashboard(); // Re-fetch to get latest atomic stats
        };

        socket.on('order:changed', handleUpdate);
        socket.on('inventory:changed', handleUpdate);
        socket.on('sale:received', handleUpdate);

        return () => {
            socket.off('order:changed', handleUpdate);
            socket.off('inventory:changed', handleUpdate);
            socket.off('sale:received', handleUpdate);
        };
    }, [socket, profile?.dealer_id]);


    if (loading) {
        return (
            <div className="h-full w-full min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold text-[#F8F8F8]">
                        Dashboard <span className="text-[#D4AF37]">Overview</span>
                    </h1>
                    <p className="text-[#A1A1AA] mt-2">
                        Welcome back, <span className="font-bold text-[#F8F8F8] italic">{profile?.full_name}</span>. Here&apos;s your latest store performance.
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

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Net Earnings"
                    value={formatCurrency(stats.revenue)}
                    change={0}
                    changeLabel="Accumulated total"
                    icon={DollarSign}
                    trend="up"
                />
                <KPICard
                    title="Active Orders"
                    value={stats.activeOrders.toString()}
                    change={0}
                    changeLabel="Processing queue"
                    icon={ShoppingBag}
                    trend="neutral"
                />
                <KPICard
                    title="Total Catalog"
                    value={stats.totalProducts.toString()}
                    change={0}
                    changeLabel={`${stats.lowStock} low stock alerts`}
                    icon={Package}
                    trend={stats.lowStock > 0 ? "down" : "up"}
                />
                <KPICard
                    title="Growth Factor"
                    value="-- %"
                    change={0}
                    changeLabel="Monthly projection"
                    icon={TrendingUp}
                    trend="neutral"
                />
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 auto-rows-fr">
                {/* Revenue Velocity Chart */}
                <div className="xl:col-span-2 bg-[#0D0D0F]/40 backdrop-blur-xl border border-[#D4AF37]/10 rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-display font-black italic text-[#F8F8F8]">Revenue <span className="text-[#D4AF37]">Velocity</span></h3>
                            <p className="text-[10px] uppercase tracking-widest text-[#A1A1AA] font-bold mt-1">Net Dealer Share (NPR)</p>
                        </div>
                    </div>
                    <AreaChart
                        data={revenueData}
                        xKey="date"
                        yKey="value"
                        height={320}
                        gradientId="revenueGradient"
                    />
                </div>

                {/* Live Operations Feed */}
                <LiveOperationsFeed orders={recentOrders} />

                {/* Performance Chart - Full Width in a 3-col grid logic if needed, but here we place it below */}
                <div className="bg-[#0D0D0F]/40 backdrop-blur-xl border border-[#D4AF37]/10 rounded-3xl p-8">
                    <h3 className="text-xl font-display font-black italic text-[#F8F8F8] mb-8">Asset <span className="text-[#D4AF37]">Performance</span></h3>
                    <BarChart
                        data={topProducts}
                        xKey="name"
                        yKey="value"
                        height={320}
                        layout="vertical"
                        barSize={20}
                    />
                </div>

                {/* Placeholder or Additional Insight Card if needed */}
                <div className="xl:col-span-2 bg-gradient-to-br from-[#D4AF37]/5 to-transparent border border-[#D4AF37]/10 rounded-3xl p-8 flex items-center justify-between">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-display font-black italic text-[#F8F8F8]">Upgrade your <span className="text-[#D4AF37]">Performance</span></h3>
                        <p className="text-sm text-[#A1A1AA] max-w-md">Your current plan gives you access to premium analytics. Monitor your top performing products and optimize your inventory for maximum ROI.</p>
                        <button className="px-6 py-2 bg-[#D4AF37] text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-[#B8962E] transition-colors">
                            View Plan Limits
                        </button>
                    </div>
                    <div className="hidden md:block opacity-20 transform -rotate-12">
                        <TrendingUp className="w-32 h-32 text-[#D4AF37]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
