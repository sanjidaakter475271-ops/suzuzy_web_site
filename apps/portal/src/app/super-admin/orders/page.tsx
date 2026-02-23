"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal,
    ShoppingCart,
    Clock,
    DollarSign,
    Package,
    Truck,
    CheckCircle2,
    Eye,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

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
        dealers: {
            business_name: string;
        };
        status: string;
    }[];
}

export default function SuperAdminOrdersPage() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<GlobalOrder[]>([]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/super-admin/orders');
            if (!res.ok) throw new Error("Order registry retrieval failure");
            const data = await res.json();
            setOrders(data || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Global order sync failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const subscription = supabase
            .channel('global-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

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
            header: "Involved Consortia",
            cell: ({ row }) => {
                const dealers = row.original.sub_orders?.map(s => s.dealers?.business_name).filter(Boolean) || [];
                return (
                    <div className="flex flex-wrap gap-1">
                        {dealers.map((d, i) => (
                            <Badge key={i} variant="outline" className="bg-[#D4AF37]/5 border-[#D4AF37]/20 text-[#D4AF37] text-[8px] uppercase tracking-widest font-black">
                                {d}
                            </Badge>
                        ))}
                        {dealers.length === 0 && <span className="text-[9px] text-white/20 italic font-bold">No Dealers Assigned</span>}
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
                    <Link href={`/super-admin/orders/${row.original.id}`}>
                        <Button variant="ghost" size="icon" className="h-10 w-10 border border-white/5 bg-white/[0.02] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-xl transition-all">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )
        }
    ];

    if (loading && orders.length === 0) {
        return (
            <div className="h-full w-full min-h-[400px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Aggregating Global Logistics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        GLOBAL <span className="text-[#D4AF37]">FULFILLMENT</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                        Universal Logistic Oversight & Revenue Flow
                    </p>
                </div>
            </div>

            <div className="relative">
                <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-[#D4AF37]/5 blur-[150px] rounded-full" />

                <div className="relative z-10 bg-[#0D0D0F]/40 backdrop-blur-2xl rounded-[3rem] border border-[#D4AF37]/10 p-2 overflow-hidden hover:border-[#D4AF37]/20 transition-all duration-700 shadow-2xl">
                    <DataTable
                        columns={columns}
                        data={orders}
                        searchKey="order_number"
                    />
                </div>
            </div>
        </div>
    );
}
