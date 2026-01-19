"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    Wallet,
    ArrowDownCircle,
    ArrowUpCircle,
    Clock,
    Receipt,
    ExternalLink,
    Loader2,
    TrendingUp,
    PieChart,
    ArrowRight,
    ArrowUpRight,
    Search,
    Filter,
    Calendar,
    ChevronDown,
    Activity,
    CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Payout {
    id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payout_method: string;
    processed_at: string | null;
    created_at: string;
}

interface EarningItem {
    id: string;
    order_number: string;
    created_at: string;
    subtotal: number;
    commission_amount: number;
    dealer_amount: number;
    status: string;
}

export default function DealerFinance() {
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [earnings, setEarnings] = useState<EarningItem[]>([]);
    const [activeTab, setActiveTab] = useState<'payouts' | 'earnings'>('earnings');
    const [stats, setStats] = useState({
        grossVolume: 0,
        totalCommission: 0,
        netEarnings: 0,
        paidOut: 0,
        availableBalance: 0,
        pendingSettlement: 0
    });

    useEffect(() => {
        async function fetchFinanceData() {
            if (!profile?.dealer_id) return;

            setLoading(true);
            try {
                const [
                    { data: payoutData },
                    { data: subOrderData }
                ] = await Promise.all([
                    supabase.from('dealer_payouts').select('*').eq('dealer_id', profile.dealer_id).order('created_at', { ascending: false }),
                    supabase.from('sub_orders').select(`
                        id, 
                        dealer_amount, 
                        commission_amount, 
                        subtotal, 
                        status, 
                        created_at, 
                        orders (order_number)
                    `).eq('dealer_id', profile.dealer_id).order('created_at', { ascending: false })
                ]);

                // Calculate Stats
                const paidSum = payoutData?.filter(p => p.status === 'completed').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

                const gross = subOrderData?.reduce((acc, curr) => acc + Number(curr.subtotal), 0) || 0;
                const comm = subOrderData?.reduce((acc, curr) => acc + Number(curr.commission_amount), 0) || 0;
                const net = subOrderData?.reduce((acc, curr) => acc + Number(curr.dealer_amount), 0) || 0;

                const settledNet = subOrderData?.filter(o => o.status === 'delivered').reduce((acc, curr) => acc + Number(curr.dealer_amount), 0) || 0;
                const pendingNet = subOrderData?.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').reduce((acc, curr) => acc + Number(curr.dealer_amount), 0) || 0;

                setStats({
                    grossVolume: gross,
                    totalCommission: comm,
                    netEarnings: net,
                    paidOut: paidSum,
                    availableBalance: settledNet - paidSum,
                    pendingSettlement: pendingNet
                });

                setPayouts(payoutData || []);

                const formattedEarnings = (subOrderData || []).map(o => {
                    const orderData = Array.isArray(o.orders) ? o.orders[0] : o.orders;
                    return {
                        id: o.id,
                        order_number: (orderData as any)?.order_number || 'UNKNOWN',
                        created_at: o.created_at,
                        subtotal: Number(o.subtotal),
                        commission_amount: Number(o.commission_amount),
                        dealer_amount: Number(o.dealer_amount),
                        status: o.status
                    };
                });
                setEarnings(formattedEarnings);

            } catch (error) {
                console.error("Error fetching finance data:", error);
                toast.error("Financial synchronization failed");
            } finally {
                setLoading(false);
            }
        }

        fetchFinanceData();
    }, [profile?.dealer_id]);

    const payoutColumns: ColumnDef<Payout>[] = [
        {
            accessorKey: "id",
            header: "REF ID",
            cell: ({ row }) => (
                <div className="text-[10px] font-mono text-[#D4AF37] font-bold">
                    #{row.original.id.slice(0, 8)}
                </div>
            )
        },
        {
            accessorKey: "created_at",
            header: "Timeline",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-white font-bold">{format(new Date(row.original.created_at), "MMM d, yyyy")}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">{format(new Date(row.original.created_at), "HH:mm")}</span>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Valuation",
            cell: ({ row }) => (
                <span className="font-display font-black text-[#D4AF37] italic text-sm">{formatCurrency(row.original.amount)}</span>
            )
        },
        {
            accessorKey: "payout_method",
            header: "Channel",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white/5 border-white/5 text-white/40 text-[9px] font-black tracking-tighter">
                        {row.original.payout_method}
                    </Badge>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={cn(
                        "uppercase tracking-[0.2em] font-black text-[9px] px-3 py-1",
                        row.original.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            row.original.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                "bg-white/5 text-white/40 border-white/10"
                    )}
                >
                    {row.original.status}
                </Badge>
            )
        }
    ];

    const earningColumns: ColumnDef<EarningItem>[] = [
        {
            accessorKey: "id",
            header: "XID",
            cell: ({ row }) => (
                <div className="text-[10px] font-mono text-[#D4AF37] font-bold">
                    #{row.original.id.slice(0, 8)}
                </div>
            )
        },
        {
            accessorKey: "order_number",
            header: "Order Ref",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-white font-bold">{row.original.order_number}</span>
                    <span className="text-[9px] text-white/30 font-mono tracking-tighter">{format(new Date(row.original.created_at), "MMM d, HH:mm")}</span>
                </div>
            )
        },
        {
            accessorKey: "subtotal",
            header: "Gross (৳)",
            cell: ({ row }) => <span className="text-white/60 font-medium">{formatCurrency(row.original.subtotal)}</span>
        },
        {
            accessorKey: "commission_amount",
            header: "Comm. (৳)",
            cell: ({ row }) => <span className="text-red-500/60 font-medium">-{formatCurrency(row.original.commission_amount)}</span>
        },
        {
            accessorKey: "dealer_amount",
            header: "Net Earned",
            cell: ({ row }) => <span className="text-[#D4AF37] font-black italic">{formatCurrency(row.original.dealer_amount)}</span>
        },
        {
            accessorKey: "status",
            header: "Fulfillment",
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={cn(
                        "uppercase tracking-widest font-black text-[8px] px-2 py-0.5",
                        row.original.status === 'delivered' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            row.original.status === 'cancelled' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                "bg-white/5 text-white/40 border-white/10"
                    )}
                >
                    {row.original.status}
                </Badge>
            )
        }
    ];

    if (loading) {
        return (
            <div className="h-full w-full min-h-[600px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Decrypting Financial Ledgers...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 selection:bg-[#D4AF37] selection:text-[#0D0D0F]">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#D4AF37]/60">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Proprietary Financial Console</span>
                    </div>
                    <h1 className="text-5xl font-display font-black text-white italic tracking-tighter leading-none">
                        REVENUE <MetallicText>TERMINAL</MetallicText>
                    </h1>
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <Button variant="outline" className="flex-1 lg:flex-none h-14 border-white/10 bg-white/[0.02] hover:bg-white/5 text-white/40 hover:text-white transition-all rounded-2xl px-8 uppercase text-[10px] font-black tracking-widest">
                        Download Statement
                    </Button>
                    <GradientButton
                        onClick={() => toast.info("Liquidation engine pending administrative verification")}
                        className="flex-1 lg:flex-none h-14 px-10 text-[10px] font-black uppercase italic tracking-[0.2em] shadow-[0_10px_40px_rgba(212,175,55,0.2)]"
                    >
                        Trigger Withdrawal <ArrowRight className="ml-2 w-4 h-4" />
                    </GradientButton>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <KPICard
                    title="Liquid Balance"
                    value={formatCurrency(stats.availableBalance)}
                    icon={Wallet}
                    trend="neutral"
                    change={0}
                    changeLabel="Ready for Payout"
                    className="border-[#D4AF37]/20 bg-[#D4AF37]/5"
                />
                <KPICard
                    title="Settlement Queue"
                    value={formatCurrency(stats.pendingSettlement)}
                    icon={Clock}
                    trend="up"
                    change={0}
                    changeLabel="Awaiting Fulfillment"
                />
                <KPICard
                    title="Net Lifetime Revenue"
                    value={formatCurrency(stats.netEarnings)}
                    icon={TrendingUp}
                    trend="up"
                    change={0}
                    changeLabel="Aggregate Realized Profit"
                />
                <KPICard
                    title="Total Liquidity Out"
                    value={formatCurrency(stats.paidOut)}
                    icon={ArrowUpRight}
                    trend="neutral"
                    change={0}
                    changeLabel="Fully Disbursed"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Commission Breakdown Visual */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-[#D4AF37]" />
                        <h3 className="text-xl font-display font-black italic text-white uppercase tracking-tighter">Fee <span className="text-[#D4AF37]">Structure</span></h3>
                    </div>
                    <GlassCard className="p-8 border-[#D4AF37]/10 bg-[#0D0D0F]/40 space-y-8">
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Gross Marketplace GMV</span>
                                <span className="text-sm font-bold text-white">{formatCurrency(stats.grossVolume)}</span>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-white/20 w-full" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">Platform Commission</span>
                                <span className="text-sm font-bold text-red-500/80">-{formatCurrency(stats.totalCommission)}</span>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500/40 transition-all duration-1000 ease-out"
                                    style={{ width: `${(stats.totalCommission / stats.grossVolume) * 100 || 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Merchant Net Earnings</span>
                                <span className="text-sm font-black text-[#D4AF37] italic">{formatCurrency(stats.netEarnings)}</span>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F8E4A0] transition-all duration-1000 ease-out"
                                    style={{ width: `${(stats.netEarnings / stats.grossVolume) * 100 || 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Settlement Logic</p>
                                    <p className="text-[9px] text-white/20 font-bold uppercase">Funds settle 24h post-delivery</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Ledger Tabs */}
                <div className="xl:col-span-2 space-y-6">
                    <Tabs defaultValue="earnings" className="w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <TabsList className="bg-white/[0.02] border border-white/5 p-1 h-14 rounded-2xl">
                                <TabsTrigger
                                    value="earnings"
                                    className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0D0D0F]"
                                >
                                    Earnings Ledger
                                </TabsTrigger>
                                <TabsTrigger
                                    value="payouts"
                                    className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0D0D0F]"
                                >
                                    Withdrawal Logs
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="earnings">
                            <GlassCard className="border-[#D4AF37]/5 bg-[#0D0D0F]/40 overflow-hidden">
                                <div className="overflow-x-auto min-h-[400px]">
                                    <DataTable
                                        columns={earningColumns}
                                        data={earnings}
                                        searchKey="id"
                                    />
                                </div>
                            </GlassCard>
                        </TabsContent>

                        <TabsContent value="payouts">
                            <GlassCard className="border-[#D4AF37]/5 bg-[#0D0D0F]/40 overflow-hidden">
                                <div className="overflow-x-auto min-h-[400px]">
                                    <DataTable
                                        columns={payoutColumns}
                                        data={payouts}
                                        searchKey="id"
                                    />
                                </div>
                            </GlassCard>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
