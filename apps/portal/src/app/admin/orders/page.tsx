"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingCart,
    Clock,
    DollarSign,
    Package,
    Truck,
    CheckCircle2,
    Eye,
    Loader2,
    Search,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { GlassCard } from "@/components/ui/premium/GlassCard";

interface GlobalOrder {
    id: string;
    order_number: string;
    grand_total: number;
    payment_status: string;
    created_at: string;
    shipping_name: string;
    sub_orders: {
        id: string;
        dealer_id: string;
        status: string;
        dealers: {
            business_name: string;
        };
    }[];
}

export default function AdminOrdersPage() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<GlobalOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    sub_orders (
                        id,
                        dealer_id,
                        status,
                        dealers (
                            business_name
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders((data as unknown) as GlobalOrder[] || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Order stream synchronization failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const subscription = supabase
            .channel('admin-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const filteredOrders = orders.filter(o =>
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shipping_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: ColumnDef<GlobalOrder>[] = [
        {
            accessorKey: "order_number",
            header: "Protocol Reference",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-[#F8F8F8] font-mono font-black italic tracking-tighter">#{row.original.order_number}</span>
                    <span className="text-[9px] text-[#A1A1AA] uppercase font-bold tracking-[0.2em]">
                        {format(new Date(row.original.created_at), 'MMM dd, HH:mm')}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "shipping_name",
            header: "Consignee",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] text-xs font-black italic">
                        {row.original.shipping_name?.[0]}
                    </div>
                    <span className="text-sm font-bold text-[#F8F8F8] tracking-tight">{row.original.shipping_name}</span>
                </div>
            )
        },
        {
            id: "dealers",
            header: "Fulfillment Entities",
            cell: ({ row }) => {
                const dealers = row.original.sub_orders?.map(s => s.dealers?.business_name).filter(Boolean) || [];
                return (
                    <div className="flex flex-wrap gap-1">
                        {dealers.map((d, i) => (
                            <Badge key={i} variant="outline" className="bg-[#D4AF37]/5 border-[#D4AF37]/20 text-[#D4AF37] text-[8px] uppercase tracking-widest font-black">
                                {d}
                            </Badge>
                        ))}
                    </div>
                );
            }
        },
        {
            accessorKey: "grand_total",
            header: "Valuation",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-[#D4AF37] font-display font-black text-lg italic tracking-tighter">
                        {formatCurrency(row.original.grand_total)}
                    </span>
                    <Badge variant="outline" className={`w-fit mt-1 text-[8px] font-black uppercase tracking-widest ${row.original.payment_status === 'paid' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-amber-500/20 text-amber-500 bg-amber-500/5'
                        }`}>
                        {row.original.payment_status}
                    </Badge>
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Link href={`/admin/orders/${row.original.id}`}>
                        <Button variant="ghost" size="icon" className="h-10 w-10 border border-white/5 bg-white/[0.02] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-xl transition-all">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        ORDER <span className="text-[#D4AF37]">MONITOR</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                        Operational Fulfillment Oversight
                    </p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                    <Input
                        placeholder="Search global registries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-14 bg-white/[0.03] border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-white/70 outline-none focus:border-[#D4AF37]/30 transition-all placeholder:text-white/10"
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 border-white/5 bg-white/[0.02] hover:bg-white/5 text-white/40 hover:text-white transition-all rounded-xl uppercase text-[10px] font-black tracking-widest">
                    <Filter className="w-4 h-4 mr-2" /> Global Filter
                </Button>
            </div>

            {/* Main Table */}
            <div className="relative">
                <div className="relative z-10 bg-[#0D0D0F]/40 backdrop-blur-2xl rounded-[2.5rem] border border-[#D4AF37]/10 p-2 overflow-hidden hover:border-[#D4AF37]/20 transition-all duration-700 shadow-2xl">
                    <DataTable
                        columns={columns}
                        data={filteredOrders}
                        searchKey="order_number"
                    />
                </div>
            </div>
        </div>
    );
}
