"use client";

import { useEffect, useState } from "react";
import {
    Package,
    AlertTriangle,
    History,
    ArrowUpRight,
    Search,
    Filter,
    Boxes,
    Calendar,
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
import { format, addDays, isAfter, isBefore } from "date-fns";

interface StockItem {
    id: string;
    product_id: string;
    sku: string;
    stock_quantity: number;
    low_stock_threshold: number;
    price: number;
    products: {
        name: string;
        image_url: string;
        categories: { name: string };
        brands: { name: string };
    };
}

interface BatchAlert {
    id: string;
    batch_number: string;
    expiry_date: string;
    current_quantity: number;
    variant_id: string;
    product_variants: {
        sku: string;
        products: { name: string };
    };
}

export default function StockOverviewPage() {
    const { profile } = useUser();
    const [stock, setStock] = useState<StockItem[]>([]);
    const [expiringBatches, setExpiringBatches] = useState<BatchAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchStockData();
        }
    }, [profile]);

    const fetchStockData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Variants with current stock
            const { data: stockData, error: stockErr } = await supabase
                .from("product_variants")
                .select(`
                    id,
                    product_id,
                    sku,
                    stock_quantity,
                    low_stock_threshold,
                    price,
                    products (
                        name,
                        image_url,
                        categories (name),
                        brands (name)
                    )
                `)
                .eq("products.dealer_id", profile?.dealer_id);

            if (stockErr) throw stockErr;
            setStock(stockData as any || []);

            // 2. Fetch Expiring Batches (within next 30 days)
            const thirtyDaysFromNow = format(addDays(new Date(), 30), 'yyyy-MM-dd');
            const { data: batchData, error: batchErr } = await supabase
                .from("inventory_batches")
                .select(`
                    id,
                    batch_number,
                    expiry_date,
                    current_quantity,
                    variant_id,
                    product_variants (
                        sku,
                        products (name)
                    )
                `)
                .eq("dealer_id", profile?.dealer_id)
                .gt("current_quantity", 0)
                .lte("expiry_date", thirtyDaysFromNow)
                .order("expiry_date", { ascending: true })
                .limit(5);

            if (batchErr) throw batchErr;
            setExpiringBatches(batchData as any || []);

        } catch (error) {
            console.error("Error fetching stock data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStock = stock.filter(item => {
        const matchesSearch =
            item.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'low') return matchesSearch && item.stock_quantity > 0 && item.stock_quantity <= (item.low_stock_threshold || 5);
        if (filter === 'out') return matchesSearch && item.stock_quantity <= 0;
        return matchesSearch;
    });

    const lowStockCount = stock.filter(i => i.stock_quantity > 0 && i.stock_quantity <= (i.low_stock_threshold || 5)).length;
    const outOfStockCount = stock.filter(i => i.stock_quantity <= 0).length;

    if (loading) return (
        <div className="space-y-10 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
            </div>
            <Skeleton className="h-[600px] rounded-3xl bg-white/5" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[#D4AF37]">
                        <Boxes className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Inventory Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-display font-black tracking-tight text-[#F8F8F8]">Stock Management</h1>
                    <p className="text-sm text-white/40 max-w-lg">
                        Monitor real-time inventory levels, manage specific batches, and optimize your procurement cycle.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" className="border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest rounded-xl px-6 h-12 hover:bg-white/10">
                        <Link href="/dealer/stock/movements">
                            <History className="w-4 h-4 mr-2" />
                            Movement Log
                        </Link>
                    </Button>
                    <Button asChild className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] rounded-xl px-8 h-12 shadow-[0_8px_20px_rgba(212,175,55,0.2)]">
                        <Link href="/dealer/stock/adjustments">
                            <ArrowUpRight className="w-4 h-4 mr-2 stroke-[3]" />
                            Manual Adjustment
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <GlassCard className="p-8 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl group-hover:bg-[#D4AF37]/10 transition-all duration-700" />
                    <div className="space-y-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Total SKUs Tracked</p>
                            <h2 className="text-4xl font-display font-black text-[#F8F8F8] mt-1">{stock.length}</h2>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-white/5 mt-8 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-white/20 uppercase">Stock Valuation</span>
                            <span className="text-sm font-black text-[#F8F8F8]">৳{stock.reduce((acc, i) => acc + (i.stock_quantity * i.price), 0).toLocaleString()}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                </GlassCard>

                <GlassCard
                    onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
                    className={`p-8 cursor-pointer transition-all border-l-4 ${lowStockCount > 0 ? "border-amber-500 bg-amber-500/5" : "border-transparent bg-white/[0.02]"}`}
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${lowStockCount > 0 ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-white/20"}`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Critical Threshold</p>
                                <h2 className={`text-4xl font-display font-black mt-1 ${lowStockCount > 0 ? "text-amber-500" : "text-[#F8F8F8]"}`}>
                                    {lowStockCount} <span className="text-sm font-bold uppercase tracking-widest text-white/10 ml-2">Items</span>
                                </h2>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] font-medium text-white/40 mt-6 flex items-center gap-2">
                        {lowStockCount > 0 ? "Low stock levels detected. Reorder recommended." : "All stock levels are currently healthy."}
                    </p>
                </GlassCard>

                <GlassCard className="p-8 border-l-4 border-blue-500/30">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        Expiry Watchlist
                    </p>
                    <div className="space-y-4">
                        {expiringBatches.length > 0 ? expiringBatches.map(batch => (
                            <div key={batch.id} className="flex items-center justify-between gap-4 group">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black text-[#F8F8F8] truncate">{batch.product_variants.products.name}</p>
                                    <p className="text-[9px] font-bold text-white/20 uppercase truncate">BATCH: {batch.batch_number}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] font-black text-blue-500">{batch.current_quantity} Units</p>
                                    <p className="text-[8px] font-bold text-white/20 uppercase">{format(new Date(batch.expiry_date), 'MMM dd')}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-2 text-center text-[10px] font-black text-white/10 uppercase tracking-widest">
                                No urgent expiries
                            </div>
                        )}
                    </div>
                    {expiringBatches.length > 0 && (
                        <Link href="/dealer/stock/batches" className="mt-6 block text-[9px] font-black text-[#D4AF37] uppercase tracking-widest hover:translate-x-1 transition-transform">
                            View All Batches →
                        </Link>
                    )}
                </GlassCard>
            </div>

            {/* Main Stock Table */}
            <GlassCard className="overflow-hidden border-white/5">
                {/* Table Header / Filters */}
                <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <Input
                                placeholder="SEARCH SKU OR PRODUCT..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-12 bg-white/5 border-white/5 text-[11px] font-bold tracking-widest uppercase rounded-xl focus:border-[#D4AF37]/50"
                            />
                        </div>
                        <div className="h-8 w-px bg-white/5" />
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setFilter('all')}
                                variant={filter === 'all' ? 'secondary' : 'ghost'}
                                className={`text-[9px] font-black uppercase tracking-widest h-8 rounded-lg px-4 ${filter === 'all' ? 'bg-[#D4AF37] text-[#0D0D0F]' : 'text-white/40 hover:text-white'}`}
                            >
                                All
                            </Button>
                            <Button
                                onClick={() => setFilter('low')}
                                variant={filter === 'low' ? 'secondary' : 'ghost'}
                                className={`text-[9px] font-black uppercase tracking-widest h-8 rounded-lg px-4 ${filter === 'low' ? 'bg-amber-500 text-white' : 'text-white/40 hover:text-white'}`}
                            >
                                Low Stock
                            </Button>
                            <Button
                                onClick={() => setFilter('out')}
                                variant={filter === 'out' ? 'secondary' : 'ghost'}
                                className={`text-[9px] font-black uppercase tracking-widest h-8 rounded-lg px-4 ${filter === 'out' ? 'bg-red-500 text-white' : 'text-white/40 hover:text-white'}`}
                            >
                                Out of Stock
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/dealer/stock/batches" className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-[#D4AF37] transition-colors">
                            Manage Batches
                        </Link>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest">Product Intelligence</th>
                                <th className="px-8 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-center">Current Quantity</th>
                                <th className="px-8 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-center">Safety Threshold</th>
                                <th className="px-8 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-4 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">Unit Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {filteredStock.length > 0 ? filteredStock.map((item, idx) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/5 flex items-center justify-center relative group-hover:border-[#D4AF37]/30 transition-all">
                                                    {item.products.image_url ? (
                                                        <img src={item.products.image_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-white/10 group-hover:text-[#D4AF37] transition-colors" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-[#F8F8F8] truncate">{item.products.name}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{item.sku}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/5" />
                                                        <span className="text-[9px] font-bold text-[#D4AF37]/60 uppercase tracking-widest">{item.products.brands.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`text-xl font-display font-black ${item.stock_quantity <= 0 ? "text-red-500" : (item.stock_quantity <= (item.low_stock_threshold || 5) ? "text-amber-500" : "text-[#F8F8F8]")}`}>
                                                {item.stock_quantity}
                                            </span>
                                            <span className="text-[10px] font-bold text-white/10 uppercase ml-2 tracking-widest">Units</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-[11px] font-black text-white/40">{item.low_stock_threshold || 5}</span>
                                                <div className="w-12 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full bg-white/20"
                                                        style={{ width: `${Math.min((item.stock_quantity / (item.low_stock_threshold || 5)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {item.stock_quantity <= 0 ? (
                                                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] font-black uppercase tracking-widest">Out of Stock</Badge>
                                            ) : item.stock_quantity <= (item.low_stock_threshold || 5) ? (
                                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-black uppercase tracking-widest">Low Stock</Badge>
                                            ) : (
                                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black uppercase tracking-widest">Healthy</Badge>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="text-sm font-black text-[#F8F8F8]">৳{item.price.toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">MSRP Value</p>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-white/20">
                                                <SearchX className="w-12 h-12 opacity-50" />
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-widest">No Inventory Found</p>
                                                    <p className="text-[10px] font-bold mt-1">Adjust search terms or clear filters.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
