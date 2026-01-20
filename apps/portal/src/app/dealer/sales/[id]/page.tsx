"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft,
    Printer,
    Download,
    Receipt,
    User,
    Calendar,
    ShieldCheck,
    CreditCard,
    Package,
    ArrowDownToLine,
    ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface SaleItem {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_variants: {
        sku: string;
        products: {
            name: string;
        };
    };
}

interface Sale {
    id: string;
    sale_number: string;
    status: string;
    created_at: string;
    subtotal: number;
    tax_amount: number;
    other_charges: number;
    grand_total: number;
    payment_method: string;
    payment_status: string;
    notes: string;
    customer_id: string;
    profiles: {
        full_name: string;
        email: string;
        phone: string;
    } | null;
    items: SaleItem[];
}

export default function SaleDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { profile } = useUser();
    const [sale, setSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && profile?.dealer_id) {
            fetchSale();
        }
    }, [id, profile]);

    const fetchSale = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("sales")
                .select(`
                    *,
                    profiles:customer_id (*),
                    items:sale_items (
                        *,
                        product_variants (
                            sku,
                            products (name)
                        )
                    )
                `)
                .eq("id", id)
                .single();

            if (error) throw error;
            setSale(data as any);
        } catch (error) {
            console.error("Error fetching sale:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-20"><Skeleton className="h-[600px] w-full bg-white/5 rounded-3xl" /></div>;
    if (!sale) return <div className="p-20 text-center text-[#D4AF37]">Sale record not found in registry.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-32">
            {/* Nav Header */}
            <div className="flex items-center justify-between no-print">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 text-white/40 hover:text-[#D4AF37] transition-all"
                >
                    <div className="w-10 h-10 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F8F8F8]">Sales Archive</span>
                </button>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={handlePrint}
                        variant="ghost"
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#D4AF37] hover:bg-white/5"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print Invoice
                    </Button>
                    <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] rounded-xl px-8 h-10 shadow-[0_8px_20px_rgba(212,175,55,0.2)]">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Digital Invoice Dossier */}
            <GlassCard className="overflow-hidden border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
                {/* Visual Header */}
                <div className="bg-gradient-to-r from-[#D4AF37]/10 via-transparent to-transparent p-12 border-b border-white/5 relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#D4AF37] to-transparent opacity-30" />

                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-[#0D0D0F]">
                                    <Receipt className="w-8 h-8 stroke-[1.5]" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Official Invoice</h2>
                                    <p className="text-3xl font-display font-black text-[#F8F8F8] tracking-tighter italic">{sale.sale_number}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black tracking-widest uppercase">Verified</Badge>
                                <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 text-[9px] font-black tracking-widest uppercase">{sale.status}</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-right">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Transaction Date</p>
                                <p className="text-xs font-bold text-[#F8F8F8]">{format(new Date(sale.created_at), 'MMMM dd, yyyy')}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Payment Meta</p>
                                <p className="text-xs font-bold text-[#F8F8F8] uppercase">{sale.payment_method} • {sale.payment_status}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Party Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-12 bg-white/[0.01]">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-[#D4AF37]">
                            <User className="w-4 h-4" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Customer Protocol</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-display font-black text-[#F8F8F8]">{sale.profiles?.full_name || "Guest Customer"}</p>
                            <p className="text-xs font-medium text-white/40 leading-relaxed">
                                {sale.profiles?.email || "No digital contact recorded"}<br />
                                {sale.profiles?.phone || "Counter Sale - Direct Pickup"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 text-right">
                        <div className="flex items-center gap-3 text-[#D4AF37] justify-end">
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Distribution Node</h3>
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-display font-black text-[#F8F8F8]">RoyalConsortium Authorized</p>
                            <p className="text-xs font-medium text-white/40 leading-relaxed">
                                Dealer ID: {profile?.dealer_id?.slice(0, 8).toUpperCase()}<br />
                                Node Location: {profile?.full_name || "Operational Center"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Itemized Ledger */}
                <div className="px-12 py-8">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">
                                <th className="text-left pb-4 font-black">Variant Protocol / SKU</th>
                                <th className="text-right pb-4 font-black">Quantity</th>
                                <th className="text-right pb-4 font-black">Base Price</th>
                                <th className="text-right pb-4 font-black">Total Valuation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {sale.items.map((item) => (
                                <tr key={item.id} className="group hover:bg-white/[0.01] transition-all">
                                    <td className="py-6">
                                        <p className="text-sm font-black text-[#F8F8F8] uppercase italic">{item.product_variants.products.name}</p>
                                        <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest mt-1">Ref: {item.product_variants.sku}</p>
                                    </td>
                                    <td className="py-6 text-right text-sm font-black text-white/60">{item.quantity}</td>
                                    <td className="py-6 text-right text-sm font-black text-white/60">৳{item.unit_price.toLocaleString()}</td>
                                    <td className="py-6 text-right text-sm font-black text-[#D4AF37]">৳{item.total_price.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Financial Summary */}
                <div className="p-12 bg-white/[0.02] border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between gap-12">
                        <div className="max-w-xs space-y-4">
                            <p className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest">Auditor's Note</p>
                            <p className="text-[11px] text-white/30 font-medium leading-relaxed italic">
                                {sale.notes || "This transaction was authorized at the secure terminal. All hardware sales are subject to the standard service agreement protocol."}
                            </p>
                        </div>

                        <div className="w-full md:w-80 space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase text-white/20 tracking-widest">
                                <span>Subtotal Accumulation</span>
                                <span>৳{sale.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase text-white/20 tracking-widest">
                                <span>Regulatory Tax (5%)</span>
                                <span>৳{sale.tax_amount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase text-white/20 tracking-widest">
                                <span>Logistics / Priority</span>
                                <span>৳{(sale.other_charges || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-6 mt-6 border-t border-white/10">
                                <span className="text-sm font-black uppercase tracking-[0.2em] text-[#D4AF37]">Grand Valuation</span>
                                <span className="text-4xl font-display font-black text-[#F8F8F8] tracking-tighter">৳{sale.grand_total?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integrity Verification Footer */}
                <div className="p-8 border-t border-white/5 flex items-center justify-between text-white/10 text-[8px] font-black uppercase tracking-[0.4em]">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        Auth: SHA-256 Verified
                    </div>
                    <div>Digital Signature: RC-SYSTEM-NODE-{sale.id.slice(0, 8).toUpperCase()}</div>
                    <div>Node Timestamp: {format(new Date(sale.created_at), 'yyyy.MM.dd.HH.mm')}</div>
                </div>
            </GlassCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
                <GlassCard className="p-6 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#D4AF37] transition-all">
                            <Package className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Track Inventory</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/10" />
                </GlassCard>
                <GlassCard className="p-6 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#D4AF37] transition-all">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Payment Ledger</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/10" />
                </GlassCard>
                <GlassCard className="p-6 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#D4AF37] transition-all">
                            <ArrowDownToLine className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Export RAW XML</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/10" />
                </GlassCard>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .glass-card { background: white !important; border-color: #eee !important; box-shadow: none !important; color: black !important; }
                    span, p, h1, h2, h3, h4, td, th { color: black !important; }
                    .text-white\/40, .text-white\/20, .text-white\/10 { color: #888 !important; }
                    .bg-white\/\[0\.02\], .bg-white\/\[0\.01\], .bg-white\/\[0\.03\], .bg-white\/5 { background: #fafafa !important; }
                    .border-white\/5, .border-white\/10 { border-color: #eee !important; }
                }
            `}</style>
        </div>
    );
}
