'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    ChevronRight,
    Image as ImageIcon,
    LayoutGrid,
    CircleDollarSign,
    Settings2,
    Plus,
    X,
    Info,
    Check,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import { MetallicText } from '@/components/ui/premium/MetallicText';
import { GradientButton } from '@/components/ui/premium/GradientButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Category {
    id: string;
    name: string;
}

interface BikeModel {
    id: string;
    name: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { profile } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sku: '',
        part_number: '',
        base_price: '',
        sale_price: '',
        stock_quantity: '',
        category_id: '',
        brand: '',
        status: ''
    });

    const [selectedModels, setSelectedModels] = useState<string[]>([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [catRes, modelRes, prodRes, mapRes] = await Promise.all([
                    supabase.from('categories').select('id, name').eq('is_active', true),
                    supabase.from('bike_models').select('id, name').order('name'),
                    supabase.from('products').select('*').eq('id', id).single(),
                    supabase.from('product_bike_models').select('bike_model_id').eq('product_id', id)
                ]);

                if (catRes.data) setCategories(catRes.data);
                if (bikeModels) setBikeModels(modelRes.data || []);

                if (prodRes.data) {
                    const p = prodRes.data;
                    setFormData({
                        name: p.name || '',
                        description: p.description || '',
                        sku: p.sku || '',
                        part_number: p.part_number || '',
                        base_price: String(p.base_price || ''),
                        sale_price: String(p.sale_price || ''),
                        stock_quantity: String(p.stock_quantity || ''),
                        category_id: p.category_id || '',
                        brand: p.brand || '',
                        status: p.status || ''
                    });
                }

                if (mapRes.data) {
                    setSelectedModels(mapRes.data.map(m => m.bike_model_id));
                }
            } catch (error) {
                console.error("Fetch failed:", error);
                toast.error("Failed to retrieve asset data");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const toggleModel = (id: string) => {
        setSelectedModels(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!profile?.dealer_id) return;
        setSaving(true);
        try {
            // 1. Update Product
            const { error: pError } = await supabase
                .from('products')
                .update({
                    name: formData.name,
                    description: formData.description,
                    sku: formData.sku,
                    part_number: formData.part_number,
                    base_price: Number(formData.base_price),
                    sale_price: formData.sale_price ? Number(formData.sale_price) : null,
                    stock_quantity: Number(formData.stock_quantity),
                    category_id: formData.category_id,
                    brand: formData.brand,
                    // If it was rejected, editing should probably reset it to pending for re-review
                    status: formData.status === 'rejected' ? 'pending' : formData.status
                })
                .eq('id', id);

            if (pError) throw pError;

            // 2. Refresh Model Mapping
            await supabase.from('product_bike_models').delete().eq('product_id', id);
            if (selectedModels.length > 0) {
                const modelMappings = selectedModels.map(mid => ({
                    product_id: id,
                    bike_model_id: mid
                }));
                await supabase.from('product_bike_models').insert(modelMappings);
            }

            // 3. Sync Images (Assuming simple URL list for now)
            // This would require a more complex image management UI, but let's at least ensure the save works

            toast.success("Asset intelligence synchronized");
            router.push('/dealer/products');
        } catch (error) {
            console.error("Sync failed:", error);
            toast.error("Cloud synchronization failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full min-h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20 italic">Retrieving Asset Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto selection:bg-[#D4AF37] selection:text-[#0D0D0F] p-8 -mt-8">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                        <Package className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Inventory Mastery</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-white italic tracking-tighter">
                        REVISE <MetallicText>ASSET {formData.sku}</MetallicText>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest"
                    >
                        Back to Fleet
                    </Button>
                    <GradientButton
                        disabled={saving}
                        onClick={handleSubmit}
                        className="px-8 h-12 text-xs font-black uppercase italic tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.15)]"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Update Registry
                    </GradientButton>
                </div>
            </div>

            {formData.status === 'rejected' && (
                <div className="mb-12 p-6 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-6">
                    <AlertTriangle className="w-10 h-10 text-red-500 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-black text-red-500 uppercase tracking-widest mb-1">Asset Rejected by Moderation</h4>
                        <p className="text-xs text-white/60 leading-relaxed italic">Updating this asset will automatically resubmit it for editorial review.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Information */}
                    <GlassCard className="p-8 border-[#D4AF37]/10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                <Info className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest italic">General Credentials</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Product Title</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 transition-all text-lg font-medium"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Comprehensive Description</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                    className="min-h-[200px] bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 resize-none leading-relaxed p-6"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Brand</label>
                                    <Input
                                        value={formData.brand}
                                        onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value }))}
                                        className="h-14 bg-white/[0.03] border-white/10 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">SKU / Serial</label>
                                    <Input
                                        value={formData.sku}
                                        onChange={(e) => setFormData(p => ({ ...p, sku: e.target.value }))}
                                        className="h-14 bg-white/[0.03] border-white/10 rounded-xl font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Pricing & Inventory */}
                    <GlassCard className="p-8 border-[#D4AF37]/10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                <CircleDollarSign className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest italic">Finance & Quantities</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Standard MSRP (৳)</label>
                                <Input
                                    type="number"
                                    value={formData.base_price}
                                    onChange={(e) => setFormData(p => ({ ...p, base_price: e.target.value }))}
                                    className="h-14 bg-white/[0.03] border-white/10 rounded-xl text-lg font-bold"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Promotional Rate (৳)</label>
                                <Input
                                    type="number"
                                    value={formData.sale_price}
                                    onChange={(e) => setFormData(p => ({ ...p, sale_price: e.target.value }))}
                                    className="h-14 bg-white/[0.03] border-white/10 rounded-xl text-lg font-bold text-[#D4AF37]"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Available Units</label>
                                <Input
                                    type="number"
                                    value={formData.stock_quantity}
                                    onChange={(e) => setFormData(p => ({ ...p, stock_quantity: e.target.value }))}
                                    className="h-14 bg-white/[0.03] border-white/10 rounded-xl text-lg font-bold"
                                />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    {/* Media Gallery */}
                    <GlassCard className="p-8 border-[#D4AF37]/10">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#D4AF37]" /> Visual Gallery
                        </h3>
                        <div className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/[0.02] hover:border-[#D4AF37]/30 transition-all cursor-pointer group">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] italic">Vault Asset Locked</span>
                        </div>
                    </GlassCard>

                    {/* Classification */}
                    <GlassCard className="p-8 border-[#D4AF37]/10">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-[#D4AF37]" /> Logic Split
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value }))}
                                    className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 text-xs font-bold text-white/80 outline-none focus:border-[#D4AF37]/50 appearance-none bg-[#0D0D0F]"
                                >
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Compatibility */}
                    <GlassCard className="p-8 border-[#D4AF37]/10 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-[#D4AF37]" /> Compatibility
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {bikeModels.map(model => (
                                <Badge
                                    key={model.id}
                                    variant="outline"
                                    onClick={() => toggleModel(model.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all ${selectedModels.includes(model.id)
                                        ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0D0D0F]'
                                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                        }`}
                                >
                                    {model.name} {selectedModels.includes(model.id) && <Check className="w-2.5 h-2.5 ml-1 inline" />}
                                </Badge>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
