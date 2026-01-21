"use client";

import { useEffect, useState, use } from "react";
import {
    ArrowLeft,
    Download,
    Calendar as CalendarIcon,
    Filter,
    FileText,
    Loader2,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    PieChart as PieIcon,
    AlertCircle,
    Star,
    Boxes,
    BarChart3
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ReportAreaChart,
    ReportBarChart,
    ReportPieChart
} from "@/components/reports/report-charts";
import Link from "next/link";
import {
    format,
    subDays,
    eachDayOfInterval,
    isSameDay
} from "date-fns";

type ReportType = 'daily-sales' | 'profit-loss' | 'stock-valuation' | 'product-performance' | 'expense-analysis' | 'payment-collection';

export default function DynamicReportPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = use(params);
    const { profile, loading: userLoading } = useUser();

    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    // Initialize dates only on client to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
        setDateRange({
            start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            end: format(new Date(), 'yyyy-MM-dd')
        });
    }, []);

    useEffect(() => {
        if (profile?.dealer_id && mounted && dateRange.start) {
            fetchReportData();
        }
    }, [profile, type, dateRange, mounted]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const dealerId = profile?.dealer_id;
            if (!dealerId) return;

            switch (type as ReportType) {
                case 'daily-sales':
                    await fetchDailySales(dealerId as string);
                    break;
                case 'profit-loss':
                    await fetchProfitLoss(dealerId as string);
                    break;
                case 'stock-valuation':
                    await fetchStockValuation(dealerId as string);
                    break;
                case 'product-performance':
                    await fetchProductPerformance(dealerId as string);
                    break;
                case 'expense-analysis':
                case 'payment-collection':
                    setReportData({ error: "Feature implementation in progress." });
                    break;
                default:
                    setReportData({ error: "Report protocol not found." });
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            setReportData({ error: "Failed to load report data." });
        } finally {
            setLoading(false);
        }
    };

    const fetchDailySales = async (dealerId: string) => {
        const { data, error } = await supabase
            .from("sales")
            .select("total_amount, sale_date")
            .eq("dealer_id", dealerId)
            .gte("sale_date", dateRange.start)
            .lte("sale_date", dateRange.end)
            .order("sale_date", { ascending: true });

        if (error) throw error;

        const days = eachDayOfInterval({
            start: new Date(dateRange.start),
            end: new Date(dateRange.end)
        });

        const chartData = days.map(day => {
            const daySales = data?.filter(s => isSameDay(new Date(s.sale_date), day)) || [];
            return {
                date: format(day, 'MMM dd'),
                amount: daySales.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0)
            };
        });

        setReportData({
            title: "Daily Sales Registry",
            chartType: 'area',
            chartData,
            summary: {
                total: data?.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0) || 0,
                count: data?.length || 0,
                avg: (data?.length || 0) > 0 ? (data!.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0) / data!.length) : 0
            },
            table: data
        });
    };

    const fetchProfitLoss = async (dealerId: string) => {
        const [salesRes, expenseRes] = await Promise.all([
            supabase.from("sales").select("total_amount, total_cost").eq("dealer_id", dealerId).gte("sale_date", dateRange.start).lte("sale_date", dateRange.end),
            supabase.from("expenses").select("amount").eq("dealer_id", dealerId).gte("expense_date", dateRange.start).lte("expense_date", dateRange.end)
        ]);

        const revenue = salesRes.data?.reduce((acc, s) => acc + (Number(s.total_amount) || 0), 0) || 0;
        const cogs = salesRes.data?.reduce((acc, s) => acc + (Number(s.total_cost) || 0), 0) || 0;
        const grossProfit = revenue - cogs;
        const totalExpenses = expenseRes.data?.reduce((acc, e) => acc + (Number(e.amount) || 0), 0) || 0;
        const netProfit = grossProfit - totalExpenses;

        setReportData({
            title: "Profit & Loss Protocol",
            summary: { revenue, cogs, grossProfit, totalExpenses, netProfit },
            chartType: 'bar',
            chartData: [
                { name: 'Revenue', value: revenue },
                { name: 'COGS', value: cogs },
                { name: 'Expenses', value: totalExpenses },
                { name: 'Net Profit', value: netProfit }
            ]
        });
    };

    const fetchStockValuation = async (dealerId: string) => {
        const { data, error } = await supabase
            .from("inventory_batches")
            .select(`
                current_quantity,
                unit_cost_price,
                product_variants (
                    price,
                    products (name, categories(name))
                )
            `)
            .eq("dealer_id", dealerId)
            .gt("current_quantity", 0);

        if (error) throw error;

        const totalCost = data?.reduce((acc, b) => acc + (b.current_quantity * (Number(b.unit_cost_price) || 0)), 0) || 0;
        const totalMSRP = data?.reduce((acc, b) => acc + (b.current_quantity * (Number((b.product_variants as any)?.price) || 0)), 0) || 0;

        const catMap = new Map();
        data?.forEach((b: any) => {
            const catName = b.product_variants?.products?.categories?.name || 'Uncategorized';
            const value = b.current_quantity * (Number(b.unit_cost_price) || 0);
            catMap.set(catName, (catMap.get(catName) || 0) + value);
        });

        const pieData = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));

        setReportData({
            title: "Asset Valuation Dashboard",
            summary: { totalCost, totalMSRP, margin: totalMSRP - totalCost },
            chartType: 'pie',
            chartData: pieData
        });
    };

    const fetchProductPerformance = async (dealerId: string) => {
        const { data, error } = await supabase
            .from("sale_items")
            .select(`
                quantity,
                total,
                product_variants (
                    sku,
                    products (name)
                ),
                sales!inner (dealer_id, sale_date)
            `)
            .eq("sales.dealer_id", dealerId)
            .gte("sales.sale_date", dateRange.start)
            .lte("sales.sale_date", dateRange.end);

        if (error) throw error;

        const perfMap = new Map();
        data?.forEach((item: any) => {
            const name = item.product_variants?.products?.name || 'Unknown Product';
            const stats = perfMap.get(name) || { name, qty: 0, revenue: 0 };
            stats.qty += item.quantity;
            stats.revenue += Number(item.total);
            perfMap.set(name, stats);
        });

        const sorted = Array.from(perfMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        setReportData({
            title: "Merchant Intelligence",
            chartType: 'bar',
            chartData: sorted.map((i: any) => ({ name: i.name.slice(0, 15), value: i.revenue })),
            summary: {
                topProduct: sorted[0]?.name || 'N/A',
                totalQty: sorted.reduce((acc, i) => acc + i.qty, 0),
                totalRevenue: sorted.reduce((acc, i) => acc + i.revenue, 0)
            },
            table: sorted
        });
    };

    const isLoading = loading || userLoading;

    if (!mounted || isLoading) return <div className="p-12 space-y-10"><Skeleton className="h-20 w-1/3 bg-white/5" /><Skeleton className="h-96 bg-white/5 rounded-3xl" /></div>;
    if (!reportData || reportData.error) return <div className="p-20 text-center text-white/20"><AlertCircle className="mx-auto w-12 h-12 mb-4" /><p>{reportData?.error || "Protocol Error"}</p></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="space-y-6">
                <Link href="/dealer/reports" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#D4AF37] transition-all">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Hub
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-display font-black tracking-tight text-[#F8F8F8]">{reportData.title}</h1>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                            <BarChart3 className="w-3 h-3 inline mr-2 text-[#D4AF37]" />
                            Operational Period: {dateRange.start} TO {dateRange.end}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-12 px-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                            <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white focus:outline-none"
                            />
                            <span className="text-white/20">/</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white focus:outline-none"
                            />
                        </div>
                        <Button className="h-12 px-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest group">
                            <Download className="w-4 h-4 mr-2 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                            Export Data
                        </Button>
                    </div>
                </div>
            </div>

            {/* Top Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {type === 'daily-sales' && (
                    <>
                        <SummaryCard label="Aggregate Revenue" value={`৳${reportData.summary.total.toLocaleString()}`} icon={DollarSign} color="text-[#D4AF37]" />
                        <SummaryCard label="Transaction Count" value={reportData.summary.count} icon={FileText} />
                        <SummaryCard label="Average Unit Ticket" value={`৳${reportData.summary.avg.toFixed(0)}`} icon={TrendingUp} />
                        <SummaryCard label="Operational Days" value={Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 3600 * 24))} icon={CalendarIcon} />
                    </>
                )}
                {type === 'profit-loss' && (
                    <>
                        <SummaryCard label="Gross Revenue" value={`৳${reportData.summary.revenue.toLocaleString()}`} color="text-green-500" />
                        <SummaryCard label="Acquisition Cost" value={`৳${reportData.summary.cogs.toLocaleString()}`} color="text-red-500" />
                        <SummaryCard label="Overhead / Expenses" value={`৳${reportData.summary.totalExpenses.toLocaleString()}`} color="text-amber-500" />
                        <SummaryCard label="Net Profit" value={`৳${reportData.summary.netProfit.toLocaleString()}`} color="text-[#D4AF37]" />
                    </>
                )}
                {type === 'stock-valuation' && (
                    <>
                        <SummaryCard label="Capital at Cost" value={`৳${reportData.summary.totalCost.toLocaleString()}`} icon={Boxes} />
                        <SummaryCard label="Potential Revenue" value={`৳${reportData.summary.totalMSRP.toLocaleString()}`} icon={TrendingUp} />
                        <SummaryCard label="Projected Margin" value={`৳${reportData.summary.margin.toLocaleString()}`} color="text-green-500" />
                        <SummaryCard label="Categories Tracked" value={reportData.chartData.length} icon={PieIcon} />
                    </>
                )}
                {type === 'product-performance' && (
                    <>
                        <SummaryCard label="Top Performing Asset" value={reportData.summary.topProduct} icon={Star} color="text-[#D4AF37]" />
                        <SummaryCard label="Units Moved" value={reportData.summary.totalQty} icon={Package} />
                        <SummaryCard label="Combined Revenue" value={`৳${reportData.summary.totalRevenue.toLocaleString()}`} icon={TrendingUp} />
                        <SummaryCard label="Performance Index" value="TOP 10" icon={TrendingUp} />
                    </>
                )}
            </div>

            {/* Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <GlassCard className="lg:col-span-2 p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black text-[#F8F8F8] uppercase tracking-widest">Performance Visualizer</h3>
                        </div>
                    </div>
                    {reportData.chartType === 'area' && <ReportAreaChart data={reportData.chartData} xKey="date" yKey="amount" />}
                    {reportData.chartType === 'bar' && <ReportBarChart data={reportData.chartData} xKey="name" yKey="value" />}
                    {reportData.chartType === 'pie' && <ReportPieChart data={reportData.chartData} />}
                </GlassCard>

                <GlassCard className="p-8">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Filter className="w-3 h-3 text-[#D4AF37]" />
                        Deep Dive Data
                    </h3>
                    <div className="space-y-6">
                        {reportData.chartData.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="space-y-0.5 max-w-[150px]">
                                    <p className="text-[11px] font-black text-[#F8F8F8] group-hover:text-[#D4AF37] transition-colors truncate">{item.name || item.date}</p>
                                    <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#D4AF37] opacity-40 transition-all duration-500"
                                            style={{
                                                width: `${Math.min(100, (item.amount || item.value) / (
                                                    type === 'stock-valuation' ? (reportData.summary?.totalCost || 1) :
                                                        type === 'profit-loss' ? (reportData.summary?.revenue || 1) :
                                                            (reportData.summary?.total || reportData.summary?.totalRevenue || 1)
                                                ) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-display font-black text-[#F8F8F8]">৳{(item.amount || item.value)?.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon: Icon, color = "text-[#F8F8F8]" }: any) {
    return (
        <GlassCard className="p-8 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{label}</p>
                {Icon && <Icon className="w-4 h-4 text-[#D4AF37]/50" />}
            </div>
            <h4 className={`text-2xl font-display font-black tracking-tight truncate ${color}`}>{value}</h4>
        </GlassCard>
    );
}
