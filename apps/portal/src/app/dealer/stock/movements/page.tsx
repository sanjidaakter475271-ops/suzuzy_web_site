"use client";

import { useEffect, useState } from "react";
import {
    History,
    ArrowLeft,
    Search,
    TrendingDown,
    TrendingUp,
    RefreshCcw,
    ShoppingCart,
    Truck,
    ArrowRightLeft,
    ChevronRight,
    SearchX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface MovementRecord {
    id: string;
    product_id: string;
    variant_id: string;
    movement_type: 'in' | 'out';
    quantity_change: number;
    quantity_after: number;
    reference_type: string;
    reference_number: string;
    reason: string;
    movement_date: string;
    unit_cost: number;
    total_value: number;
    product_variants: {
        sku: string;
        products: { name: string };
    };
    profiles: {
        full_name: string;
    };
}

export default function StockMovementsPage() {
    const { profile } = useUser();
    const [movements, setMovements] = useState<MovementRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchMovements();
        }
    }, [profile]);

    const fetchMovements = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("inventory_movements")
                .select(`
                    id,
                    product_id,
                    variant_id,
                    movement_type,
                    quantity_change,
                    quantity_after,
                    reference_type,
                    reference_number,
                    reason,
                    movement_date,
                    unit_cost,
                    total_value,
                    product_variants (
                        sku,
                        products (name)
                    ),
                    profiles (
                        full_name
                    )
                `)
                .eq("dealer_id", profile?.dealer_id)
                .order("movement_date", { ascending: false })
                .order("created_at", { ascending: false });

            if (error) throw error;
            setMovements(data as any || []);
        } catch (error) {
            console.error("Error fetching movements:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMovements = movements.filter(move => {
        const matchesSearch =
            move.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            move.product_variants.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            move.product_variants.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            move.reason?.toLowerCase().includes(searchQuery.toLowerCase());

        if (typeFilter === 'in') return matchesSearch && move.movement_type === 'in';
        if (typeFilter === 'out') return matchesSearch && move.movement_type === 'out';
        return matchesSearch;
    });

    const getReferenceIcon = (type: string) => {
        switch (type) {
            case 'purchase_order': return <Truck className="w-3.5 h-3.5" />;
            case 'sale': return <ShoppingCart className="w-3.5 h-3.5" />;
            case 'adjustment': return <RefreshCcw className="w-3.5 h-3.5" />;
            default: return <ArrowRightLeft className="w-3.5 h-3.5" />;
        }
    };

    if (loading) return (
        <div className="space-y-10 p-8">
            <Skeleton className="h-10 w-1/4 rounded-xl bg-white/5" />
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-3xl bg-white/5" />)}
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <Link href="/dealer/stock" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#D4AF37] transition-all">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Overview
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-display font-black tracking-tight text-[#F8F8F8]">Inventory Ledger</h1>
                        <p className="text-sm text-white/40 mt-1 uppercase tracking-widest font-bold">Comprehensive Stock Audit History</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <Input
                                placeholder="SEARCH REFERENCE / PRODUCT..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-12 bg-white/5 border-white/5 text-[10px] font-bold tracking-widest uppercase rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <Button
                    onClick={() => setTypeFilter('all')}
                    className={`h-9 px-6 rounded-full text-[9px] font-black uppercase tracking-widest ${typeFilter === 'all' ? "bg-[#D4AF37] text-[#0D0D0F]" : "bg-white/5 text-white/40 hover:text-white"}`}
                >
                    Full History
                </Button>
                <Button
                    onClick={() => setTypeFilter('in')}
                    className={`h-9 px-6 rounded-full text-[9px] font-black uppercase tracking-widest ${typeFilter === 'in' ? "bg-green-500 text-white" : "bg-white/5 text-white/40 hover:text-white"}`}
                >
                    Inflow (+)
                </Button>
                <Button
                    onClick={() => setTypeFilter('out')}
                    className={`h-9 px-6 rounded-full text-[9px] font-black uppercase tracking-widest ${typeFilter === 'out' ? "bg-red-500 text-white" : "bg-white/5 text-white/40 hover:text-white"}`}
                >
                    Outflow (-)
                </Button>
            </div>

            {/* Timeline */}
            <div className="space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-[31px] top-4 bottom-4 w-px bg-white/5 hidden md:block" />

                <AnimatePresence mode="popLayout">
                    {filteredMovements.length > 0 ? filteredMovements.map((move, idx) => (
                        <motion.div
                            key={move.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="relative"
                        >
                            <GlassCard className="p-0 overflow-hidden group hover:border-[#D4AF37]/30 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center">
                                    {/* Icon Column */}
                                    <div className="p-6 md:w-16 flex items-center justify-center relative z-10 shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${move.movement_type === 'in' ? "border-green-500/20 bg-green-500/10 text-green-500" : "border-red-500/20 bg-red-500/10 text-red-500"
                                            }`}>
                                            {move.movement_type === 'in' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t md:border-t-0 md:border-l border-white/5">
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-[#F8F8F8] truncate">{move.product_variants.products.name}</h3>
                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37]/60 border-[#D4AF37]/10 bg-[#D4AF37]/5">
                                                    {move.product_variants.sku}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                                                <span className="flex items-center gap-1.5 flex-wrap">
                                                    {getReferenceIcon(move.reference_type)}
                                                    {move.reference_type.replace('_', ' ')}: {move.reference_number || 'N/A'}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                <span className="truncate">{move.reason}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-10">
                                            <div className="text-center w-24">
                                                <p className="text-[8px] font-black text-white/20 uppercase mb-1">Quantity</p>
                                                <p className={`text-lg font-display font-black ${move.movement_type === 'in' ? "text-green-500" : "text-red-500"}`}>
                                                    {move.movement_type === 'in' ? '+' : '-'}{move.quantity_change}
                                                </p>
                                                <p className="text-[10px] font-black text-white/40 mt-0.5">Stock After: {move.quantity_after}</p>
                                            </div>

                                            <div className="text-right w-32 shrink-0">
                                                <p className="text-[10px] font-black text-[#F8F8F8]">{format(parseISO(move.movement_date), 'MMM dd, yyyy')}</p>
                                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter mt-1 truncate">By: {move.profiles.full_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )) : (
                        <div className="py-40 text-center">
                            <SearchX className="w-16 h-16 text-white/5 mx-auto mb-6" />
                            <h3 className="text-xl font-display font-black text-white/20 uppercase tracking-widest">No Movements Logged</h3>
                            <p className="text-sm text-white/10 font-bold uppercase mt-2">Historical stock data will appear here.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
