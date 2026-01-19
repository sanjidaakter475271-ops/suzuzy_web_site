"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2,
    CalendarDays,
    Truck,
    Search,
    Filter,
    Eye,
    FileText,
    Clock,
    Package
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { format, subDays, isAfter } from "date-fns";

interface SubOrder {
    id: string;
    created_at: string;
    status: string;
    dealer_amount: number;
    subtotal: number;
    orders: {
        order_number: string;
        shipping_name: string;
    };
    order_items: {
        id: string;
    }[];
}

const TABS = ["All", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<SubOrder[]>([]);
    const [activeTab, setActiveTab] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [timeframe, setTimeframe] = useState("all");

    const fetchOrders = async () => {
        if (!profile?.dealer_id) return;

        try {
            const { data, error } = await supabase
                .from('sub_orders')
                .select(`
                    *,
                    orders:order_id (
                        order_number,
                        shipping_name
                    ),
                    order_items (
                        id
                    )
                `)
                .eq('dealer_id', profile.dealer_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders((data as unknown as SubOrder[]) || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            if (profile?.dealer_id) toast.error("Command failed to synchronize with server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const channel = supabase.channel(`dealer-orders-${profile?.dealer_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'sub_orders',
                filter: `dealer_id=eq.${profile?.dealer_id}`
            }, () => fetchOrders())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.dealer_id]);

    const filteredOrders = orders.filter(o => {
        const matchesSearch =
            o.orders?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.orders?.shipping_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTab = activeTab === "All" || o.status === activeTab;

        let matchesTimeframe = true;
        if (timeframe !== "all") {
            const orderDate = new Date(o.created_at);
            const now = new Date();
            if (timeframe === "today") {
                matchesTimeframe = orderDate.toDateString() === now.toDateString();
            } else if (timeframe === "7d") {
                matchesTimeframe = isAfter(orderDate, subDays(now, 7));
            } else if (timeframe === "30d") {
                matchesTimeframe = isAfter(orderDate, subDays(now, 30));
            }
        }

        return matchesSearch && matchesTab && matchesTimeframe;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'processing': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 selection:bg-[#D4AF37] selection:text-[#0D0D0F]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#D4AF37]/60">
                        <Truck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Fulfillment Command Center</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-white italic tracking-tighter">
                        ORDER <MetallicText>FULFILLMENT</MetallicText>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 border-white/10 bg-white/[0.02] hover:bg-white/5 text-white/40 hover:text-white transition-all rounded-xl uppercase text-[10px] font-black tracking-widest">
                        <FileText className="w-4 h-4 mr-2" /> Dispatch Log
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                        <Input
                            placeholder="Find orders by number or customer name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 bg-white/[0.03] border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-white/70 outline-none focus:border-[#D4AF37]/30 transition-all placeholder:text-white/10"
                        />
                    </div>
                    <div className="flex gap-4">
                        <Select value={timeframe} onValueChange={setTimeframe}>
                            <SelectTrigger className="h-14 px-6 min-w-[160px] border-white/5 bg-white/[0.02] hover:bg-white/5 text-white/40 hover:text-white transition-all rounded-xl uppercase text-[10px] font-black tracking-widest outline-none focus:ring-0">
                                <CalendarDays className="w-4 h-4 mr-2 text-[#D4AF37]" />
                                <SelectValue placeholder="Timeframe" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0D0D0F] border-[#D4AF37]/20 text-white/70">
                                <SelectItem value="all" className="focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">All Time</SelectItem>
                                <SelectItem value="today" className="focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">Today</SelectItem>
                                <SelectItem value="7d" className="focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">Last 7 Days</SelectItem>
                                <SelectItem value="30d" className="focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">Last 30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-14 px-6 border-white/5 bg-white/[0.02] hover:bg-white/5 text-white/40 hover:text-white transition-all rounded-xl uppercase text-[10px] font-black tracking-widest">
                            <Filter className="w-4 h-4 mr-2" /> Refine
                        </Button>
                    </div>
                </div>

                {/* Performance Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all whitespace-nowrap border ${activeTab === tab
                                ? "bg-[#D4AF37] border-[#D4AF37] text-[#0D0D0F] shadow-[0_10px_20px_rgba(212,175,55,0.15)]"
                                : "bg-white/[0.02] border-white/5 text-white/40 hover:border-white/10"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editorial Table */}
            <GlassCard className="border-[#D4AF37]/5 bg-[#0D0D0F]/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="p-6 text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Reference</th>
                                <th className="p-6 text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Customer Details</th>
                                <th className="p-6 text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Logistics</th>
                                <th className="p-6 text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Valuation</th>
                                <th className="p-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-4" />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-white/20 italic">Synchronizing Fulfillment Feed...</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <Package className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-white/20 italic">No fulfilling protocols detected in this scope</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, idx) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-white/[0.01] transition-colors"
                                    >
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white font-black font-mono text-sm tracking-tighter uppercase group-hover:text-[#D4AF37] transition-colors">
                                                    #{order.orders?.order_number || 'INV-PENDING'}
                                                </span>
                                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest italic">
                                                    {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-[#D4AF37] font-black text-xs italic">
                                                    {order.orders?.shipping_name?.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-sm tracking-tight">{order.orders?.shipping_name}</span>
                                                    <span className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Registered Client</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-3 h-3 text-[#D4AF37]" />
                                                    <span className="text-[10px] text-white font-bold tracking-widest italic">
                                                        {order.order_items?.length || 0} ASSETS COMMITTED
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] italic w-fit ${getStatusColor(order.status)}`}
                                                >
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-[#D4AF37] font-display font-black text-lg italic tracking-tighter">
                                                    {formatCurrency(order.dealer_amount)}
                                                </span>
                                                <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest italic tracking-[0.2em]">Settlement Value</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <Link href={`/dealer/orders/${order.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 border border-white/5 bg-white/[0.02] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-xl transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
