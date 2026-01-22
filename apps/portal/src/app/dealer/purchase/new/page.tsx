"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Save,
    Search,
    Trash2,
    Plus,
    ShoppingBag,
    Building2,
    CreditCard,
    Calculator,
    Package,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Vendor {
    id: string;
    name: string;
    code: string;
}

interface ProductVariant {
    id: string;
    sku: string;
    unit_cost_price: number;
    product_id: string; // Added this
    products: {
        name: string;
    };
    attributes: any;
}

interface POItem {
    variant_id: string;
    product_id: string; // Added this
    product_name: string;
    sku: string;
    quantity: number;
    unit_cost: number;
    total: number;
}

export default function NewPurchaseOrderPage() {
    const router = useRouter();
    const { profile } = useUser();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Master Data
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [searchVariant, setSearchVariant] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        vendor_id: "",
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: "",
        notes: "",
        payment_terms: "cash",
        tax_amount: 0,
        shipping_cost: 0
    });

    const [items, setItems] = useState<POItem[]>([]);

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchMasterData();
        }
    }, [profile]);

    const fetchMasterData = async () => {
        try {
            const [vendorRes, variantRes] = await Promise.all([
                supabase.from("vendors").select("id, name, code").eq("dealer_id", profile?.dealer_id),
                supabase.from("product_variants").select("id, sku, unit_cost_price, product_id, products(name)").eq("products.dealer_id", profile?.dealer_id)
            ]);
            setVendors(vendorRes.data || []);
            setVariants(variantRes.data as any || []);
        } catch (error) {
            console.error("Error fetching master data:", error);
        }
    };

    const addItem = (variant: ProductVariant) => {
        const existing = items.find(i => i.variant_id === variant.id);
        if (existing) return;

        setItems([...items, {
            variant_id: variant.id,
            product_id: variant.product_id,
            product_name: variant.products.name,
            sku: variant.sku,
            quantity: 1,
            unit_cost: variant.unit_cost_price || 0,
            total: variant.unit_cost_price || 0
        }]);
    };

    const updateItem = (index: number, field: keyof POItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'unit_cost') {
            item.total = Number(item.quantity) * Number(item.unit_cost);
        }
        newItems[index] = item;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const grandTotal = subtotal + Number(formData.tax_amount) + Number(formData.shipping_cost);

    const handleSubmit = async () => {
        if (!profile?.dealer_id || !formData.vendor_id || items.length === 0) {
            alert("Please select a vendor and add at least one item.");
            return;
        }

        try {
            setLoading(true);

            // Call the atomic transaction RPC
            const { data: poId, error: rpcErr } = await supabase.rpc('create_purchase_order_transaction', {
                p_dealer_id: profile.dealer_id,
                p_vendor_id: formData.vendor_id,
                p_order_date: formData.order_date,
                p_expected_delivery_date: formData.expected_delivery_date || null,
                p_payment_terms: formData.payment_terms,
                p_subtotal: subtotal,
                p_tax_amount: formData.tax_amount,
                p_shipping_cost: formData.shipping_cost,
                p_grand_total: grandTotal,
                p_notes: formData.notes,
                p_items: items // items array contains variant_id, product_id, quantity, unit_cost, total
            });

            if (rpcErr) throw rpcErr;

            router.push("/dealer/purchase");
        } catch (error: any) {
            console.error("Error creating PO:", error);
            alert(`Failed to finalize procurement: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredVariants = variants.filter(v =>
        v.products.name.toLowerCase().includes(searchVariant.toLowerCase()) ||
        v.sku.toLowerCase().includes(searchVariant.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32">
            {/* Nav Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 text-white/40 hover:text-[#D4AF37] transition-all"
                >
                    <div className="w-10 h-10 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F8F8F8]">Return to Registry</span>
                </button>

                <div className="flex items-center bg-white/[0.02] border border-white/5 rounded-2xl p-1">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${step === s ? 'bg-[#D4AF37] text-[#0D0D0F]' : 'text-white/20'}`}
                        >
                            Step 0{s}
                        </div>
                    ))}
                </div>
            </div>

            {/* Title Section */}
            <div className="space-y-3">
                <h1 className="text-5xl font-display font-black tracking-tighter text-[#F8F8F8] italic leading-tight">
                    INITIATE <span className="text-[#D4AF37]">PROCUREMENT</span>
                </h1>
                <p className="text-[#A1A1AA] text-sm max-w-xl font-medium leading-relaxed">
                    {step === 1 && "Select your vendor partner and define logistics parameters."}
                    {step === 2 && "Specify variant quantities and agreed cost benchmarks."}
                    {step === 3 && "Verify financial reconciliation before finalizing PO."}
                </p>
            </div>

            {/* Wizard Steps */}
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <GlassCard className="p-8 space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                    <Building2 className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-[#F8F8F8]">Vendor Protocol</h2>
                                    <p className="text-[10px] font-bold text-[#D4AF37]/50 uppercase tracking-tighter">Supply Source Selection</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Assigned Partner</Label>
                                    <Select
                                        value={formData.vendor_id}
                                        onValueChange={(val) => setFormData({ ...formData, vendor_id: val })}
                                    >
                                        <SelectTrigger className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium px-6">
                                            <SelectValue placeholder="Select vendor entity" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A1C] border-white/10 text-white">
                                            {vendors.map(v => (
                                                <SelectItem key={v.id} value={v.id}>{v.name} ({v.code})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Payment Settlement Terms</Label>
                                    <Select
                                        value={formData.payment_terms}
                                        onValueChange={(val) => setFormData({ ...formData, payment_terms: val })}
                                    >
                                        <SelectTrigger className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium px-6">
                                            <SelectValue placeholder="Terms" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A1C] border-white/10 text-white">
                                            <SelectItem value="cash">Instant Settlement</SelectItem>
                                            <SelectItem value="credit">Credit Agreement</SelectItem>
                                            <SelectItem value="partial">Partial Advance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                    <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-[#F8F8F8]">Logistics Matrix</h2>
                                    <p className="text-[10px] font-bold text-[#D4AF37]/50 uppercase tracking-tighter">Temporal Parameters</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Order Timestamp</Label>
                                        <Input
                                            type="date"
                                            value={formData.order_date}
                                            onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                                            className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium px-6"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">ETA Gateway</Label>
                                        <Input
                                            type="date"
                                            value={formData.expected_delivery_date}
                                            onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                                            className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium px-6"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Special Instructions</Label>
                                    <Input
                                        placeholder="Add procurement notes..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium px-6"
                                    />
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Inventory Selector */}
                            <GlassCard className="lg:col-span-1 p-6 space-y-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Inventory Scan</p>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-all" />
                                    <Input
                                        placeholder="Scan SKU or Search..."
                                        value={searchVariant}
                                        onChange={(e) => setSearchVariant(e.target.value)}
                                        className="h-12 bg-white/[0.02] border-white/5 rounded-xl pl-12 text-xs"
                                    />
                                </div>

                                <div className="space-y-3 h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    {filteredVariants.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => addItem(v)}
                                            className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/20 transition-all group"
                                        >
                                            <p className="text-[11px] font-black text-[#F8F8F8] truncate group-hover:text-[#D4AF37] transition-colors">{v.products.name}</p>
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter mt-1">{v.sku}</p>
                                        </button>
                                    ))}
                                </div>
                            </GlassCard>

                            {/* Item Ledger */}
                            <div className="lg:col-span-3 space-y-4">
                                {items.length > 0 ? (
                                    <div className="space-y-4">
                                        {items.map((item, idx) => (
                                            <motion.div
                                                layout
                                                key={item.variant_id}
                                                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-8 group hover:border-white/10 transition-all"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-black text-[#F8F8F8] truncate">{item.product_name}</h4>
                                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{item.sku}</p>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 space-y-1.5">
                                                        <Label className="text-[9px] font-black uppercase tracking-tighter text-white/20">Quantity</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                                            className="h-10 bg-white/5 border-none text-center font-black"
                                                        />
                                                    </div>
                                                    <div className="w-32 space-y-1.5">
                                                        <Label className="text-[9px] font-black uppercase tracking-tighter text-white/20">Unit Cost (৳)</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.unit_cost}
                                                            onChange={(e) => updateItem(idx, 'unit_cost', Number(e.target.value))}
                                                            className="h-10 bg-white/5 border-none text-center font-black"
                                                        />
                                                    </div>
                                                    <div className="w-32 text-right">
                                                        <p className="text-[9px] font-black uppercase tracking-tighter text-white/20">Total</p>
                                                        <p className="text-sm font-black text-[#F8F8F8]">৳{item.total.toLocaleString()}</p>
                                                    </div>
                                                    <Button
                                                        onClick={() => removeItem(idx)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-10 h-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-white/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                                        <Package className="w-12 h-12 text-white/5 mb-4" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Awaiting variant input...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Summary */}
                        <GlassCard className="lg:col-span-2 p-8 space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                    <Calculator className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-[#F8F8F8]">Procurement Summary</h2>
                                    <p className="text-[10px] font-bold text-[#D4AF37]/50 uppercase tracking-tighter">Quantity & Cost Aggregates</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.variant_id} className="flex items-center justify-between py-2 border-b border-white/[0.02]">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white/60">{item.product_name}</p>
                                            <p className="text-[9px] text-white/20 uppercase">{item.sku} × {item.quantity}</p>
                                        </div>
                                        <p className="text-xs font-black text-[#F8F8F8]">৳{item.total.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 space-y-3">
                                <div className="flex items-center justify-between text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                    <span>Subtotal Aggregate</span>
                                    <span>৳{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                    <span>Estimated Duty / Tax</span>
                                    <div className="flex items-center gap-2">
                                        <span>৳</span>
                                        <input
                                            type="number"
                                            value={formData.tax_amount}
                                            onChange={(e) => setFormData({ ...formData, tax_amount: Number(e.target.value) })}
                                            className="w-24 bg-white/5 border-none rounded-lg h-8 text-right px-2 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all font-black text-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                    <span>Logistics / Shipping</span>
                                    <div className="flex items-center gap-2">
                                        <span>৳</span>
                                        <input
                                            type="number"
                                            value={formData.shipping_cost}
                                            onChange={(e) => setFormData({ ...formData, shipping_cost: Number(e.target.value) })}
                                            className="w-24 bg-white/5 border-none rounded-lg h-8 text-right px-2 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all font-black text-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <span className="text-sm font-black uppercase tracking-widest text-[#D4AF37]">Grand Valuation</span>
                                    <span className="text-3xl font-display font-black text-[#F8F8F8]">৳{grandTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Final Verification */}
                        <div className="space-y-6">
                            <GlassCard className="p-8 space-y-6 bg-[#D4AF37]/5 border-[#D4AF37]/20">
                                <div className="flex items-center gap-3 text-[#D4AF37]">
                                    <AlertCircle className="w-5 h-5" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Procurement Authority</h3>
                                </div>
                                <p className="text-[11px] text-[#A1A1AA] font-bold leading-relaxed">
                                    By finalizing this PO, you authorize the procurement of {items.reduce((acc, i) => acc + i.quantity, 0)} units with a total liability of <span className="text-[#D4AF37]">৳{grandTotal.toLocaleString()}</span>. This will be logged as a pending obligation in your ledger.
                                </p>
                            </GlassCard>

                            <GlassCard className="p-6 space-y-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Assigned Vendor</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37]">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-[#F8F8F8]">{vendors.find(v => v.id === formData.vendor_id)?.name}</span>
                                </div>
                            </GlassCard>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-64 right-0 h-24 bg-[#0D0D0F]/80 backdrop-blur-xl border-t border-white/5 px-12 flex items-center justify-between z-30">
                <Button
                    variant="ghost"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                >
                    Previous Protocol
                </Button>

                <div className="flex items-center gap-4">
                    {step < 3 ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !formData.vendor_id || step === 2 && items.length === 0}
                            className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-[11px] h-12 px-12 rounded-2xl transition-all shadow-[0_8px_24px_rgba(212,175,55,0.2)]"
                        >
                            Next Step
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[11px] h-12 px-12 rounded-2xl transition-all shadow-[0_8px_24px_rgba(22,163,74,0.3)]"
                        >
                            {loading ? "Processing..." : "Finalize Procurement"}
                            <Save className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
