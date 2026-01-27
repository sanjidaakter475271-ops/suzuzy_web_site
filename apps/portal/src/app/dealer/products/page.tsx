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
    Eye,
    AlertCircle,
    Loader2,
    FileUp,
    X
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { getDealerProducts, getCategories, deleteProductAction, updateProductStatusAction, bulkUpdateProductStatusAction, bulkDeleteProductsAction } from "@/actions/products";

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
    product_variants?: {
        id: string;
        sku: string;
        has_duplicate_barcode: boolean;
        stock_quantity: number;
    }[];
    rejection_reason?: string;
    created_at: string;
}

export default function ProductsPage() {
    const { profile, loading: profileLoading } = useUser();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [stockFilter, setStockFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    const fetchInitialData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                getDealerProducts(),
                getCategories()
            ]);

            if (prodRes.success && prodRes.data) {
                setProducts(prodRes.data as unknown as Product[]);
            }
            if (catRes.success && catRes.data) {
                setCategories(catRes.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Catalogue synchronization failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile) {
            fetchInitialData();
        }
    }, [profile]);

    const deleteProduct = async (id: string) => {
        if (!confirm("Permanently archive this asset from the registry?")) return;

        try {
            const result = await deleteProductAction(id);

            if (!result.success) throw new Error(result.error);
            toast.success("Asset archived");
            fetchInitialData();
        } catch (error: any) {
            console.error("Error deleting product:", error);
            toast.error(error.message || "Authorization failed for asset purging");
        }
    };

    const toggleStatus = async (productId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'draft' : 'active';
        try {
            const result = await updateProductStatusAction(productId, newStatus);

            if (!result.success) throw new Error(result.error);
            toast.success(`Asset status updated to ${newStatus}`);
            fetchInitialData();
        } catch (error: any) {
            console.error("Failed to toggle status:", error);
            toast.error(error.message || "Status synchronization failed");
        }
    };

    const handleBulkStatus = async (newStatus: 'active' | 'draft' | 'archived') => {
        if (selectedIds.length === 0) return;
        setIsBulkUpdating(true);
        try {
            const result = await bulkUpdateProductStatusAction(selectedIds, newStatus);

            if (!result.success) throw new Error(result.error);
            toast.success(`Registry updated: ${selectedIds.length} assets set to ${newStatus}`);
            setSelectedIds([]);
            fetchInitialData();
        } catch (error: any) {
            console.error("Bulk status error:", error);
            toast.error(error.message || "Registry batch update failed");
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Purge ${selectedIds.length} assets from the registry? This is irreversible.`)) return;

        setIsBulkUpdating(true);
        try {
            const result = await bulkDeleteProductsAction(selectedIds);

            if (!result.success) throw new Error(result.error);
            toast.success(`${selectedIds.length} assets purged from registry`);
            setSelectedIds([]);
            fetchInitialData();
        } catch (error: any) {
            console.error("Bulk delete error:", error);
            toast.error(error.message || "Registry purge failed");
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
                    <Link href="/dealer/products/import">
                        <Button
                            variant="outline"
                            className="px-6 h-12 border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/5 text-[10px] font-black uppercase italic tracking-widest rounded-xl transition-all"
                        >
                            <FileUp className="mr-2 h-4 w-4" /> Bulk Import
                        </Button>
                    </Link>
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] h-14 bg-white/[0.03] border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 focus:border-[#D4AF37]/30">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={stockFilter} onValueChange={setStockFilter}>
                        <SelectTrigger className="w-[180px] h-14 bg-white/[0.03] border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 focus:border-[#D4AF37]/30">
                            <SelectValue placeholder="All Stock" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stock</SelectItem>
                            <SelectItem value="low">Low Stock</SelectItem>
                            <SelectItem value="out">Out of Stock</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] h-14 bg-white/[0.03] border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 focus:border-[#D4AF37]/30">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

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
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
                    >
                        <GlassCard className="p-4 border-[#D4AF37]/20 bg-[#0D0D0F]/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4 pl-4">
                                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-display font-black italic">
                                    {selectedIds.length}
                                </div>
                                <div className="flex flex-col hidden sm:flex">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Assets Selected</span>
                                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-tighter mt-1 italic">Registry Synchronization Active</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" disabled={isBulkUpdating} onClick={() => handleBulkStatus('active')} className="h-12 px-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-green-500/10 hover:text-green-500 text-[10px] font-black uppercase tracking-widest transition-all">Activate</Button>
                                <Button variant="ghost" size="sm" disabled={isBulkUpdating} onClick={() => handleBulkStatus('draft')} className="h-12 px-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">Draft</Button>
                                <Button variant="ghost" size="sm" disabled={isBulkUpdating} onClick={handleBulkDelete} className="h-12 px-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-red-500/10 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all">Purge</Button>
                                <div className="w-[1px] h-8 bg-white/5 mx-2" />
                                <Button variant="ghost" size="icon" onClick={() => setSelectedIds([])} className="h-12 w-12 rounded-xl text-white/20 hover:text-white"><X className="w-4 h-4" /></Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editorial Grid (Responsive Replacement for Table) */}
            <GlassCard className="border-[#D4AF37]/5 bg-[#0D0D0F]/40 overflow-hidden">
                {/* Desktop Headers */}
                <div className="hidden md:grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-4 p-6 border-b border-white/5 bg-white/[0.01]">
                    <div className="w-4 flex items-center justify-center">
                        <input type="checkbox" checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#D4AF37] cursor-pointer" />
                    </div>
                    <div className="text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Product Details</div>
                    <div className="text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Logistics</div>
                    <div className="text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Finance</div>
                    <div className="text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Status</div>
                    <div className="text-right text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-[0.3em] font-display">Actions</div>
                </div>

                <div className="divide-y divide-white/[0.03]">
                    {loading ? (
                        <div className="p-20 text-center">
                            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-4" />
                            <p className="text-[10px] uppercase font-black tracking-widest text-white/20 italic">Synchronizing Fleet Intelligence...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-20 text-center">
                            <Package className="w-12 h-12 text-white/5 mx-auto mb-4" />
                            <p className="text-[10px] uppercase font-black tracking-widest text-white/20 italic">No assets found in current deployment scope</p>
                        </div>
                    ) : (
                        filteredProducts.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`group relative hover:bg-white/[0.02] transition-colors ${selectedIds.includes(product.id) ? 'bg-[#D4AF37]/5 border-l-2 border-[#D4AF37]' : ''}`}
                            >
                                {/* Mobile Row (Single Line) */}
                                <div className="md:hidden flex items-center p-4 gap-4 active:bg-white/5 transition-colors">
                                    <div className="w-14 h-14 rounded-xl bg-white/[0.03] overflow-hidden border border-white/5 flex-shrink-0">
                                        {product.product_images?.[0]?.image_url ? (
                                            <img src={product.product_images[0].image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/20 italic font-black text-[10px]">NA</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                                        <div className="flex flex-col min-w-0 gap-1">
                                            <span className="text-white font-bold text-base truncate">{product.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-white/50 font-mono tracking-wider truncate">{product.sku}</span>
                                                <Badge variant="outline" className={`px-2 py-0.5 text-[10px] h-5 border-0 ${product.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/40'}`}>
                                                    {product.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                                                <span className="text-[#D4AF37] font-display font-bold text-sm">{formatCurrency(product.base_price)}</span>
                                                <span className={`text-[10px] font-medium ${product.stock_quantity > 0 ? 'text-white/40' : 'text-red-500'}`}>
                                                    {product.stock_quantity}
                                                </span>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-white/40">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-[#0D0D0F] border-[#D4AF37]/10">
                                                    <DropdownMenuItem asChild className="focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] cursor-pointer">
                                                        <Link href={`/dealer/products/${product.id}`} className="flex items-center gap-2 py-3 px-4">
                                                            <Eye className="w-4 h-4" />
                                                            <span className="text-xs font-bold uppercase tracking-widest">View Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild className="focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] cursor-pointer">
                                                        <Link href={`/dealer/products/${product.id}/edit`} className="flex items-center gap-2 py-3 px-4">
                                                            <Edit className="w-4 h-4" />
                                                            <span className="text-xs font-bold uppercase tracking-widest">Edit Asset</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <div className="h-[1px] bg-white/5 my-1" />
                                                    <DropdownMenuItem
                                                        onClick={() => deleteProduct(product.id)}
                                                        className="focus:bg-red-500/10 focus:text-red-500 text-red-500/80 cursor-pointer flex items-center gap-2 py-3 px-4"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Archive Asset</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Grid Row */}
                                <div className="hidden md:grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-4 p-6 items-center">
                                    <div className="w-4 flex items-center justify-center">
                                        <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelection(product.id)} className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#D4AF37] cursor-pointer" />
                                    </div>
                                    <div className="flex items-center gap-5 overflow-hidden">
                                        <div className="w-16 h-16 rounded-xl bg-white/[0.03] overflow-hidden border border-white/5 flex-shrink-0">
                                            {product.product_images?.[0]?.image_url ? (
                                                <img src={product.product_images[0].image_url} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/20 italic font-black text-[10px] uppercase">No Asset</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <span className="text-white font-bold text-sm group-hover:text-[#D4AF37] transition-colors truncate">{product.name}</span>
                                            <span className="text-[10px] text-white/30 font-mono tracking-wider">{product.sku || 'PENDING-SKU'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">{product.categories?.name || 'Unclassified'}</span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${product.stock_quantity > 10 ? 'bg-green-500' : product.stock_quantity > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                                                <span className="text-[10px] font-bold text-white/80">{product.stock_quantity} Units</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[#D4AF37] font-display font-black text-lg italic tracking-tighter">{formatCurrency(product.base_price)}</span>
                                    </div>
                                    <div onClick={() => toggleStatus(product.id, product.status)} className="cursor-pointer">
                                        <Badge variant="outline" className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] w-fit ${product.status === 'active' ? 'bg-green-500/5 text-green-500/80 border-green-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                                            {product.status}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild className="h-10 w-10 border border-white/5 hover:text-[#D4AF37] rounded-xl">
                                            <Link href={`/dealer/products/${product.id}`}><Edit className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} className="h-10 w-10 border border-white/5 hover:text-red-500 rounded-xl">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </GlassCard>

            {/* Removed Legacy Import Modal */}
        </div>
    );
}
