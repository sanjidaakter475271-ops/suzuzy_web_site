"use client";

import { useEffect, useState } from "react";
import {
    RefreshCcw,
    ArrowLeft,
    Search,
    Package,
    AlertTriangle,
    Save,
    ChevronRight,
    SearchX,
    CheckCircle2,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BatchSelection {
    id: string;
    batch_number: string;
    current_quantity: number;
    unit_cost_price: number;
    product_id: string;
    variant_id: string;
    product_variants: {
        sku: string;
        products: { name: string };
    };
}

const ADJUSTMENT_REASONS = [
    { value: 'damaged', label: 'Damaged / Broken' },
    { value: 'theft', label: 'Theft / Loss' },
    { value: 'counting_error', label: 'Counting Error / Correction' },
    { value: 'expired', label: 'Expired Stock' },
    { value: 'returned', label: 'Returned to Vendor' },
    { value: 'other', label: 'Other / Miscellaneous' }
];

export default function StockAdjustmentsPage() {
    const { profile } = useUser();
    const router = useRouter();
    const [batches, setBatches] = useState<BatchSelection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('subtract');
    const [quantity, setQuantity] = useState<number>(0);
    const [reason, setReason] = useState<string>("");
    const [notes, setNotes] = useState<string>("");

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchBatches();
        }
    }, [profile]);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("inventory_batches")
                .select(`
                    id,
                    batch_number,
                    current_quantity,
                    unit_cost_price,
                    product_id,
                    variant_id,
                    product_variants (
                        sku,
                        products (name)
                    )
                `)
                .eq("dealer_id", profile?.dealer_id)
                .gt("current_quantity", 0)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setBatches(data as any || []);
        } catch (error) {
            console.error("Error fetching batches:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjust = async () => {
        if (!selectedBatchId || quantity <= 0 || !reason) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const batch = batches.find(b => b.id === selectedBatchId);
        if (!batch) return;

        if (adjustmentType === 'subtract' && quantity > batch.current_quantity) {
            toast.error("Adjustment quantity cannot exceed current batch quantity.");
            return;
        }

        try {
            setSaving(true);
            const finalQtyChange = adjustmentType === 'add' ? quantity : -quantity;
            const newBatchQty = batch.current_quantity + finalQtyChange;

            // 1. Update Inventory Batch
            const { error: batchErr } = await supabase
                .from("inventory_batches")
                .update({ current_quantity: newBatchQty })
                .eq("id", batch.id);

            if (batchErr) throw batchErr;

            // 2. Create Movement Record
            const { error: moveErr } = await supabase
                .from("inventory_movements")
                .insert([{
                    dealer_id: profile?.dealer_id,
                    product_id: batch.product_id,
                    variant_id: batch.variant_id,
                    batch_id: batch.id,
                    movement_type: adjustmentType === 'add' ? 'in' : 'out',
                    quantity_before: batch.current_quantity,
                    quantity_change: Math.abs(finalQtyChange),
                    quantity_after: newBatchQty,
                    reference_type: 'adjustment',
                    reference_number: `ADJ-${Date.now().toString().slice(-6)}`,
                    reason: `${ADJUSTMENT_REASONS.find(r => r.value === reason)?.label}: ${notes}`,
                    performed_by: profile?.id,
                    movement_date: new Date().toISOString().split('T')[0],
                    unit_cost: batch.unit_cost_price,
                    total_value: Math.abs(finalQtyChange) * batch.unit_cost_price
                }]);

            if (moveErr) throw moveErr;

            // 3. Update Product Variant Stock (RPC or manual)
            const { error: variantErr } = await supabase.rpc('increment_variant_stock', {
                p_variant_id: batch.variant_id,
                p_amount: finalQtyChange
            });

            // Fallback if RPC fails
            if (variantErr) {
                const { data: vData } = await supabase.from('product_variants').select('stock_quantity').eq('id', batch.variant_id).single();
                await supabase.from('product_variants').update({ stock_quantity: (vData?.stock_quantity || 0) + finalQtyChange }).eq('id', batch.variant_id);
            }

            toast.success("Stock adjustment completed successfully.");
            fetchBatches(); // Refresh
            // Clear form
            setSelectedBatchId("");
            setQuantity(0);
            setReason("");
            setNotes("");

        } catch (error) {
            console.error("Error adjusting stock:", error);
            toast.error("Failed to process adjustment.");
        } finally {
            setSaving(false);
        }
    };

    const filteredBatches = batches.filter(b =>
        b.product_variants.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.product_variants.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.batch_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedBatch = batches.find(b => b.id === selectedBatchId);

    if (loading) return <div className="p-20"><Skeleton className="h-96 w-full bg-white/5 rounded-3xl" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <Link href="/dealer/stock" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#D4AF37] transition-all">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Overview
                </Link>
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20">
                        <RefreshCcw className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-black tracking-tight text-[#F8F8F8]">Stock Adjustment</h1>
                        <p className="text-sm text-white/40 mt-1 uppercase tracking-widest font-bold">Manual Inventory Recon & Correction</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Left: Adjustment Form */}
                <div className="lg:col-span-3 space-y-8">
                    <GlassCard className="p-10 space-y-8">
                        {/* Batch Selection */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Target Batch</Label>
                            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                                <SelectTrigger className="h-14 bg-white/5 border-white/5 text-[11px] font-black uppercase tracking-widest rounded-xl focus:border-[#D4AF37]/50 transition-all">
                                    <SelectValue placeholder="SELECT INVENTORY BATCH..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0D0D0F] border-white/10 text-white">
                                    <div className="p-2 border-b border-white/5 mb-2">
                                        <Input
                                            placeholder="FILTER BATCHES..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="h-8 text-[9px] bg-white/5 border-none"
                                        />
                                    </div>
                                    {filteredBatches.map(b => (
                                        <SelectItem key={b.id} value={b.id} className="text-[10px] uppercase font-bold py-3 hover:bg-[#D4AF37]/10 focus:bg-[#D4AF37]/10 cursor-pointer">
                                            {b.product_variants.products.name} - {b.batch_number} ({b.current_quantity} in stock)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Adjustment Parameters */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Correction Type</Label>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setAdjustmentType('subtract')}
                                        variant={adjustmentType === 'subtract' ? 'secondary' : 'outline'}
                                        className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/5 ${adjustmentType === 'subtract' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-white/40"}`}
                                    >
                                        Deduct (-)
                                    </Button>
                                    <Button
                                        onClick={() => setAdjustmentType('add')}
                                        variant={adjustmentType === 'add' ? 'secondary' : 'outline'}
                                        className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/5 ${adjustmentType === 'add' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-white/5 text-white/40"}`}
                                    >
                                        Augment (+)
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Quantity</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    placeholder="QTY"
                                    className="h-12 bg-white/5 border-white/5 text-sm font-black text-[#D4AF37] rounded-xl focus:border-[#D4AF37]/50"
                                />
                            </div>
                        </div>

                        {/* Reason Selection */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Protocol Reason</Label>
                            <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger className="h-14 bg-white/5 border-white/5 text-[11px] font-black uppercase tracking-widest rounded-xl">
                                    <SelectValue placeholder="SELECT REASON FOR ADJUSTMENT..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0D0D0F] border-white/10 text-white">
                                    {ADJUSTMENT_REASONS.map(r => (
                                        <SelectItem key={r.value} value={r.value} className="text-[10px] uppercase font-bold py-3">
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/20">Operational Notes</Label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="PROVIDE CONTEXT FOR THIS AUDIT CORRECTION..."
                                className="w-full h-32 bg-white/5 border border-white/5 rounded-xl p-4 text-xs font-medium text-white/60 focus:outline-none focus:border-[#D4AF37]/50 transition-all resize-none"
                            />
                        </div>

                        <Button
                            onClick={handleAdjust}
                            disabled={saving}
                            className="w-full h-16 bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-[0_12px_30px_rgba(212,175,55,0.2)]"
                        >
                            {saving ? "EXECUTING RECONCILIATION..." : "COMMIT ADJUSTMENT"}
                            <Save className="w-4 h-4 ml-3" />
                        </Button>
                    </GlassCard>
                </div>

                {/* Right: Summary & Context */}
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="p-8 space-y-6">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black uppercase tracking-widest text-[#F8F8F8]">Recon Intelligence</h2>
                                <p className="text-[9px] font-bold text-white/20 uppercase">Data Validation</p>
                            </div>
                        </div>

                        {selectedBatch ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="p-6 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">Current State</p>
                                        <p className="text-xl font-display font-black text-[#F8F8F8]">{selectedBatch.current_quantity} Units</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-white/40">
                                        <ChevronRight className="w-4 h-4" />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest">Adjusted State</p>
                                            <p className="text-xl font-display font-black text-[#D4AF37]">
                                                {adjustmentType === 'add' ? (selectedBatch.current_quantity + quantity) : (selectedBatch.current_quantity - quantity)} Units
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-white/20 uppercase tracking-widest">Unit Cost</span>
                                        <span className="text-white/60">৳{selectedBatch.unit_cost_price}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-white/20 uppercase tracking-widest">Adjustment Value</span>
                                        <span className="text-red-500">৳{(quantity * selectedBatch.unit_cost_price).toLocaleString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-10 text-center space-y-4 opacity-30">
                                <Package className="w-10 h-10 mx-auto" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Select a batch to see audit metrics</p>
                            </div>
                        )}
                    </GlassCard>

                    <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                        <div className="flex items-center gap-3 text-amber-500">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Audit Policy</span>
                        </div>
                        <p className="text-[11px] font-medium text-amber-500/70 leading-relaxed">
                            Manual adjustments are tracked as separate inventory movements. Ensure you provide accurate notes for financial reconciliation and audit history.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
