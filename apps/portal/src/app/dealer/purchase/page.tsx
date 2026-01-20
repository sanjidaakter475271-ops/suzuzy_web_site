"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, ShoppingBag, Calendar, User, ArrowUpRight, Clock } from "lucide-react";
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

interface PurchaseOrder {
    id: string;
    po_number: string;
    order_date: string;
    grand_total: number;
    status: 'draft' | 'pending' | 'confirmed' | 'partial' | 'received' | 'cancelled';
    payment_status: 'unpaid' | 'partial' | 'paid';
    vendors: {
        name: string;
    };
}

export default function PurchaseOrdersPage() {
    const { profile } = useUser();
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchOrders();
        }
    }, [profile]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("purchase_orders")
                .select(`
                    *,
                    vendors (name)
                `)
                .eq("dealer_id", profile?.dealer_id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error("Error fetching purchase orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'received': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'pending': return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-white/10 text-white/40 border-white/5';
        }
    };

    const filteredOrders = orders.filter(o =>
        o.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.vendors?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/60">Procurement</span>
                    </div>
                    <h1 className="text-5xl font-display font-black tracking-tighter text-[#F8F8F8] italic">
                        PURCHASE <span className="text-[#D4AF37]">ORDERS</span>
                    </h1>
                    <p className="text-[#A1A1AA] text-sm max-w-md font-medium leading-relaxed">
                        Track your procurement lifecycle, manage incoming shipments, and handle local inventory replenishment.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dealer/purchase/new">
                        <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(212,175,55,0.2)]">
                            <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                            Create New PO
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Active Orders", value: orders.filter(o => !['received', 'cancelled'].includes(o.status)).length, sub: "In Pipeline" },
                    { label: "Pending Receiving", value: orders.filter(o => o.status === 'confirmed').length, sub: "Outgoing / Transit" },
                    { label: "Month Spend", value: `৳${orders.reduce((acc, o) => acc + (o.grand_total || 0), 0).toLocaleString()}`, sub: "30-Day Volume" },
                    { label: "Processing", value: orders.filter(o => o.status === 'pending').length, sub: "Draft / Unconfirmed" },
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

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-white/5">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                    <Input
                        placeholder="Search PO number or vendor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-14 px-6 border-white/5 bg-white/[0.02] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#F8F8F8] transition-all">
                        <Filter className="w-4 h-4 mr-2 opacity-50" />
                        Date Filter
                    </Button>
                </div>
            </div>

            {/* PO List Table (Luxury Style) */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full bg-white/[0.02] rounded-2xl" />)}
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOrders.map((order, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={order.id}
                                className="group relative flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                            >
                                <div className="flex items-center gap-8">
                                    <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                                        <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-[#F8F8F8] tracking-widest">{order.po_number || 'PENDING-NO'}</span>
                                            <Badge variant="outline" className={`text-[8px] font-black tracking-widest uppercase py-0.5 ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                                            <div className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors">
                                                <User className="w-3 h-3" />
                                                {order.vendors?.name}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" />
                                                {order.order_date ? format(new Date(order.order_date), 'MMM dd, yyyy') : 'No Date'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-right space-y-1">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Total Amount</p>
                                        <h4 className="text-xl font-display font-black text-[#F8F8F8]">৳{order.grand_total?.toLocaleString()}</h4>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Link href={`/dealer/purchase/${order.id}`}>
                                            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/5 text-white/20 hover:text-[#D4AF37] transition-all">
                                                <ArrowUpRight className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/5 text-white/20">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#1A1A1C] border-white/10 text-white">
                                                <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] cursor-pointer">View PDF</DropdownMenuItem>
                                                <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] cursor-pointer">Receive Goods</DropdownMenuItem>
                                                {order.status === 'draft' && (
                                                    <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 hover:text-red-500 cursor-pointer">Cancel PO</DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                        <Clock className="w-16 h-16 text-white/5 mb-6" />
                        <h3 className="text-xl font-display font-black text-[#F8F8F8] tracking-tight mb-2 uppercase">No Procurement History</h3>
                        <p className="text-[#A1A1AA] text-sm font-medium mb-8">Initiate your first purchase order to stock up your warehouse.</p>
                        <Link href="/dealer/purchase/new">
                            <Button className="bg-white/5 hover:bg-[#D4AF37] text-white hover:text-[#0D0D0F] font-black uppercase tracking-widest text-[9px] h-10 px-8 rounded-xl transition-all">
                                Initiate Procurement
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
