"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { supabase } from "@/lib/supabase";
import { BarChart, Activity, DollarSign, Wallet, TrendingUp, CreditCard, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, Cell } from "recharts";

// Interfaces
interface LiveStats {
    today_transactions: number;
    today_revenue: number;
    today_profit: number;
    today_avg_order: number;
    active_dealers_today: number;
    today_due_amount: number;
}

interface HourlyData {
    hour: number;
    transaction_count: number;
    revenue: number;
    profit: number;
}

interface PaymentData {
    payment_method: string;
    transaction_count: number;
    total_amount: number;
    percentage: number;
}

export default function SalesDashboardPage() {
    const [stats, setStats] = useState<LiveStats | null>(null);
    const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
    const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        // Fetch Live Stats
        const { data: statsData } = await supabase.from('v_today_live_stats').select('*').single();
        if (statsData) setStats(statsData);

        // Fetch Hourly Data
        const { data: hourly } = await supabase.from('v_hourly_sales_today').select('*').order('hour');
        if (hourly) setHourlyData(hourly);

        // Fetch Payment Breakdown
        const { data: payment } = await supabase.from('v_payment_method_breakdown').select('*');
        if (payment) setPaymentData(payment);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel('sales-dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount);
    };

    const profitMargin = stats ? (stats.today_profit / stats.today_revenue) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-black italic tracking-tighter text-[#F8F8F8]">
                        <span className="text-[#10B981]">LIVE</span> PROTOCOLS
                    </h2>
                    <p className="text-xs text-[#A1A1AA] font-mono mt-1">REAL-TIME REVENUE MONITORING</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-[#10B981] tracking-widest">System Online</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Today's Revenue"
                    value={stats ? formatCurrency(stats.today_revenue) : "..."}
                    icon={DollarSign}
                    loading={loading}
                    trend="up"
                    change={12.5} // Dummy change for now
                    className="border-l-4 border-l-[#10B981]"
                />
                <KPICard
                    title="Sales Count"
                    value={stats ? stats.today_transactions : "..."}
                    icon={Activity}
                    loading={loading}
                    trend="neutral"
                    change={0}
                />
                <KPICard
                    title="Avg Order Value"
                    value={stats ? formatCurrency(stats.today_avg_order) : "..."}
                    icon={Wallet}
                    loading={loading}
                />
                <KPICard
                    title="Profit Margin"
                    value={stats ? `${profitMargin.toFixed(1)}%` : "..."}
                    icon={TrendingUp}
                    loading={loading}
                    trend={profitMargin > 15 ? "up" : "down"}
                    change={0.8}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hourly Sales Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 rounded-2xl bg-[#0D0D0F] border border-[#D4AF37]/10 p-6 relative group overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
                            <BarChart className="w-4 h-4" /> Hourly Velocity
                        </h3>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="hour" stroke="#333" fontSize={10} tickFormatter={(val) => `${val}:00`} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1A1A1C', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#F8F8F8', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Payment Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl bg-[#0D0D0F] border border-[#D4AF37]/10 p-6 relative overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Methods
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {paymentData.map((item, idx) => (
                            <div key={item.payment_method} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="capitalize font-medium text-[#F8F8F8]">{item.payment_method}</span>
                                    <span className="text-[#A1A1AA]">{item.percentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percentage}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className={`h-full rounded-full ${item.payment_method === 'cash' ? 'bg-[#10B981]' :
                                                item.payment_method === 'bkash' ? 'bg-[#EC4899]' :
                                                    'bg-[#3B82F6]'
                                            }`}
                                    />
                                </div>
                                <p className="text-[10px] text-[#A1A1AA] text-right">
                                    {formatCurrency(item.total_amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
