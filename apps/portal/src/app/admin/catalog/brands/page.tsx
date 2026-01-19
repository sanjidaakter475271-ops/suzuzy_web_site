"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    Plus,
    Trash2,
    Edit3,
    Award,
    LayoutGrid,
    Search,
    ChevronRight,
    Globe,
    Image as ImageIcon,
    Loader2,
    X,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";

interface Brand {
    id: string;
    name: string;
    slug: string;
    origin_country?: string;
    logo_url?: string;
    created_at: string;
}

export default function BrandManagement() {
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newBrand, setNewBrand] = useState({ name: '', origin_country: '', logo_url: '' });

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setBrands(data || []);
        } catch (error) {
            console.error("Error fetching brands:", error);
            toast.error("Failed to load brand registry");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleAddBrand = async () => {
        if (!newBrand.name) return toast.error("Brand name required");

        const slug = newBrand.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

        try {
            const { error } = await supabase
                .from('brands')
                .insert([{ ...newBrand, slug }]);

            if (error) throw error;
            toast.success("Brand registered");
            setIsAdding(false);
            setNewBrand({ name: '', origin_country: '', logo_url: '' });
            fetchBrands();
        } catch (error) {
            console.error("Error adding brand:", error);
            toast.error("Registration failed");
        }
    };

    const deleteBrand = async (id: string) => {
        if (!confirm("Remove this brand from platform?")) return;

        try {
            const { error } = await supabase
                .from('brands')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Brand purged");
            fetchBrands();
        } catch (error) {
            console.error("Error deleting brand:", error);
            toast.error("Deletion rejected");
        }
    };

    const columns: ColumnDef<Brand>[] = [
        {
            accessorKey: "name",
            header: "Brand Identity",
            cell: ({ row }) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-all">
                        {row.original.logo_url ? (
                            <img src={row.original.logo_url} alt={row.original.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        ) : (
                            <div className="text-[#D4AF37] font-display font-black text-lg italic uppercase opacity-20 group-hover:opacity-100 transition-opacity">
                                {row.original.name[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-[#F8F8F8] tracking-tight group-hover:text-[#D4AF37] transition-colors">{row.original.name}</p>
                        <p className="text-[9px] text-[#A1A1AA] font-mono tracking-widest uppercase">ID: {row.original.slug}</p>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "origin_country",
            header: "Global Origin",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-xs text-[#F8F8F8]/60 italic font-medium uppercase tracking-tight">
                    <Globe className="w-3.5 h-3.5 text-[#D4AF37]/60" />
                    {row.original.origin_country || 'Registry Pending'}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-3">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 border border-white/5 bg-white/[0.02] hover:bg-white/5 text-[#A1A1AA] hover:text-[#F8F8F8] rounded-xl transition-all"
                    >
                        <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteBrand(row.original.id)}
                        className="h-10 w-10 border border-white/5 bg-white/[0.02] hover:bg-red-500/10 text-red-500/30 hover:text-red-500 rounded-xl transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#D4AF37]/60">
                        <Award className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Manufacturing Authority Registry</span>
                    </div>
                    <h2 className="text-5xl font-display font-black italic tracking-tighter text-[#F8F8F8]">
                        BRAND <MetallicText>REGISTRY</MetallicText>
                    </h2>
                </div>
                <GradientButton
                    onClick={() => setIsAdding(true)}
                    className="h-14 px-10 text-[10px] font-black uppercase italic tracking-[0.2em] shadow-[0_10px_40px_rgba(212,175,55,0.2)]"
                >
                    <Plus className="mr-2 w-4 h-4" /> Authorize Brand
                </GradientButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <GlassCard className="lg:col-span-3 p-2 border-[#D4AF37]/10 bg-[#0D0D0F]/40 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={brands}
                        searchKey="name"
                    />
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard className="p-8 border-white/5 bg-[#1A1A1C]/30 space-y-6">
                        <div className="flex items-center gap-3 text-[#D4AF37]">
                            <ShieldCheck className="w-5 h-5" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Registry Status</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <span className="text-[10px] text-white/40 uppercase font-bold">Authenticated</span>
                                <span className="text-xl font-display font-black text-white italic">{brands.length} Entities</span>
                            </div>
                            <p className="text-[10px] text-white/20 italic font-medium leading-relaxed">
                                Each brand entry defines the verified manufacturing origin for assets across the entire ecosystem.
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Add Brand Modal */}
            <AnimatePresence>
                {isAdding && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
                            onClick={() => setIsAdding(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0D0D0F] border border-[#D4AF37]/20 rounded-[3rem] p-12 z-[70] shadow-[0_40px_100px_rgba(212,175,55,0.15)] overflow-hidden"
                        >
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-3xl font-display font-black italic text-[#F8F8F8] uppercase tracking-tighter">Register <span className="text-[#D4AF37]">Identity</span></h3>
                                        <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1">Manufacturer Authorization Protocol</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="text-white/20 hover:text-white rounded-full">
                                        <X className="w-8 h-8" />
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]/70 italic">Manufacturing Title</label>
                                            <Input
                                                placeholder="e.g. Kawasaki Heavy Industries"
                                                value={newBrand.name}
                                                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                                                className="bg-white/[0.03] border-white/10 focus:border-[#D4AF37]/50 h-16 rounded-2xl text-white font-bold px-6 outline-none transition-all placeholder:text-white/10"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]/70 italic">Global Origin</label>
                                            <div className="relative">
                                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                <Input
                                                    placeholder="e.g. Japan"
                                                    value={newBrand.origin_country}
                                                    onChange={(e) => setNewBrand({ ...newBrand, origin_country: e.target.value })}
                                                    className="bg-white/[0.03] border-white/10 focus:border-[#D4AF37]/50 h-16 rounded-2xl text-white font-bold pl-14 outline-none transition-all placeholder:text-white/10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex flex-col items-center justify-center p-8 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed relative group">
                                        {newBrand.logo_url ? (
                                            <div className="relative w-full aspect-square">
                                                <img src={newBrand.logo_url} alt="Preview" className="w-full h-full object-contain rounded-2xl" />
                                                <button
                                                    onClick={() => setNewBrand({ ...newBrand, logo_url: '' })}
                                                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#D4AF37]/20 group-hover:text-[#D4AF37]/40 transition-colors">
                                                    <ImageIcon className="w-10 h-10" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Branding Asset Required</p>
                                            </>
                                        )}
                                        <Input
                                            placeholder="Paste Logo URL..."
                                            value={newBrand.logo_url}
                                            onChange={(e) => setNewBrand({ ...newBrand, logo_url: e.target.value })}
                                            className="bg-white/[0.03] border-white/10 focus:border-[#D4AF37]/50 h-10 rounded-xl text-[10px] text-white/50 px-4 mt-auto outline-none transition-all placeholder:text-white/5"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-12">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsAdding(false)}
                                        className="h-14 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                                    >
                                        Cancel Protocol
                                    </Button>
                                    <GradientButton
                                        onClick={handleAddBrand}
                                        className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest italic"
                                    >
                                        Finalize Registry
                                    </GradientButton>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
