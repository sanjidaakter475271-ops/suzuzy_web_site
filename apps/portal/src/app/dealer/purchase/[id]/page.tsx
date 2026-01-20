"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft,
    ShoppingBag,
    Truck,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileText,
    ArrowDownToLine,
    ShieldCheck,
    Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface POItem {
    id: string;
    product_id: string;
    variant_id: string;
    ordered_quantity: number;
    received_quantity: number;
    unit_cost_price: number;
    total_cost: number;
    product_variants: {
        sku: string;
        product_id: string;
        products: {
            name: string;
        };
    };
}

interface PurchaseOrder {
    id: string;
    po_number: string;
    status: string;
    order_date: string;
    expected_delivery_date: string;
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    grand_total: number;
    notes: string;
    vendors: {
        id: string;
        name: string;
        code: string;
        payment_terms: string;
    };
    items: POItem[];
}

export default function PODetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { profile } = useUser();
    const [po, setPO] = useState<PurchaseOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [receiving, setReceiving] = useState(false);
    const [receiveForm, setReceiveForm] = useState<{ [key: string]: { qty: number, batch: string } }>({});

    useEffect(() => {
        if (id && profile?.dealer_id) {
            fetchPO();
        }
    }, [id, profile]);

    const fetchPO = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("purchase_orders")
                .select(`
                    *,
                    vendors (*),
                    items:purchase_order_items (
                        *,
                        product_variants (
                            sku,
                            product_id,
                            products (name)
                        )
                    )
                `)
                .eq("id", id)
                .single();

            if (error) throw error;
            setPO(data as any);

            // Initialize receive form
            const initialForm: any = {};
            data.items.forEach((item: any) => {
                initialForm[item.id] = {
                    qty: item.ordered_quantity - (item.received_quantity || 0),
                    batch: `B-${format(new Date(), 'yyyyMMdd')}-${item.id.slice(0, 4).toUpperCase()}`
                };
            });
            setReceiveForm(initialForm);

        } catch (error) {
            console.error("Error fetching PO:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async () => {
        if (!po || !profile?.dealer_id) return;

        try {
            setReceiving(true);

            // For each item with qty > 0, create batch and movement
            for (const item of po.items) {
                const grnData = receiveForm[item.id];
                if (grnData.qty <= 0) continue;

                // 1. Create Batch
                const { data: batch, error: batchErr } = await supabase
                    .from("inventory_batches")
                    .insert([{
                        dealer_id: profile.dealer_id,
                        vendor_id: po.vendors.id,
                        product_id: item.product_variants.product_id,
                        variant_id: item.variant_id,
                        purchase_order_id: po.id,
                        purchase_order_item_id: item.id,
                        batch_number: grnData.batch,
                        initial_quantity: grnData.qty,
                        current_quantity: grnData.qty,
                        unit_cost_price: item.unit_cost_price,
                        received_date: new Date().toISOString().split('T')[0]
                    }])
                    .select()
                    .single();

                if (batchErr) throw batchErr;

                // 2. Create Movement
                const { error: moveErr } = await supabase
                    .from("inventory_movements")
                    .insert([{
                        dealer_id: profile.dealer_id,
                        product_id: item.product_variants.product_id,
                        variant_id: item.variant_id,
                        batch_id: batch.id,
                        movement_type: 'in',
                        quantity_before: 0, // Simplified for now
                        quantity_change: grnData.qty,
                        quantity_after: grnData.qty,
                        reference_type: 'purchase_order',
                        reference_id: po.id,
                        reference_number: po.po_number,
                        unit_cost: item.unit_cost_price,
                        total_value: grnData.qty * item.unit_cost_price,
                        performed_by: profile.id,
                        movement_date: new Date().toISOString().split('T')[0],
                        reason: 'Purchase Order Receipt'
                    }]);

                if (moveErr) throw moveErr;

                // 3. Update PO Item received count
                const { error: updErr } = await supabase
                    .rpc('increment_po_item_received', {
                        item_id: item.id,
                        inc_qty: grnData.qty
                    });

                // If RPC doesn't exist yet, we'll need to do it manually. 
                // Since I can't create RPCs easily without DDL permission checks, 
                // let's use a standard update for now.
                if (updErr) {
                    await supabase
                        .from('purchase_order_items')
                        .update({ received_quantity: (item.received_quantity || 0) + grnData.qty })
                        .eq('id', item.id);
                }
            }

            // 4. Update PO Status
            const allReceived = po.items.every(item => {
                const newlyReceived = receiveForm[item.id].qty;
                return (item.received_quantity || 0) + newlyReceived >= item.ordered_quantity;
            });

            await supabase
                .from("purchase_orders")
                .update({ status: allReceived ? 'received' : 'partial' })
                .eq("id", po.id);

            alert("Goods received successfully and inventory updated.");
            fetchPO();
        } catch (error) {
            console.error("Error receiving goods:", error);
            alert("Partial processing error. Check inventory.");
        } finally {
            setReceiving(false);
        }
    };

    if (loading) return <div className="p-20"><Skeleton className="h-96 w-full bg-white/5 rounded-3xl" /></div>;
    if (!po) return <div className="p-20 text-center">Procurement file not found.</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-32">
            {/* Nav Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 text-white/40 hover:text-[#D4AF37] transition-all"
                >
                    <div className="w-10 h-10 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F8F8F8]">Supply Chain Log</span>
                </button>

                <div className="flex items-center gap-4">
                    <Button variant="outline" className="border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest rounded-xl px-6 h-10 hover:bg-white/10">
                        <FileText className="w-3.5 h-3.5 mr-2" />
                        Print Order
                    </Button>
                    {po.status !== 'received' && (
                        <Button
                            onClick={handleReceive}
                            disabled={receiving}
                            className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] rounded-xl px-8 h-10 shadow-[0_8px_20px_rgba(212,175,55,0.2)]"
                        >
                            <ArrowDownToLine className="w-3.5 h-3.5 mr-2 stroke-[3]" />
                            {receiving ? "Storing..." : "Confirm GRN / Receipt"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Quick Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Document ID</p>
                        <p className="text-sm font-black text-[#F8F8F8] tracking-widest">{po.po_number}</p>
                    </div>
                </GlassCard>
                <GlassCard className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Partner Source</p>
                        <p className="text-sm font-black text-[#F8F8F8] truncate">{po.vendors.name}</p>
                    </div>
                </GlassCard>
                <GlassCard className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Valuation</p>
                        <p className="text-sm font-black text-[#F8F8F8]">৳{po.grand_total.toLocaleString()}</p>
                    </div>
                </GlassCard>
                <GlassCard className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37]">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Status Hub</p>
                        <Badge variant="outline" className="bg-[#D4AF37]/5 text-[#D4AF37] border-[#D4AF37]/20 text-[9px] font-black tracking-widest uppercase">
                            {po.status}
                        </Badge>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Goods Receiving Ledger */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-3">
                        <Package className="w-4 h-4" />
                        Procurement Line Items
                    </h3>

                    <div className="space-y-4">
                        {po.items.map((item) => {
                            const remaining = item.ordered_quantity - (item.received_quantity || 0);
                            return (
                                <GlassCard key={item.id} className="p-6 relative overflow-hidden group">
                                    <div className="flex items-center justify-between gap-8 mb-6">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-[#F8F8F8]">{item.product_variants.products.name}</h4>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{item.product_variants.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Ordered</p>
                                            <p className="text-xl font-display font-black text-[#F8F8F8]">{item.ordered_quantity} Units</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]/60">Stocked / Received</Label>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 px-4 bg-white/5 rounded-xl flex items-center text-xs font-black text-white/40 border border-white/5">
                                                    {item.received_quantity || 0}
                                                </div>
                                                <div className="text-[10px] font-bold text-white/20 uppercase">+ New Intake →</div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 opacity-100 group-hover:opacity-100 transition-opacity">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-white/20">Receiving Qty</Label>
                                            <Input
                                                type="number"
                                                max={remaining}
                                                placeholder={`Max ${remaining}`}
                                                value={receiveForm[item.id]?.qty || 0}
                                                onChange={(e) => setReceiveForm({ ...receiveForm, [item.id]: { ...receiveForm[item.id], qty: Number(e.target.value) } })}
                                                className="h-10 bg-[#D4AF37]/5 border-[#D4AF37]/20 text-center font-black text-[#D4AF37]"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-white/20">Batch Identifier</Label>
                                            <Input
                                                value={receiveForm[item.id]?.batch || ''}
                                                onChange={(e) => setReceiveForm({ ...receiveForm, [item.id]: { ...receiveForm[item.id], batch: e.target.value } })}
                                                className="h-10 bg-white/5 border-white/5 text-center text-[10px] font-bold uppercase tracking-widest"
                                            />
                                        </div>
                                    </div>

                                    {remaining === 0 && (
                                        <div className="absolute inset-0 bg-[#0D0D0F]/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                                            <div className="flex items-center gap-3 bg-green-500/20 text-green-500 border border-green-500/30 px-6 py-2 rounded-full">
                                                <ShieldCheck className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Fully Archived</span>
                                            </div>
                                        </div>
                                    )}
                                </GlassCard>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Metadata & Notes */}
                <div className="space-y-8">
                    <GlassCard className="p-8 space-y-8">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                                <AlertTriangle className="w-5 h-5 stroke-[1.5]" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black uppercase tracking-widest text-[#F8F8F8]">Safety Protocol</h2>
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Inventory Reconciliation</p>
                            </div>
                        </div>

                        <p className="text-[11px] text-[#A1A1AA] font-bold leading-relaxed">
                            Ensure all physical batch numbers match the stickers provided by the vendor. Discrepancies should be logged immediately in the notes section before finalizing receipt.
                        </p>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Payment Archetype</span>
                                <Badge className="bg-white/5 text-white/60 border-none">{po.vendors?.payment_terms === 'cash' ? 'IMMEDIATE CASH' : 'CREDIT LEDGER'}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-white/40">
                                <span className="uppercase tracking-tighter">Scheduled Arrival</span>
                                <span>{po.expected_delivery_date ? format(new Date(po.expected_delivery_date), 'MMM dd, yyyy') : 'NOT DEFINED'}</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8 space-y-4 bg-[#D4AF37]/5 border-[#D4AF37]/20">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Operational Notes</p>
                        <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                            "{po.notes || "No specific briefing recorded for this procurement cycle."}"
                        </p>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
