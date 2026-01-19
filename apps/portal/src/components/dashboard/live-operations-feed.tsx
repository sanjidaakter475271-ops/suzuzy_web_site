"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

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

interface LiveOperationsFeedProps {
    orders: OrderItem[];
}

const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function LiveOperationsFeed({ orders }: LiveOperationsFeedProps) {
    return (
        <div className="bg-[#0D0D0F]/40 backdrop-blur-xl border border-[#D4AF37]/10 rounded-3xl p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-display font-black italic text-[#F8F8F8]">Live <span className="text-[#D4AF37]">Operations</span></h3>
                    <p className="text-[10px] uppercase tracking-widest text-[#A1A1AA] font-bold mt-1">Real-time Order Stream</p>
                </div>
                <Link
                    href="/dealer/orders"
                    className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all group"
                >
                    <ArrowRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#D4AF37]" />
                </Link>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                <ShoppingBag className="w-6 h-6 text-white/20" />
                            </div>
                            <p className="text-sm text-[#A1A1AA]">No recent operations</p>
                        </div>
                    ) : (
                        orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="group relative bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-[#D4AF37]/20 transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black tracking-tighter text-[#D4AF37] opacity-60">#{order.orders?.order_number || order.id.slice(0, 8)}</span>
                                            <Badge className={statusColors[order.status] || "bg-white/5 text-white/40 border-white/5"}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-[#F8F8F8]">
                                            <User className="w-3 h-3 text-[#A1A1AA]" />
                                            {order.orders?.shipping_name || "Unknown Customer"}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA]">
                                            <Clock className="w-3 h-3" />
                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-display font-black text-[#D4AF37]">
                                            {formatCurrency(order.dealer_amount)}
                                        </div>
                                        <div className="text-[8px] uppercase tracking-widest text-[#A1A1AA] font-bold">
                                            Earnings
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
