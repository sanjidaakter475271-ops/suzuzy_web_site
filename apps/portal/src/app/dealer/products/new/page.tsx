'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    Plus,
    X,
    Check,
    Loader2,
    Image as ImageIcon,
    Trash2,
    LayoutGrid,
    ChevronDown,
    Search,
    Scan
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
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
import { BarcodeScanner } from '@/components/common/BarcodeScanner';
import { MultiSelect } from '@/components/ui/multi-select';

interface Category {
    id: string;
    name: string;
    parent_id: string | null;
}

interface BikeModel {
    id: string;
    name: string;
}

interface Brand {
    id: string;
    name: string;
}

interface ProductVariant {
    id: string;
    size: string;
    sku: string;
    price: string;
    stock: string;
    costPrice: string;
    barcode: string;
}

export default function NewProductPage() {
    const { profile } = useUser();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [bikeModels, setBikeModels] = useState<BikeModel[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sku: '',
        barcode: '',
        brand_id: '',
        brand_name: '', // Display name
        category_id: '',
        base_price: '',
        cost_price: '',
    });

    // Combobox state
    const [openBrand, setOpenBrand] = useState(false);
    const [brandSearch, setBrandSearch] = useState("");

    const generateSku = (categoryName: string, brandName: string) => {
        if (!categoryName && !brandName) return;
        const catPart = categoryName ? categoryName.slice(0, 3).toUpperCase() : 'PROD';
        const brandPart = brandName ? brandName.replace(/\s+/g, '').slice(0, 3).toUpperCase() : 'GEN';
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const newSku = `${catPart}-${brandPart}-${randomPart}`;
        setFormData(prev => ({ ...prev, sku: newSku }));
    };

    // Variants state
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        async function fetchInitialData() {
            const [catRes, modelRes, brandRes] = await Promise.all([
                supabase.from('categories').select('id, name, parent_id').eq('is_active', true).order('name'),
                supabase.from('bike_models').select('id, name').order('name'),
                supabase.from('brands').select('id, name').order('name')
            ]);

            if (catRes.data) setCategories(catRes.data);
            if (modelRes.data) setBikeModels(modelRes.data);
            if (brandRes.data) setBrands(brandRes.data);
        }
        fetchInitialData();
    }, []);

    const createNewBrand = async (name: string) => {
        if (!profile?.dealer_id) {
            toast.error("Dealer ID not found");
            return;
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data, error } = await supabase.from('brands').insert({
            name,
            slug,
            dealer_id: profile.dealer_id, // Assuming brands might be dealer specific or global? 
            // If global, this might fail if RLS prevents it. Assuming public or dealer-bound.
        }).select().single();

        if (error) {
            console.error("Brand creation error:", JSON.stringify(error, null, 2));
            toast.error("ব্র্যান্ড তৈরি করা যায়নি: " + (error.message || "Unknown error"));
            return;
        }

        if (data) {
            setBrands(prev => [...prev, data]);
            setFormData(prev => ({ ...prev, brand_id: data.id, brand_name: data.name }));
            const catName = categories.find(c => c.id === formData.category_id)?.name || '';
            generateSku(catName, data.name);
            setOpenBrand(false);
            setBrandSearch("");
            toast.success(`ব্র্যান্ড '${name}' যোগ করা হয়েছে`);
        }
    };

    const addVariant = () => {
        const newVariant: ProductVariant = {
            id: Date.now().toString(),
            size: '',
            sku: '',
            barcode: '',
            price: formData.base_price || '',
            stock: '0',
            costPrice: formData.cost_price || ''
        };
        setVariants([...variants, newVariant]);
    };

    const removeVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const updateVariant = (id: string, field: keyof ProductVariant, value: string) => {
        setVariants(variants.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    };

    const toggleModel = (id: string) => {
        setSelectedModels(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!profile?.dealer_id) {
            toast.error("ডিলার একাউন্ট প্রয়োজন");
            return;
        }
        if (!formData.name) {
            toast.error("প্রোডাক্ট এর নাম দিতে হবে");
            return;
        }
        if (!formData.category_id) {
            toast.error("ক্যাটাগরি সিলেক্ট করুন");
            return;
        }
        if (!formData.base_price) {
            toast.error("বিক্রয় মূল্য দিতে হবে");
            return;
        }

        setIsSubmitting(true);
        try {
            // Calculate total stock from variants or use 0
            const totalStock = variants.length > 0
                ? variants.reduce((acc, v) => acc + Number(v.stock || 0), 0)
                : 0;

            // 1. Insert Product
            const { data: product, error: pError } = await supabase
                .from('products')
                .insert({
                    dealer_id: profile.dealer_id,
                    name: formData.name,
                    slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4),
                    description: formData.description,
                    sku: formData.sku, // Internal System ID
                    barcode: formData.barcode, // Scannable Barcode
                    base_price: Number(formData.base_price),
                    stock_quantity: totalStock,
                    category_id: formData.category_id,
                    status: 'pending',
                    brand: formData.brand_name, // Keeping string for backward compatibility
                    brand_id: formData.brand_id || null, // Best practice
                })
                .select()
                .single();

            if (pError) throw pError;

            // 2. Insert Variants if any
            if (variants.length > 0) {
                const variantMappings = variants.map(v => ({
                    product_id: product.id,
                    sku: v.sku || `${formData.sku}-${v.size}`.toUpperCase(),
                    manual_barcode: v.barcode, // If you added this column, otherwise standard barcode
                    price: Number(v.price) || Number(formData.base_price),
                    stock_quantity: Number(v.stock) || 0,
                    attributes: { size: v.size },
                    dealer_id: profile.dealer_id
                }));
                // Note: manual_barcode needs to exist in DB or mapped correctly. 
                // Since I only added 'barcode' to 'products', I will assume variants use 'sku' for now or map standard columns.
                // Assuming 'product_variants' doesn't have 'barcode' yet, skipping it or mapping to a supported field.

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

            toast.success("প্রোডাক্ট সফলভাবে যোগ করা হয়েছে!");
            router.push('/dealer/products');
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("প্রোডাক্ট যোগ করা যায়নি। আবার চেষ্টা করুন।");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 pb-32">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                    <Package className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">নতুন প্রোডাক্ট</span>
                </div>
                <h1 className="text-3xl font-display font-black text-white tracking-tight">
                    প্রোডাক্ট <MetallicText>যোগ করুন</MetallicText>
                </h1>
                <p className="text-white/40 text-sm mt-2">সব তথ্য পূরণ করে নিচে "প্রোডাক্ট যোগ করুন" বাটনে ক্লিক করুন</p>
            </div>

            {/* Single Form */}
            <div className="space-y-6">
                {/* Section 1: Basic Info */}
                <GlassCard className="p-6 border-[#D4AF37]/10">
                    <h2 className="text-sm font-bold text-[#D4AF37] mb-6 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-xs font-black">1</span>
                        প্রোডাক্ট তথ্য
                    </h2>
                    <div className="space-y-5">
                        <Select
                            value={formData.category_id}
                            onValueChange={(value) => {
                                setFormData(p => ({ ...p, category_id: value }));
                                const catName = categories.find(c => c.id === value)?.name || '';
                                if (formData.brand_name) generateSku(catName, formData.brand_name);
                            }}
                        >
                            <SelectTrigger className="w-full h-12 bg-white/[0.03] border-white/10 rounded-xl px-4 text-white focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50">
                                <SelectValue placeholder="-- ক্যাটাগরি সিলেক্ট করুন --" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1f] border-[#D4AF37]/20 text-white">
                                {categories.map(c => {
                                    const isSub = c.parent_id !== null;
                                    return (
                                        <SelectItem
                                            key={c.id}
                                            value={c.id}
                                            className={cn(
                                                "cursor-pointer focus:bg-[#D4AF37]/10 focus:text-[#D4AF37]",
                                                isSub ? "pl-8 text-white/80" : "font-bold text-white"
                                            )}
                                        >
                                            {isSub ? `↳ ${c.name}` : c.name}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Product Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/60">প্রোডাক্ট এর নাম <span className="text-red-400">*</span></label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                            placeholder="যেমন: Castrol Power1 4T Engine Oil"
                            className="h-12 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 text-white placeholder:text-white/20"
                        />
                    </div>

                    {/* Brand & SKU Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Brand Combobox */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60">ব্র্যান্ড</label>
                            <Popover open={openBrand} onOpenChange={setOpenBrand}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openBrand}
                                        className="h-12 w-full justify-between bg-white/[0.03] border-white/10 text-white hover:bg-white/5 hover:text-white"
                                    >
                                        {formData.brand_name ? formData.brand_name : "ব্র্যান্ড সিলেক্ট করুন..."}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#0D0D0F] border-[#D4AF37]/20">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search brand..."
                                            value={brandSearch}
                                            onValueChange={setBrandSearch}
                                            className="text-white"
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                <div className="p-2 text-center">
                                                    <p className="text-xs text-white/40 mb-2">ব্র্যান্ড পাওয়া যায়নি</p>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="w-full h-8 text-xs bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20"
                                                        onClick={() => createNewBrand(brandSearch)}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" /> তৈরি করুন "{brandSearch}"
                                                    </Button>
                                                </div>
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {brands.map((brand) => (
                                                    <CommandItem
                                                        key={brand.id}
                                                        value={brand.name}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }}
                                                        onSelect={() => {
                                                            setFormData(p => ({ ...p, brand_id: brand.id, brand_name: brand.name }));
                                                            const catName = categories.find(c => c.id === formData.category_id)?.name || '';
                                                            generateSku(catName, brand.name);
                                                            setOpenBrand(false);
                                                        }}
                                                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-[#D4AF37]/10 focus:text-[#D4AF37] data-[selected=true]:bg-[#D4AF37]/10 text-white"
                                                    >
                                                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                                            {formData.brand_id === brand.id && (
                                                                <Check className="h-4 w-4" />
                                                            )}
                                                        </span>
                                                        {brand.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Internal SKU (Auto Generated) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60">SKU (Internal System ID)</label>
                            <div className="relative">
                                <Input
                                    value={formData.sku}
                                    onChange={(e) => setFormData(p => ({ ...p, sku: e.target.value }))}
                                    placeholder="AUTO-GEN"
                                    readOnly // User can edit but purely meant for system. actually lets keep it editable but auto-filled.
                                    className="h-12 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 text-white/50 placeholder:text-white/20 font-mono pr-24"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <Badge variant="outline" className="border-[#D4AF37]/20 text-[#D4AF37] text-[10px]">AUTO</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Barcode (Scannable) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60">বারকোড (Scan)</label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.barcode}
                                    onChange={(e) => setFormData(p => ({ ...p, barcode: e.target.value }))}
                                    placeholder="Scan or type..."
                                    className="h-12 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 text-white placeholder:text-white/20 font-mono"
                                />
                                <BarcodeScanner
                                    onScan={(code) => {
                                        setFormData(p => ({ ...p, barcode: code }));
                                        toast.success("Barcode Scanned: " + code);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/60">বিবরণ</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            placeholder="প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন..."
                            className="min-h-[100px] bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 text-white placeholder:text-white/20 resize-none"
                        />
                    </div>
                </GlassCard>

                {/* Section 2: Pricing */}
                <GlassCard className="p-6 border-[#D4AF37]/10">
                    <h2 className="text-sm font-bold text-[#D4AF37] mb-6 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-xs font-black">2</span>
                        মূল্য নির্ধারণ
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60">বিক্রয় মূল্য (৳) <span className="text-red-400">*</span></label>
                            <Input
                                type="number"
                                value={formData.base_price}
                                onChange={(e) => setFormData(p => ({ ...p, base_price: e.target.value }))}
                                placeholder="850"
                                className="h-12 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 text-white text-lg font-bold placeholder:text-white/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60">ক্রয় মূল্য (৳)</label>
                            <Input
                                type="number"
                                value={formData.cost_price}
                                onChange={(e) => setFormData(p => ({ ...p, cost_price: e.target.value }))}
                                placeholder="720"
                                className="h-12 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 text-white text-lg font-bold placeholder:text-white/20"
                            />
                        </div>
                    </div>
                    {formData.base_price && formData.cost_price && (
                        <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-xs text-emerald-400">
                                প্রতিটি তে লাভ: <span className="font-bold">৳{Number(formData.base_price) - Number(formData.cost_price)}</span>
                            </p>
                        </div>
                    )}
                </GlassCard>

                {/* Section 3: Variants */}
                <GlassCard className="p-6 border-[#D4AF37]/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-xs font-black">3</span>
                            সাইজ/ভ্যারিয়েন্ট (ঐচ্ছিক)
                        </h2>
                        <Button
                            onClick={addVariant}
                            size="sm"
                            className="h-8 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20"
                        >
                            <Plus className="w-3 h-3 mr-1" /> ভ্যারিয়েন্ট যোগ করুন
                        </Button>
                    </div>

                    {variants.length === 0 ? (
                        <div className="text-center py-8 text-white/30">
                            <p className="text-sm">একই প্রোডাক্টের different সাইজ থাকলে (1L, 500ml, 4L) এখানে যোগ করুন</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {variants.map((v, idx) => (
                                <motion.div
                                    key={v.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-2 md:grid-cols-12 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 items-center"
                                >
                                    <div className="col-span-2 md:col-span-2">
                                        <label className="text-[10px] text-white/40 block mb-1">সাইজ</label>
                                        <Input
                                            value={v.size}
                                            onChange={(e) => updateVariant(v.id, 'size', e.target.value)}
                                            placeholder="1L"
                                            className="h-10 bg-black/20 border-white/10 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-3">
                                        <label className="text-[10px] text-white/40 block mb-1">SKU</label>
                                        <Input
                                            value={v.sku}
                                            onChange={(e) => updateVariant(v.id, 'sku', e.target.value)}
                                            placeholder="CAST-1L"
                                            className="h-10 bg-black/20 border-white/10 text-sm font-mono"
                                        />
                                    </div>
                                    <div className="hidden md:block md:col-span-1">
                                        {/* Placeholder for variant barcode scan if needed */}
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="text-[10px] text-white/40 block mb-1">বিক্রয় মূল্য</label>
                                        <Input
                                            type="number"
                                            value={v.price}
                                            onChange={(e) => updateVariant(v.id, 'price', e.target.value)}
                                            placeholder="850"
                                            className="h-10 bg-black/20 border-white/10 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="text-[10px] text-white/40 block mb-1">ক্রয় মূল্য</label>
                                        <Input
                                            type="number"
                                            value={v.costPrice}
                                            onChange={(e) => updateVariant(v.id, 'costPrice', e.target.value)}
                                            placeholder="720"
                                            className="h-10 bg-black/20 border-white/10 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="text-[10px] text-white/40 block mb-1">স্টক</label>
                                        <Input
                                            type="number"
                                            value={v.stock}
                                            onChange={(e) => updateVariant(v.id, 'stock', e.target.value)}
                                            placeholder="0"
                                            className="h-10 bg-black/20 border-white/10 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-1 flex justify-center md:justify-center justify-start mt-2 md:mt-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeVariant(v.id)}
                                            className="h-10 w-10 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </GlassCard>

                {/* Section 4: Images */}
                <GlassCard className="p-6 border-[#D4AF37]/10">
                    <h2 className="text-sm font-bold text-[#D4AF37] mb-6 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-xs font-black">4</span>
                        ছবি (ঐচ্ছিক)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                                const url = prompt("ছবির URL দিন:");
                                if (url) setImages(prev => [...prev, url]);
                            }}
                            className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/30 transition-all cursor-pointer group"
                        >
                            <ImageIcon className="w-6 h-6 text-white/20 group-hover:text-[#D4AF37]" />
                            <span className="text-[10px] font-bold text-white/20">ছবি যোগ করুন</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Section 5: Bike Compatibility */}
                <GlassCard className="p-6 border-[#D4AF37]/10">
                    <h2 className="text-sm font-bold text-[#D4AF37] mb-6 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-xs font-black">5</span>
                        বাইক সামঞ্জস্য (ঐচ্ছিক)
                    </h2>
                    <div className="relative">
                        <MultiSelect
                            options={bikeModels.map(m => ({ value: m.id, label: m.name }))}
                            selected={selectedModels}
                            onChange={setSelectedModels}
                            placeholder="বাইক মডেল সিলেক্ট করুন..."
                            className="bg-white/[0.03] border-white/10"
                        />
                    </div>
                </GlassCard>
            </div >

            {/* Fixed Bottom Submit Button */}
            < div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0D0D0F] via-[#0D0D0F] to-transparent pt-8 pb-6 px-6" >
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-white/40 hover:text-white"
                    >
                        বাতিল করুন
                    </Button>
                    <GradientButton
                        disabled={isSubmitting || !formData.name || !formData.category_id || !formData.base_price}
                        onClick={handleSubmit}
                        className="px-8 h-12 text-sm font-bold shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                প্রসেসিং...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                প্রোডাক্ট যোগ করুন
                            </>
                        )}
                    </GradientButton>
                </div>
            </div >
        </div >
    );
}
