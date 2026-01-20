"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    XCircle,
    Eye,
    Package,
    Tag,
    Image as ImageIcon,
    AlertCircle,
    ZoomIn,
    Calendar,
    Layers,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    description: string;
    base_price: number;
    status: 'pending' | 'active' | 'draft' | 'rejected';
    stock_quantity: number;
    product_images?: {
        image_url: string;
    }[];
    dealer_id: string;
    dealers?: {
        business_name: string;
    };
    category_id?: string;
    categories?: {
        name: string;
    };
    created_at: string;
    submitted_at?: string;
}

export default function AdminProductModeration() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const fetchPendingProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, dealers(business_name), categories(name), product_images(image_url)')
                .eq('status', 'pending')
                .eq('product_images.is_primary', true)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching pending products:", error);
            toast.error("Failed to load audit queue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingProducts();

        const sub = supabase.channel('product-moderation')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchPendingProducts())
            .subscribe();

        return () => {
            supabase.removeChannel(sub);
        };
    }, []);

    const updateStatus = async (id: string, status: Product['status']) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Product ${status}`);
            if (selectedProduct?.id === id) setSelectedProduct(null);
        } catch (error: any) {
            console.error("Error updating product status:", JSON.stringify(error, null, 2), error.message, error.details);
            toast.error(`Decision failed for ${status}: ${error.message || 'Unknown error'}`);
        }
    };

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "name",
            header: "Product Asset",
            cell: ({ row }) => (
                <div className="relative group rounded-xl overflow-visible">
                    <div className="flex items-center gap-4 p-2 transition-all group-hover:bg-white/[0.02]">
                        <div className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 group-hover:border-[#D4AF37]/40 transition-all">
                            {row.original.product_images?.[0]?.image_url ? (
                                <Image
                                    src={row.original.product_images[0].image_url}
                                    alt={row.original.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <ImageIcon className="w-5 h-5 text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#F8F8F8] tracking-tight line-clamp-1 group-hover:text-[#D4AF37] transition-colors">{row.original.name}</p>
                            <p className="text-[10px] text-[#A1A1AA] uppercase font-bold tracking-widest">{row.original.dealers?.business_name}</p>
                        </div>
                    </div>

                    {/* Premium Slide-up Detail Overlay */}
                    <div className="absolute left-0 bottom-full mb-2 w-[320px] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out z-[100] pointer-events-none group-hover:pointer-events-auto">
                        <div className="bg-[#F8F8F8] rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#D4AF37]/20 flex flex-col gap-4 overflow-hidden relative">
                            {/* Decorative Accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full -mr-12 -mt-12 blur-2xl" />

                            <div className="flex items-center justify-between border-b border-black/5 pb-3">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Dealer Source</p>
                                    <p className="text-xs font-bold text-black flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-black/40" />
                                        {row.original.dealers?.business_name || 'System Auto-Assign'}
                                    </p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Available</p>
                                    <p className="text-xs font-bold text-black flex items-center justify-end gap-1.5">
                                        <Package className="w-3.5 h-3.5 text-black/40" />
                                        {row.original.stock_quantity ?? 0} <span className="text-[10px] text-black/40">Units</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Submission Date</p>
                                    <p className="text-[11px] font-bold text-black flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-black/20" />
                                        {formatDate(row.original.created_at)}
                                    </p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Classification</p>
                                    <p className="text-[11px] font-bold text-black flex items-center justify-end gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-black/20" />
                                        {row.original.categories?.name || 'Unmapped'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Triangle Connector */}
                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-[#F8F8F8] ml-8 shadow-sm" />
                    </div>
                </div>
            )
        },
        {
            accessorKey: "base_price",
            header: "Listing Price",
            cell: ({ row }) => (
                <div className="font-display font-bold text-[#F8F8F8] italic">
                    {formatCurrency(row.original.base_price)}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedProduct(row.original)}
                        className="h-8 px-3 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-[9px] font-black uppercase tracking-widest border border-transparent hover:border-[#D4AF37]/20"
                    >
                        Audit
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(row.original.id, 'active')}
                        className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/10"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(row.original.id, 'rejected')}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                    >
                        <XCircle className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-10 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        PRODUCT <span className="text-[#DC2626]">AUDIT</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                        {products.length} Items Awaiting Catalog Compliance
                    </p>
                </div>
            </div>

            <div className="bg-[#0D0D0F]/40 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/10 overflow-visible">
                <DataTable
                    columns={columns}
                    data={products}
                    searchKey="name"
                />
            </div>

            {/* Side Drawer Review Panel */}
            <AnimatePresence>
                {selectedProduct && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0D0D0F] border-l border-[#D4AF37]/20 z-50 shadow-[20px_0_60px_rgba(0,0,0,0.5)] p-0 flex flex-col"
                        >
                            <div className="p-10 pb-4 flex justify-between items-center">
                                <h3 className="text-2xl font-display font-black italic text-[#F8F8F8]">Asset <span className="text-[#DC2626]">Audit</span></h3>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)} className="text-[#A1A1AA] hover:text-[#F8F8F8]">
                                    <XCircle className="w-6 h-6" />
                                </Button>
                            </div>

                            <ScrollArea className="flex-1 px-10 pb-10">
                                <div className="space-y-10">
                                    {/* Main Product Image Hover-Zoom View */}
                                    <div className="relative aspect-square rounded-[2rem] bg-white/5 border border-white/10 overflow-hidden group">
                                        {selectedProduct.product_images?.[0]?.image_url ? (
                                            <>
                                                <Image
                                                    src={selectedProduct.product_images[0].image_url}
                                                    alt={selectedProduct.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                                                        <ZoomIn className="w-3 h-3" /> Image Fidelity: HIGH
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-white/10">
                                                <ImageIcon className="w-16 h-16 mb-2" />
                                                <p className="text-[10px] uppercase font-black tracking-widest">No Visual Asset</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-[#DC2626] mb-2">Specifications Dossier</p>
                                            <h4 className="text-3xl font-display font-black italic text-[#F8F8F8] tracking-tight leading-none">
                                                {selectedProduct.name}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-6">
                                                <div className="text-2xl font-display font-bold text-[#F8F8F8] italic">
                                                    {formatCurrency(selectedProduct.base_price)}
                                                </div>
                                                <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/20 uppercase tracking-[0.2em] font-black text-[9px]">
                                                    Awaiting Verification
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA] border-b border-white/5 pb-2">Description Metadata</p>
                                            <p className="text-sm text-[#F8F8F8]/80 leading-relaxed italic border-l-2 border-[#D4AF37]/20 pl-4">
                                                &quot;{selectedProduct.description || 'No description provided by dealer.'}&quot;
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA]">Origin</p>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                    <span className="text-[11px] font-bold text-[#F8F8F8] uppercase">{selectedProduct.dealers?.business_name}</span>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA]">Catalog Entry</p>
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                    <span className="text-[11px] font-bold text-[#F8F8F8] uppercase">Pending Mapping</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            <div className="p-10 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 bg-[#0D0D0F]">
                                <Button
                                    onClick={() => updateStatus(selectedProduct.id, 'rejected')}
                                    variant="outline"
                                    className="border-[#DC2626]/30 text-[#DC2626] hover:bg-[#DC2626]/10 font-bold uppercase tracking-widest text-[10px] h-12"
                                >
                                    Flag Asset
                                </Button>
                                <Button
                                    onClick={() => updateStatus(selectedProduct.id, 'active')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest text-[10px] h-12"
                                >
                                    Approve for Catalog
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Simple Building2 icon replacement if missing from local lucide
function Building2(props: React.ComponentProps<"svg">) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
        </svg>
    )
}
