"use client";

import { useEffect, useState } from "react";
import {
    Boxes,
    Calendar,
    Package,
    ArrowLeft,
    Search,
    Filter,
    ArrowUpDown,
    CheckCircle2,
    CalendarClock,
    ShieldAlert
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
import { format, differenceInDays, isBefore, parseISO } from "date-fns";

interface BatchItem {
    id: string;
    batch_number: string;
    initial_quantity: number;
    current_quantity: number;
    unit_cost_price: number;
    received_date: string;
    expiry_date: string;
    variant_id: string;
    status: string;
    product_variants: {
        sku: string;
        products: { name: string };
    };
    vendors: {
        name: string;
    };
}

export default function BatchManagementPage() {
    const { profile } = useUser();
    const [batches, setBatches] = useState<BatchItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'empty'>('all');

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchBatches();
        }
    }, [profile]);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("inventory_batches")
                .select(`
                    id,
                    batch_number,
                    initial_quantity,
                    current_quantity,
                    unit_cost_price,
                    received_date,
                    expiry_date,
                    status,
                    product_variants (
                        sku,
                        products (name)
                    ),
                    vendors (name)
                `)
                .eq("dealer_id", profile?.dealer_id)
                .order("received_date", { ascending: false });

            if (error) throw error;
            setBatches(data as any || []);
        } catch (error) {
            console.error("Error fetching batches:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBatches = batches.filter(batch => {
        const matchesSearch =
            batch.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            batch.product_variants.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            batch.product_variants.sku.toLowerCase().includes(searchQuery.toLowerCase());

        const today = new Date();
        const expiry = batch.expiry_date ? parseISO(batch.expiry_date) : null;
        const daysToExpiry = expiry ? differenceInDays(expiry, today) : null;

        if (statusFilter === 'active') return matchesSearch && batch.current_quantity > 0;
        if (statusFilter === 'expiring') return matchesSearch && daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= 30;
        if (statusFilter === 'expired') return matchesSearch && expiry && isBefore(expiry, today);
        if (statusFilter === 'empty') return matchesSearch && batch.current_quantity <= 0;

        return matchesSearch;
    });

    const getExpiryStatus = (expiryDate: string | null, currentQty: number) => {
        if (currentQty <= 0) return { label: "Depleted", color: "bg-white/5 text-white/40", icon: CheckCircle2 };
        if (!expiryDate) return { label: "No Expiry", color: "bg-green-500/10 text-green-500", icon: CheckCircle2 };

        const today = new Date();
        const expiry = parseISO(expiryDate);
        const days = differenceInDays(expiry, today);

        if (days < 0) return { label: "Expired", color: "bg-red-500/10 text-red-500", icon: ShieldAlert };
        if (days <= 30) return { label: `Expiring (${days}d)`, color: "bg-amber-500/10 text-amber-500", icon: CalendarClock };
        return { label: "Healthy", color: "bg-green-500/10 text-green-500", icon: CheckCircle2 };
    };

    if (loading) return (
        <div className="space-y-10 p-8">
            <Skeleton className="h-20 w-1/3 rounded-2xl bg-white/5" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-3xl bg-white/5" />)}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <Link href="/dealer/stock" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#D4AF37] transition-all">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Overview
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-display font-black tracking-tight text-[#F8F8F8]">Batch Archive</h1>
                        <p className="text-sm text-white/40 mt-1 uppercase tracking-widest font-bold">Detailed Stock Lifecycle Tracking</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <Input
                                placeholder="BATCH NO / SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-12 bg-white/5 border-white/5 text-[10px] font-bold tracking-widest uppercase rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {[
                    { id: 'all', label: 'All Batches' },
                    { id: 'active', label: 'In Stock' },
                    { id: 'expiring', label: 'Expiring Soon' },
                    { id: 'expired', label: 'Expired' },
                    { id: 'empty', label: 'Depleted' }
                ].map((f) => (
                    <Button
                        key={f.id}
                        onClick={() => setStatusFilter(f.id as any)}
                        variant={statusFilter === f.id ? 'secondary' : 'outline'}
                        className={`h-9 px-6 rounded-full text-[9px] font-black uppercase tracking-widest border-white/5 ${statusFilter === f.id ? "bg-[#D4AF37] text-[#0D0D0F]" : "bg-white/5 text-white/40 hover:text-white"
                            }`}
                    >
                        {f.label}
                    </Button>
                ))}
            </div>

            {/* Batch Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredBatches.map((batch, idx) => {
                        const status = getExpiryStatus(batch.expiry_date, batch.current_quantity);
                        const Icon = status.icon;

                        return (
                            <motion.div
                                key={batch.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <GlassCard className="p-6 h-full flex flex-col justify-between group relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-[#D4AF37]/5 transition-all" />

                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <Badge className={`border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${status.color}`}>
                                                    <Icon className="w-2.5 h-2.5 mr-1" />
                                                    {status.label}
                                                </Badge>
                                                <h3 className="text-sm font-black text-[#F8F8F8] mt-2 truncate w-48">{batch.product_variants.products.name}</h3>
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{batch.product_variants.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-white/20 uppercase">Units Left</p>
                                                <p className="text-2xl font-display font-black text-[#F8F8F8]">{batch.current_quantity}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Batch Identifier</p>
                                                <p className="text-[10px] font-bold text-[#F8F8F8] uppercase">{batch.batch_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Expiry Milestone</p>
                                                <p className="text-[10px] font-bold text-[#F8F8F8]">{batch.expiry_date ? format(parseISO(batch.expiry_date), 'MMM dd, yyyy') : 'PERPETUAL'}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-white/20 uppercase">Acquisition Cost</span>
                                                <span className="text-[11px] font-black text-[#D4AF37]">৳{batch.unit_cost_price.toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-[8px] font-black text-white/20 uppercase">Partner Source</span>
                                                <span className="text-[10px] font-bold text-white/60 truncate w-24">{batch.vendors?.name || 'STOCK OPENING'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-bold text-white/20 uppercase">
                                        <span>Received: {format(parseISO(batch.received_date), 'MMM dd, yyyy')}</span>
                                        <span>Initial: {batch.initial_quantity}</span>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {filteredBatches.length === 0 && (
                <div className="py-40 text-center">
                    <Boxes className="w-16 h-16 text-white/5 mx-auto mb-6" />
                    <h3 className="text-xl font-display font-black text-white/20 uppercase tracking-widest">No Batches Found</h3>
                    <p className="text-sm text-white/10 font-bold uppercase mt-2">Adjust your filters to see historical inventory.</p>
                </div>
            )}
        </div>
    );
}
