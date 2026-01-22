"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    Plus,
    Trash2,
    Edit3,
    Boxes,
    LayoutGrid,
    Search,
    ChevronRight,
    Loader2,
    X,
    Database,
    Zap,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    parent_id?: string;
    created_at: string;
}

export default function CategoryManagement() {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', parent_id: '' });

    // Delete Alert State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load catalog structure");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', parent_id: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            description: category.description,
            parent_id: category.parent_id || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return toast.error("Category name required");

        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const payload = {
            name: formData.name,
            description: formData.description,
            parent_id: formData.parent_id || null,
            slug
        };

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('categories')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success("Node updated successfully");
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([payload]);
                if (error) throw error;
                toast.success("Category added to catalog");
            }

            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error("Operation failed");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', deleteId);

            if (error) throw error;
            toast.success("Branch removed");
            setDeleteId(null);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Deletion rejected - ensure no sub-categories exist");
        }
    };

    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: "name",
            header: "Classification",
            cell: ({ row }) => {
                const hasParent = !!row.original.parent_id;
                const parentName = categories.find(c => c.id === row.original.parent_id)?.name;

                return (
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl bg-white/${hasParent ? '[0.01]' : '[0.03]'} border border-white/5 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37]/30 transition-all ${hasParent ? 'ml-6 scale-90' : ''}`}>
                            {hasParent ? <ChevronRight className="w-3 h-3 opacity-40" /> : <Boxes className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-[#F8F8F8] tracking-tight group-hover:text-[#D4AF37] transition-colors">{row.original.name}</p>
                                {hasParent && (
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-white/20 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                        Sub of {parentName}
                                    </span>
                                )}
                            </div>
                            <p className="text-[9px] text-[#A1A1AA] font-mono tracking-widest uppercase opacity-40">SYD: {row.original.slug}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "description",
            header: "Protocol Metadata",
            cell: ({ row }) => (
                <p className="text-xs text-[#A1A1AA]/60 italic line-clamp-1 max-w-sm">{row.original.description || 'No system description assigned.'}</p>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-3">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(row.original)}
                        className="h-10 w-10 border border-white/5 bg-white/[0.02] hover:bg-white/5 text-[#A1A1AA] hover:text-[#F8F8F8] rounded-xl transition-all"
                    >
                        <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(row.original.id)}
                        className="h-10 w-10 border border-white/5 bg-white/[0.02] hover:bg-red-500/10 text-red-500/30 hover:text-red-500 rounded-xl transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    const parentCategories = categories.filter(c => !c.parent_id && c.id !== editingId);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#D4AF37]/60">
                        <Database className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Administrative Taxonomy Level</span>
                    </div>
                    <h2 className="text-5xl font-display font-black italic tracking-tighter text-[#F8F8F8]">
                        CATALOG <MetallicText>TAXONOMY</MetallicText>
                    </h2>
                </div>
                <GradientButton
                    onClick={openAddModal}
                    className="h-14 px-10 text-[10px] font-black uppercase italic tracking-[0.2em] shadow-[0_10px_40px_rgba(212,175,55,0.2)]"
                >
                    <Plus className="mr-2 w-4 h-4" /> Append Hierarchy
                </GradientButton>
            </div>

            {/* Information Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 p-2 border-[#D4AF37]/10 bg-[#0D0D0F]/40 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={categories}
                        searchKey="name"
                    />
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard className="p-8 border-white/5 bg-[#1A1A1C]/30 space-y-6">
                        <div className="flex items-center gap-3 text-[#D4AF37]">
                            <Zap className="w-5 h-5" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">System Insights</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <span className="text-[10px] text-white/40 uppercase font-bold">Total Depth</span>
                                <span className="text-xl font-display font-black text-white italic">{categories.length} Nodes</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <span className="text-[10px] text-white/40 uppercase font-bold">Tier 1 Groups</span>
                                <span className="text-sm font-display font-black text-[#D4AF37] italic">{categories.filter(c => !c.parent_id).length} Roots</span>
                            </div>
                            <p className="text-[10px] text-white/20 italic font-medium leading-relaxed">
                                Categorization impacts product search efficiency and SEO indexing. Group wisely.
                            </p>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8 border-white/5 bg-[#1A1A1C]/10 flex flex-col items-center text-center gap-4 group cursor-help">
                        <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center text-white/10 group-hover:border-[#D4AF37]/30 group-hover:text-[#D4AF37] transition-all">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <p className="text-[9px] text-white/30 font-black uppercase tracking-widest leading-relaxed">
                            Hierarchy logic is enforced at the database level to prevent circular dependencies.
                        </p>
                    </GlassCard>
                </div>
            </div>

            {/* Add/Edit Category Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0D0D0F] border border-[#D4AF37]/20 rounded-[3rem] p-12 z-[70] shadow-[0_40px_100px_rgba(212,175,55,0.1)]"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-display font-black italic text-[#F8F8F8] uppercase tracking-tighter">
                                        {editingId ? 'Edit' : 'Append'} <span className="text-[#D4AF37]">Node</span>
                                    </h3>
                                    <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1">Classification Expansion Protocol</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white rounded-full">
                                    <X className="w-8 h-8" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]/70 italic">Classification Title</label>
                                    <Input
                                        placeholder="e.g. Supersport Machines"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white/[0.03] border-white/10 focus:border-[#D4AF37]/50 h-16 rounded-2xl text-white font-bold px-6 outline-none transition-all placeholder:text-white/10"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]/70 italic">Parent Hierarchy</label>
                                    <select
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl h-16 px-6 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 transition-all font-bold appearance-none"
                                    >
                                        <option value="" className="bg-[#0D0D0F]">Root (Top Level)</option>
                                        {parentCategories.map(cat => (
                                            <option key={cat.id} value={cat.id} className="bg-[#0D0D0F]">
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]/70 italic">Functional Overview</label>
                                    <textarea
                                        placeholder="Define the scope of this taxonomy branch..."
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-3xl focus:border-[#D4AF37]/50 h-32 p-6 text-white text-sm focus:outline-none transition-all placeholder:text-white/10 italic font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsModalOpen(false)}
                                        className="h-14 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                                    >
                                        Abort
                                    </Button>
                                    <GradientButton
                                        onClick={handleSave}
                                        className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest italic"
                                    >
                                        {editingId ? 'Save Changes' : 'Commit Node'}
                                    </GradientButton>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]"
                            onClick={() => setDeleteId(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0D0D0F] border border-red-500/20 rounded-[2.5rem] p-10 z-[70] shadow-[0_40px_100px_rgba(239,68,68,0.1)]"
                        >
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                                    <AlertTriangle className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-display font-black italic text-[#F8F8F8] uppercase tracking-tight">
                                        Delete <span className="text-red-500">System Node?</span>
                                    </h3>
                                    <p className="text-sm text-white/40 font-medium leading-relaxed">
                                        This action will permanently destroy this category branch and all associated metadata. This cannot be undone.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setDeleteId(null)}
                                        className="h-14 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        className="h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest italic shadow-[0_10px_30px_rgba(239,68,68,0.3)] transition-all"
                                    >
                                        Execute Delete
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
