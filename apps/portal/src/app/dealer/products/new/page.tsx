'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Layers
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
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AttributeForm } from '@/components/products/attribute-form';
import { VariantGenerator, Variant } from '@/components/products/variant-generator';

interface Category {
    id: string;
    name: string;
}

interface BikeModel {
    id: string;
    name: string;
}

export default function NewProductPage() {
    const { profile } = useUser();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
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
        brand: ''
    });

    const [attributes, setAttributes] = useState<Record<string, any>>({});
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        async function fetchInitialData() {
            const [catRes, modelRes] = await Promise.all([
                supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
                supabase.from('bike_models').select('id, name').order('name')
            ]);

            if (catRes.data) setCategories(catRes.data);
            if (modelRes.data) setBikeModels(modelRes.data);

            if (catRes.data?.[0]) {
                setFormData(prev => ({ ...prev, category_id: catRes.data[0].id }));
            }
        }
        fetchInitialData();
    }, []);

    const toggleModel = (id: string) => {
        setSelectedModels(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        if (!profile?.dealer_id) return;
        if (!formData.name || !formData.base_price) {
            toast.error("Essential credentials missing in the registry");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Insert Product
            const { data: product, error: pError } = await supabase
                .from('products')
                .insert({
                    dealer_id: profile.dealer_id,
                    name: formData.name,
                    slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4),
                    description: formData.description,
                    sku: formData.sku,
                    part_number: formData.part_number,
                    base_price: Number(formData.base_price),
                    sale_price: formData.sale_price ? Number(formData.sale_price) : null,
                    stock_quantity: variants.length > 0 ? variants.reduce((acc, v) => acc + v.stock, 0) : Number(formData.stock_quantity || 0),
                    category_id: formData.category_id,
                    status: 'pending',
                    brand: formData.brand,
                    metadata: attributes // Save dynamic attributes here
                })
                .select()
                .single();

            if (pError) throw pError;

            // 2. Insert Variants if any
            if (variants.length > 0) {
                const variantMappings = variants.map(v => ({
                    product_id: product.id,
                    sku: v.sku,
                    price: v.price,
                    stock_quantity: v.stock,
                    low_stock_threshold: v.threshold,
                    attributes: v.attributes,
                    dealer_id: profile.dealer_id
                }));
                const { error: vError } = await supabase.from('product_variants').insert(variantMappings);
                if (vError) throw vError;
            }

            // 3. Insert Model Mapping
            if (selectedModels.length > 0) {
                const modelMappings = selectedModels.map(mid => ({
                    product_id: product.id,
                    bike_model_id: mid
                }));
                const { error: mError } = await supabase.from('product_bike_models').insert(modelMappings);
                if (mError) throw mError;
            }

            // 4. Insert Images
            if (images.length > 0) {
                const imageMappings = images.map((url, idx) => ({
                    product_id: product.id,
                    image_url: url,
                    is_primary: idx === 0
                }));
                const { error: iError } = await supabase.from('product_images').insert(imageMappings);
                if (iError) throw iError;
            }

            toast.success("Asset registered and queued for editorial review");
            router.push('/dealer/products');
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Registry failed to accept asset");
        } finally {
            setIsSubmitting(false);
        }
    };

    const STEPS = [
        { id: 1, label: 'Identity', icon: Info },
        { id: 2, label: 'Specs', icon: Settings2 },
        { id: 3, label: 'Finance', icon: CircleDollarSign },
        { id: 4, label: 'Variants', icon: Layers },
        { id: 5, label: 'Assets', icon: ImageIcon },
    ];

    const currentCategoryName = categories.find(c => c.id === formData.category_id)?.name || "";

    return (
        <div className="max-w-6xl mx-auto selection:bg-[#D4AF37] selection:text-[#0D0D0F] p-8 -mt-8">
            {/* Multi-step Progress Bar */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                            <Package className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Phase {currentStep} Processing</span>
                        </div>
                        <h1 className="text-4xl font-display font-black text-white italic tracking-tighter">
                            APPEND <MetallicText>NEW PRODUCT</MetallicText>
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest"
                        >
                            Discard Draft
                        </Button>
                        {currentStep === 5 ? (
                            <GradientButton
                                disabled={isSubmitting}
                                onClick={handleSubmit}
                                className="px-8 h-12 text-xs font-black uppercase italic tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.15)]"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                Finalize Registry
                            </GradientButton>
                        ) : (
                            <GradientButton
                                onClick={nextStep}
                                className="px-8 h-12 text-xs font-black uppercase italic tracking-widest"
                            >
                                Next Phase <ChevronRight className="ml-2 w-4 h-4" />
                            </GradientButton>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div
                                key={step.id}
                                className={cn(
                                    "relative h-2 rounded-full overflow-hidden transition-all duration-500",
                                    isActive || isCompleted ? "bg-[#D4AF37]/20" : "bg-white/5"
                                )}
                            >
                                <motion.div
                                    initial={false}
                                    animate={{ width: isActive || isCompleted ? "100%" : "0%" }}
                                    className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#B8962E]"
                                />
                                <div className="absolute -top-8 left-0 flex items-center gap-2">
                                    <Icon className={cn(
                                        "w-3 h-3 transition-colors",
                                        isActive ? "text-[#D4AF37]" : isCompleted ? "text-emerald-500" : "text-white/20"
                                    )} />
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest",
                                        isActive ? "text-[#D4AF37]" : isCompleted ? "text-emerald-500" : "text-white/20"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20"
                >
                    <div className="lg:col-span-2 space-y-8">
                        {currentStep === 1 && (
                            <GlassCard className="p-8 border-[#D4AF37]/10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                        <Info className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest italic">Identity Credentials</h2>
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Product Classification</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value }))}
                                            className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl px-4 text-xs font-bold text-white/80 outline-none focus:border-[#D4AF37]/50 appearance-none bg-[#0D0D0F]"
                                        >
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Product Title</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                            placeholder="e.g. Suzuki Genuine Synthetic Oil 10W-40"
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 transition-all text-lg font-medium"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Description</label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                            placeholder="Provide detailed technical specifications..."
                                            className="min-h-[160px] bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 resize-none leading-relaxed p-6"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Brand</label>
                                            <Input
                                                value={formData.brand}
                                                onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value }))}
                                                placeholder="Suzuki Ecstar"
                                                className="h-14 bg-white/[0.03] border-white/10 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">SKU / Protocol ID</label>
                                            <Input
                                                value={formData.sku}
                                                onChange={(e) => setFormData(p => ({ ...p, sku: e.target.value }))}
                                                placeholder="SZ-OIL-40-1L"
                                                className="h-14 bg-white/[0.03] border-white/10 rounded-xl font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {currentStep === 2 && (
                            <AttributeForm
                                categoryId={formData.category_id}
                                categoryName={currentCategoryName}
                                values={attributes}
                                onChange={(id, val) => setAttributes(p => ({ ...p, [id]: val }))}
                            />
                        )}

                        {currentStep === 3 && (
                            <GlassCard className="p-8 border-[#D4AF37]/10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                        <CircleDollarSign className="w-5 h-5 text-[#D4AF37]" />
                                    </div>
                                    <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest italic">Financial Parameters</h2>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">MSRP (৳)</label>
                                        <Input
                                            type="number"
                                            value={formData.base_price}
                                            onChange={(e) => setFormData(p => ({ ...p, base_price: e.target.value }))}
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl text-lg font-bold"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest ml-1">Stock Baseline</label>
                                        <Input
                                            type="number"
                                            placeholder="Ignored if variants exist"
                                            value={formData.stock_quantity}
                                            onChange={(e) => setFormData(p => ({ ...p, stock_quantity: e.target.value }))}
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl text-lg font-bold"
                                        />
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {currentStep === 4 && (
                            <VariantGenerator
                                baseSku={formData.sku || "PROD"}
                                basePrice={Number(formData.base_price || 0)}
                                onUpdate={setVariants}
                            />
                        )}

                        {currentStep === 5 && (
                            <div className="space-y-8">
                                <GlassCard className="p-8 border-[#D4AF37]/10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                            <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
                                        </div>
                                        <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest italic">Visual Gallery</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                        {images.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                                                <img src={url} alt="Product" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                        <div
                                            onClick={() => {
                                                const url = prompt("Enter asset URL for prototyping:");
                                                if (url) setImages(prev => [...prev, url]);
                                            }}
                                            className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/30 transition-all cursor-pointer group"
                                        >
                                            <Plus className="w-6 h-6 text-white/20 group-hover:text-[#D4AF37]" />
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Add Asset</span>
                                        </div>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-8 border-[#D4AF37]/10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                            <LayoutGrid className="w-5 h-5 text-[#D4AF37]" />
                                        </div>
                                        <h2 className="text-lg font-display font-bold text-white uppercase tracking-widest italic">Fleet Compatibility</h2>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {bikeModels.map(model => (
                                            <Badge
                                                key={model.id}
                                                variant="outline"
                                                onClick={() => toggleModel(model.id)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all",
                                                    selectedModels.includes(model.id)
                                                        ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0D0D0F]'
                                                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                                )}
                                            >
                                                {model.name} {selectedModels.includes(model.id) && <Check className="w-2.5 h-2.5 ml-1 inline" />}
                                            </Badge>
                                        ))}
                                    </div>
                                </GlassCard>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Step Overview */}
                    <div className="lg:col-span-1 space-y-6">
                        <GlassCard className="p-8 border-[#D4AF37]/10 bg-[#0D0D0F]/60">
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 italic">REGISTRY SUMMARY</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[8px] font-black text-[#D4AF37]/60 uppercase tracking-widest">Product Identity</label>
                                    <p className="text-xs font-bold text-white mt-1 capitalize">{formData.name || 'Undefined Registry Name'}</p>
                                    <p className="text-[9px] text-white/30 font-mono mt-1">{formData.sku || 'SKU-PENDING'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[8px] font-black text-[#D4AF37]/60 uppercase tracking-widest">Pricing</label>
                                        <p className="text-xs font-black text-white mt-1">{formData.base_price ? formatCurrency(Number(formData.base_price)) : 'MSRP Unset'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-[#D4AF37]/60 uppercase tracking-widest">Variants</label>
                                        <p className="text-xs font-black text-white mt-1">{variants.length} protocols</p>
                                    </div>
                                </div>

                                {Object.keys(attributes).length > 0 && (
                                    <div className="pt-4 border-t border-white/5 space-y-2">
                                        <label className="text-[8px] font-black text-[#D4AF37]/60 uppercase tracking-widest">Specifications</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(attributes).slice(0, 4).map(([k, v]) => (
                                                <div key={k} className="text-[9px] text-white/40 truncate">
                                                    <span className="font-black text-[#D4AF37]/30 uppercase">{k.replace('_', ' ')}:</span> {v}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Inventory Level</p>
                                            <p className="text-[9px] text-white/20 font-bold">
                                                {variants.length > 0 ? variants.reduce((acc, v) => acc + v.stock, 0) : formData.stock_quantity || 0} Total Units
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {currentStep > 1 && (
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                className="w-full h-12 border border-white/5 bg-white/[0.02] text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest rounded-xl"
                            >
                                Revert Phase {currentStep - 1}
                            </Button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
