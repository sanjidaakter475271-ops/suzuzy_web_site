"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Search,
    Filter,
    MoreVertical,
    ReceiptText,
    Calendar,
    User,
    ArrowUpRight,
    Download,
    TrendingUp,
    CreditCard,
    CircleDollarSign,
    Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Sale {
    id: string;
    sale_number: string;
    created_at: string;
    grand_total: number;
    status: string;
    payment_method: string;
    payment_status: string;
    profiles: {
        full_name: string;
    } | null;
}

export default function SalesRegistryPage() {
    const { profile } = useUser();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchSales();
        }
    }, [profile]);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("sales")
                .select(`
                    *,
                    profiles:customer_id (full_name)
                `)
                .eq("dealer_id", profile?.dealer_id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSales(data || []);
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
        }
    };

    const filteredSales = sales.filter(s =>
        s.sale_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.profiles?.full_name || "Counter Customer").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalRevenue = sales.reduce((acc, s) => acc + (s.grand_total || 0), 0);
    const todaySales = sales.filter(s => format(new Date(s.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length;

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/60">Transaction Hub</span>
                    </div>
                    <h1 className="text-5xl font-display font-black tracking-tighter text-[#F8F8F8] italic">
                        SALES <span className="text-[#D4AF37]">REGISTRY</span>
                    </h1>
                    <p className="text-[#A1A1AA] text-sm max-w-md font-medium leading-relaxed">
                        Complete archive of all POS and terminal-driven transactions with real-time financial reconciliation.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dealer/pos">
                        <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(212,175,55,0.2)]">
                            <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                            Open POS Terminal
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Gross Revenue", value: `৳${totalRevenue.toLocaleString()}`, sub: "Lifetime Volume" },
                    { label: "Today's Volume", value: todaySales, sub: "Transactions" },
                    { label: "Avg. Basket", value: `৳${(totalRevenue / (sales.length || 1)).toFixed(0)}`, sub: "Value per sale" },
                    { label: "Success Rate", value: "98.4%", sub: "Fulfilled vs Return" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm group hover:border-[#D4AF37]/30 transition-all"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-[#D4AF37]/50 transition-colors">
                            {stat.label}
                        </p>
                        <div className="flex items-end justify-between mt-2">
                            <h2 className="text-2xl font-display font-black text-[#F8F8F8] tracking-tight">{stat.value}</h2>
                            <p className="text-[9px] text-white/10 font-bold uppercase tracking-tighter mb-1">{stat.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-white/5">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                    <Input
                        placeholder="Search Invoice # or Customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-14 px-6 border-white/5 bg-white/[0.02] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#F8F8F8] transition-all">
                        <Calendar className="w-4 h-4 mr-2 opacity-50" />
                        Date Matrix
                    </Button>
                    <Button variant="outline" className="h-14 px-6 border-white/5 bg-white/[0.02] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#F8F8F8] transition-all">
                        <TrendingUp className="w-4 h-4 mr-2 opacity-50" />
                        Export Data
                    </Button>
                </div>
            </div>

            {/* Sales List */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full bg-white/[0.02] rounded-2xl" />)}
                    </div>
                ) : filteredSales.length > 0 ? (
                    <div className="space-y-4">
                        {filteredSales.map((sale, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={sale.id}
                                className="group flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 w-1 h-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center gap-10">
                                    <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-[#D4AF37] group-hover:bg-[#D4AF37]/5 transition-all">
                                        <ReceiptText className="w-7 h-7 stroke-[1.2]" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black text-[#F8F8F8] tracking-widest uppercase italic">{sale.sale_number}</span>
                                            <Badge variant="outline" className={`text-[8px] font-black tracking-widest uppercase py-0.5 ${getStatusColor(sale.status)}`}>
                                                {sale.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-6 text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 opacity-50" />
                                                {sale.profiles?.full_name || "Counter Customer"}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                {format(new Date(sale.created_at), 'MMM dd, yyyy • HH:mm')}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-3.5 h-3.5 opacity-50" />
                                                {sale.payment_method}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-right space-y-1">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Grand Total</p>
                                        <h4 className="text-2xl font-display font-black text-[#F8F8F8] tracking-tight">৳{sale.grand_total?.toLocaleString()}</h4>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link href={`/dealer/sales/${sale.id}`}>
                                            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl hover:bg-[#D4AF37]/10 text-white/20 hover:text-[#D4AF37] transition-all">
                                                <ArrowUpRight className="w-6 h-6" />
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl hover:bg-white/5 text-white/20">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#1A1A1C] border-white/10 text-white">
                                                <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] cursor-pointer gap-3">
                                                    <Download className="w-3.5 h-3.5" />
                                                    Download Invoice
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 cursor-pointer gap-3">
                                                    <CircleDollarSign className="w-3.5 h-3.5" />
                                                    Refund Transaction
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                        <ReceiptText className="w-20 h-20 text-white/5 mb-6" strokeWidth={1} />
                        <h3 className="text-2xl font-display font-black text-[#F8F8F8] tracking-tight mb-2 uppercase italic">No Transactions Found</h3>
                        <p className="text-[#A1A1AA] text-sm font-medium mb-10 max-w-xs text-center leading-relaxed">
                            Your sales registry is currently empty. Initiate sales through the POS terminal to begin tracking revenue.
                        </p>
                        <Link href="/dealer/pos">
                            <Button className="bg-white/5 hover:bg-[#D4AF37] text-white hover:text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] h-12 px-10 rounded-xl transition-all">
                                Launch Terminal
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
