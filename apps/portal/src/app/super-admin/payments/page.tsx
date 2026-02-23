"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Download,
    Loader2,
    Building2,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Payment {
    id: string;
    order_id: string;
    amount: number;
    method: string;
    status: string;
    created_at: string;
    orders: {
        id: string;
        profiles: {
            full_name: string;
            email: string;
        };
    };
}

interface Payout {
    id: string;
    dealer_id: string;
    amount: number;
    status: string;
    payout_method: string;
    created_at: string;
    dealers: {
        business_name: string;
        owner: {
            full_name: string;
        };
    };
}

export default function AdminPayments() {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingPayouts: 0,
        completedPayments: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/super-admin/payments');
            if (!res.ok) throw new Error("Financial registry retrieval failure");
            const data = await res.json();

            const paymentsData = data.payments || [];
            const payoutsData = data.payouts || [];

            setPayments(paymentsData);
            setPayouts(payoutsData);

            // Calculate basic stats
            const totalRev = paymentsData
                .filter((p: any) => p.status === 'completed')
                .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

            const pendingPay = payoutsData
                .filter((p: any) => p.status === 'pending')
                .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

            setStats({
                totalRevenue: totalRev,
                pendingPayouts: pendingPay,
                completedPayments: paymentsData.filter((p: any) => p.status === 'completed').length
            });

        } catch (error) {
            console.error("Error fetching financial data:", error);
            toast.error("Failed to load financial operations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const paymentColumns: ColumnDef<Payment>[] = [
        {
            accessorKey: "id",
            header: "PID",
            cell: ({ row }) => (
                <div className="text-[10px] font-mono text-[#D4AF37] font-bold">
                    #{row.original.id.slice(0, 8)}
                </div>
            )
        },
        {
            accessorKey: "created_at",
            header: "Timestamp",
            cell: ({ row }) => (
                <div className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-tighter">
                    {new Date(row.original.created_at).toLocaleString()}
                </div>
            )
        },
        {
            id: "customer",
            header: "Client",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-[#F8F8F8]">
                            {Array.isArray(row.original.orders)
                                ? row.original.orders[0]?.profiles?.full_name
                                : row.original.orders?.profiles?.full_name || 'N/A'}
                        </p>
                        <p className="text-[9px] text-[#A1A1AA]">
                            {Array.isArray(row.original.orders)
                                ? row.original.orders[0]?.profiles?.email
                                : row.original.orders?.profiles?.email || ''}
                        </p>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <div className="font-display font-black text-[#F8F8F8] tracking-tight italic">
                    ৳{Number(row.original.amount).toLocaleString()}
                </div>
            )
        },
        {
            accessorKey: "method",
            header: "Method",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] uppercase tracking-widest font-black">
                    {row.original.method}
                </Badge>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.status === 'completed' ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> SUCCESS
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> PENDING
                        </div>
                    )}
                </div>
            )
        }
    ];

    const payoutColumns: ColumnDef<Payout>[] = [
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
            accessorKey: "created_at",
            header: "Requested",
            cell: ({ row }) => (
                <div className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-tighter">
                    {new Date(row.original.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            id: "dealer",
            header: "Entity",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-[#F8F8F8]">
                            {Array.isArray(row.original.dealers)
                                ? row.original.dealers[0]?.business_name
                                : row.original.dealers?.business_name}
                        </p>
                        <p className="text-[9px] text-[#A1A1AA] uppercase italic tracking-wider">
                            {Array.isArray(row.original.dealers)
                                ? row.original.dealers[0]?.owner?.full_name
                                : row.original.dealers?.owner?.full_name}
                        </p>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "amount",
            header: "Payout",
            cell: ({ row }) => (
                <div className="font-display font-black text-[#D4AF37] tracking-tight italic">
                    ৳{Number(row.original.amount).toLocaleString()}
                </div>
            )
        },
        {
            accessorKey: "payout_method",
            header: "Channel",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] uppercase tracking-widest font-black">
                    {row.original.payout_method}
                </Badge>
            )
        },
        {
            accessorKey: "status",
            header: "Disposition",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.status === 'processed' ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> DISBURSED
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> PROCESSING
                        </div>
                    )}
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="h-full w-full min-h-[600px] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-5xl font-display font-black italic tracking-tighter text-[#F8F8F8]">
                        FINANCIAL <span className="text-[#D4AF37]">OPS</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.4em] font-black opacity-60">
                        Transaction Ledger & Capital Distribution
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white/5 border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-bold uppercase tracking-widest text-[9px] h-12 px-6 rounded-2xl">
                        <Download className="mr-2 w-3.5 h-3.5" /> Export DB
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Gross Revenue"
                    value={`৳${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="+12.5%"
                />
                <StatCard
                    label="Pending Payouts"
                    value={`৳${stats.pendingPayouts.toLocaleString()}`}
                    icon={ArrowUpRight}
                    color="text-blue-500"
                />
                <StatCard
                    label="Successful Trans"
                    value={stats.completedPayments.toString()}
                    icon={CheckCircle2}
                    color="text-green-500"
                />
            </div>

            {/* Main Content */}
            <Tabs defaultValue="inflow" className="w-full">
                <TabsList className="bg-white/5 border border-white/10 p-1 h-14 rounded-2xl mb-8">
                    <TabsTrigger value="inflow" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0D0D0F]">
                        <ArrowDownLeft className="mr-2 w-3.5 h-3.5" /> Capital Inflow
                    </TabsTrigger>
                    <TabsTrigger value="outflow" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0D0D0F]">
                        <ArrowUpRight className="mr-2 w-3.5 h-3.5" /> Dealer Payouts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inflow" className="mt-0">
                    <div className="bg-[#0D0D0F]/60 backdrop-blur-2xl rounded-[2.5rem] border border-[#D4AF37]/10 overflow-hidden shadow-2xl">
                        <DataTable
                            columns={paymentColumns}
                            data={payments}
                            searchKey="id"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="outflow" className="mt-0">
                    <div className="bg-[#0D0D0F]/60 backdrop-blur-2xl rounded-[2.5rem] border border-[#D4AF37]/10 overflow-hidden shadow-2xl">
                        <DataTable
                            columns={payoutColumns}
                            data={payouts}
                            searchKey="id"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color = "text-[#D4AF37]", trend }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#141417] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Icon className="w-24 h-24" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#A1A1AA] mb-4">{label}</p>
            <div className="flex items-end justify-between">
                <h3 className={`text-3xl font-display font-black italic tracking-tighter ${color}`}>
                    {value}
                </h3>
                {trend && (
                    <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
            </div>
        </motion.div>
    );
}
