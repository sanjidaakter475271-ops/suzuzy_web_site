"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Edit,
    Trash,
    Package,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    AlertCircle,
    Loader2,
    FileUp,
    Download,
    X
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    sku: string;
    base_price: number;
    stock_quantity: number;
    status: 'pending' | 'active' | 'draft' | 'rejected' | 'archived';
    categories?: {
        name: string;
    };
    product_images?: {
        image_url: string;
    }[];
    rejection_reason?: string;
    created_at: string;
}

export default function ProductsPage() {
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showImport, setShowImport] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [stockFilter, setStockFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    const fetchInitialData = async () => {
        if (!profile?.dealer_id) return;

        try {
            const [prodRes, catRes] = await Promise.all([
                supabase.from('products').select('*, categories(name), product_images(image_url)').eq('dealer_id', profile.dealer_id).order('created_at', { ascending: false }),
                supabase.from('categories').select('id, name').eq('is_active', true).order('name')
            ]);

            if (prodRes.data) setProducts((prodRes.data as unknown as Product[]) || []);
            if (catRes.data) setCategories(catRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (profile?.dealer_id) toast.error("Catalogue synchronization failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();

        const channel = supabase.channel(`dealer-products-${profile?.dealer_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'products',
                filter: `dealer_id=eq.${profile?.dealer_id}`
            }, () => fetchInitialData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.dealer_id]);

    const deleteProduct = async (id: string) => {
        if (!confirm("Permanently archive this asset from the registry?")) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Asset archived");
            fetchInitialData();
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Authorization failed for asset purging");
        }
    };

    const toggleStatus = async (productId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'draft' : 'active';
        try {
            const { error } = await supabase
                .from('products')
                .update({ status: newStatus })
                .eq('id', productId);

            if (error) throw error;
            toast.success(`Asset status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to toggle status:", error);
            toast.error("Status synchronization failed");
        }
    };

    const handleBulkStatus = async (newStatus: 'active' | 'draft' | 'archived') => {
        if (selectedIds.length === 0) return;
        setIsBulkUpdating(true);
        try {
            const { error } = await supabase
                .from('products')
                .update({ status: newStatus })
                .in('id', selectedIds);

            if (error) throw error;
            toast.success(`Registry updated: ${selectedIds.length} assets set to ${newStatus}`);
            setSelectedIds([]);
            fetchInitialData();
        } catch (error) {
            console.error("Bulk status error:", error);
            toast.error("Registry batch update failed");
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Purge ${selectedIds.length} assets from the registry? This is irreversible.`)) return;

        setIsBulkUpdating(true);
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;
            toast.success(`${selectedIds.length} assets purged from registry`);
            setSelectedIds([]);
            fetchInitialData();
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error("Registry purge failed");
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p.id));
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || p.categories?.name === categoryFilter;
        const matchesStock = stockFilter === "all" ||
            (stockFilter === "low" && p.stock_quantity > 0 && p.stock_quantity <= 10) ||
            (stockFilter === "out" && p.stock_quantity === 0);

        return matchesSearch && matchesStatus && matchesCategory && matchesStock;
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 selection:bg-[#D4AF37] selection:text-[#0D0D0F]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#D4AF37]/60">
                        <Package className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Inventory Asset Management</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-white italic tracking-tighter">
                        EDITORIAL <MetallicText>INVENTORY</MetallicText>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => setShowImport(true)}
                        variant="outline"
                        className="px-6 h-12 border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/5 text-[10px] font-black uppercase italic tracking-widest rounded-xl transition-all"
                    >
                        <FileUp className="mr-2 h-4 w-4" /> Bulk Import
                    </Button>
                    <Link href="/dealer/products/new">
                        <GradientButton className="px-8 h-12 text-[10px] font-black uppercase italic tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.15)]">
                            <Plus className="mr-2 h-4 w-4" /> Register New Asset
                        </GradientButton>
                    </Link>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                    <Input
                        placeholder="Search by asset name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-14 bg-white/[0.03] border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-white/70 outline-none focus:border-[#D4AF37]/30 transition-all placeholder:text-white/10"
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-14 px-6 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 outline-none focus:border-[#D4AF37]/30 transition-all appearance-none cursor-pointer hover:bg-white/5"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="draft">Draft</option>
                        <option value="rejected">Rejected</option>
                        <option value="archived">Archived</option>
                    </select>

                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="h-14 px-6 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 outline-none focus:border-[#D4AF37]/30 transition-all appearance-none cursor-pointer hover:bg-white/5"
                    >
                        <option value="all">All Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="h-14 px-6 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 outline-none focus:border-[#D4AF37]/30 transition-all appearance-none cursor-pointer hover:bg-white/5"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>

                    <Button
                        variant="outline"
                        onClick={() => { setSearchTerm(""); setStatusFilter("all"); setStockFilter("all"); setCategoryFilter("all"); }}
                        className="h-14 px-6 border-white/5 bg-white/[0.02] hover:bg-white/5 text-white/40 hover:text-white transition-all rounded-xl uppercase text-[10px] font-black tracking-widest"
                    >
                        <X className="w-4 h-4 mr-2" /> Reset
                    </Button>
                </div>
            </div>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl"
                    >
                        <GlassCard className="p-4 border-[#D4AF37]/20 bg-[#0D0D0F]/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4 pl-4">
                                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-display font-black italic">
                                    {selectedIds.length}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Assets Selected</span>
                                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-tighter mt-1 italic">Registry Synchronization Active</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isBulkUpdating}
                                    onClick={() => handleBulkStatus('active')}
                                    className="h-12 px-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-green-500/10 hover:text-green-500 text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Activate
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isBulkUpdating}
                                    onClick={() => handleBulkStatus('draft')}
                                    className="h-12 px-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Draft
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isBulkUpdating}
                                    onClick={handleBulkDelete}
                                    className="h-12 px-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-red-500/10 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Purge
                                </Button>
                                <div className="w-[1px] h-8 bg-white/5 mx-2" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedIds([])}
                                    className="h-12 w-12 rounded-xl text-white/20 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editorial Table */}
            <GlassCard className="border-[#D4AF37]/5 bg-[#0D0D0F]/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="p-6 w-16">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#D4AF37] cursor-pointer"
                                    />
                                </th>
                                <th className="p-6 text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Product Details</th>
                                <th className="p-6 text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Logistics</th>
                                <th className="p-6 text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Finance</th>
                                <th className="p-6 text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Status</th>
                                <th className="p-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-4" />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-white/20 italic">Synchronizing Fleet Intelligence...</p>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <Package className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-white/20 italic">No assets found in current deployment scope</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product, idx) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`group hover:bg-white/[0.02] transition-colors ${selectedIds.includes(product.id) ? 'bg-[#D4AF37]/5 border-l-2 border-[#D4AF37]' : ''}`}
                                    >
                                        <td className="p-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(product.id)}
                                                onChange={() => toggleSelection(product.id)}
                                                className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#D4AF37] cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-6 min-w-[300px]">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-xl bg-white/[0.03] overflow-hidden border border-white/5 flex-shrink-0 relative group-hover:border-[#D4AF37]/20 transition-colors">
                                                    {product.product_images?.[0]?.image_url ? (
                                                        <img
                                                            src={product.product_images[0].image_url}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/20 italic font-black text-[10px] uppercase">
                                                            No Asset
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-white font-bold text-sm group-hover:text-[#D4AF37] transition-colors tracking-tight line-clamp-1">{product.name}</span>
                                                    <span className="text-[10px] text-white/30 font-mono tracking-wider">{product.sku || 'PENDING-SKU'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-white/50 font-black uppercase tracking-widest italic">{product.categories?.name || 'Unclassified'}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${product.stock_quantity > 10 ? 'bg-green-500' : product.stock_quantity > 0 ? 'bg-orange-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                                                    <span className={`text-[10px] font-bold tracking-tight ${product.stock_quantity > 0 ? 'text-white/80' : 'text-red-500/80 uppercase italic'}`}>
                                                        {product.stock_quantity > 0 ? `${product.stock_quantity} Units Available` : 'Stock Depleted'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-[#D4AF37] font-display font-black text-lg italic tracking-tighter">{formatCurrency(product.base_price)}</span>
                                                <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest italic">Asset Valuation</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col items-start gap-1.5">
                                                <div
                                                    onClick={() => (product.status === 'active' || product.status === 'draft') && toggleStatus(product.id, product.status)}
                                                    className="cursor-pointer"
                                                >
                                                    <Badge
                                                        variant="outline"
                                                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] italic transition-all active:scale-95 ${product.status === 'active'
                                                            ? 'bg-green-500/5 border-green-500/20 text-green-500/80 hover:bg-green-500/10'
                                                            : product.status === 'pending'
                                                                ? 'bg-amber-500/5 border-amber-500/20 text-amber-500/80 cursor-default'
                                                                : product.status === 'rejected'
                                                                    ? 'bg-red-500/5 border-red-500/20 text-red-500/80 cursor-default'
                                                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {product.status}
                                                    </Badge>
                                                </div>
                                                {product.status === 'rejected' && product.rejection_reason && (
                                                    <div className="flex items-center gap-1 text-red-500/40 hover:text-red-500 transition-colors cursor-help" title={product.rejection_reason}>
                                                        <AlertCircle className="w-3 h-3" />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">View Reason</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    className="h-10 w-10 border border-white/5 bg-white/[0.02] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-xl"
                                                >
                                                    <Link href={`/dealer/products/${product.id}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteProduct(product.id)}
                                                    className="h-10 w-10 border border-white/5 bg-white/[0.02] hover:bg-red-500/10 hover:text-red-500 rounded-xl"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 border border-white/5 bg-white/[0.02] hover:bg-blue-500/10 hover:text-blue-500 rounded-xl">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-white/10 group-hover:hidden transition-all">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Import Modal */}
            <AnimatePresence>
                {showImport && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowImport(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-[#0D0D0F] border border-[#D4AF37]/20 rounded-[2.5rem] p-10 z-[101] shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-display font-black italic text-white uppercase tracking-tighter">Bulk <span className="text-[#D4AF37]">Import</span></h3>
                                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Registry Synchronization Engine</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowImport(false)} className="text-white/20 hover:text-white">
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="space-y-8">
                                <div className="aspect-video rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all cursor-pointer group">
                                    <FileUp className="w-12 h-12 text-white/10 group-hover:text-[#D4AF37] transition-colors" />
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-white group-hover:text-[#D4AF37]">Drop CSV or Excel Asset Registry</p>
                                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">Maximum 500 records per upload</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                                                <Download className="w-4 h-4 text-[#D4AF37]" />
                                            </div>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Inventory Template</span>
                                        </div>
                                        <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] p-0 h-auto">Get Link</Button>
                                    </div>
                                    <p className="text-[9px] text-white/30 leading-relaxed italic">
                                        Ensure your CSV matches the platform taxonomy for Categories and Brand IDs to prevent validation failure in the editorial queue.
                                    </p>
                                </div>

                                <GradientButton className="w-full h-14 text-xs font-black uppercase tracking-widest italic" onClick={() => toast.info("Synchronization Engine Offline for Prototyping")}>
                                    Initialize Import Sequence
                                </GradientButton>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
