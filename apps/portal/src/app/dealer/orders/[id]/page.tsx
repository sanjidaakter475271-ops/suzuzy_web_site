"use client";

import { useEffect, useState, use } from "react";
import {
    ChevronLeft,
    Printer,
    Truck,
    Package,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
    MapPin,
    Phone,
    Mail,
    Calendar,
    ArrowRight,
    Hash
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface OrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
        name: string;
        sku: string;
        product_images: {
            image_url: string;
        }[];
    };
}

interface SubOrder {
    id: string;
    created_at: string;
    status: string;
    dealer_amount: number;
    subtotal: number;
    shipping_cost: number;
    commission_amount: number;
    tracking_number: string;
    orders: {
        order_number: string;
        shipping_name: string;
        shipping_phone: string;
        shipping_address: string;
        created_at: string;
    };
}

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { profile } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [order, setOrder] = useState<SubOrder | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [trackingNumber, setTrackingNumber] = useState("");

    const fetchOrderDetail = async () => {
        try {
            const [orderRes, itemsRes] = await Promise.all([
                supabase
                    .from('sub_orders')
                    .select(`
                        *,
                        orders:order_id (
                            order_number,
                            shipping_name,
                            shipping_phone,
                            shipping_address,
                            created_at
                        )
                    `)
                    .eq('id', id)
                    .single(),
                supabase
                    .from('order_items')
                    .select(`
                        *,
                        products:product_id (
                            name,
                            sku,
                            product_images (
                                image_url
                            )
                        )
                    `)
                    .eq('sub_order_id', id)
            ]);

            if (orderRes.error) throw orderRes.error;
            setOrder(orderRes.data as unknown as SubOrder);
            setItems((itemsRes.data as unknown as OrderItem[]) || []);
            setTrackingNumber(orderRes.data.tracking_number || "");
        } catch (error) {
            console.error("Fetch failed:", error);
            toast.error("Failed to retrieve fulfillment data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const updates: Partial<SubOrder> & { shipped_at?: string; delivered_at?: string } = { status: newStatus };
            if (newStatus === 'shipped') {
                updates.shipped_at = new Date().toISOString();
                updates.tracking_number = trackingNumber;
            }
            if (newStatus === 'delivered') {
                updates.delivered_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('sub_orders')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            toast.success(`Protocol transitioned to ${newStatus.toUpperCase()}`);
            fetchOrderDetail();
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Status transition failed");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full min-h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20 italic">Loading Logistics Dossier...</p>
            </div>
        );
    }

    if (!order) return null;

    const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentStatusIndex + 1];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 selection:bg-[#D4AF37] selection:text-[#0D0D0F]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <Link href="/dealer/orders">
                        <Button variant="ghost" size="icon" className="h-12 w-12 border border-white/5 bg-white/[0.02] hover:bg-white/5 text-white/40 hover:text-white rounded-xl">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-[#D4AF37]/60">
                            <Hash className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Fulfillment Dossier</span>
                        </div>
                        <h1 className="text-4xl font-display font-black text-white italic tracking-tighter">
                            ORDER <MetallicText>#{order.orders?.order_number}</MetallicText>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 border-white/10 bg-white/[0.02] hover:bg-white/5 text-white/40 hover:text-white transition-all rounded-xl uppercase text-[10px] font-black tracking-widest">
                        <Printer className="w-4 h-4 mr-2" /> Manifest
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Items & Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items GlassCard */}
                    <GlassCard className="border-[#D4AF37]/5 bg-[#0D0D0F]/40 overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] font-display italic">Committed Assets ({items.length})</h3>
                        </div>
                        <div className="p-8 space-y-8">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-6 group">
                                    <div className="h-24 w-24 rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden flex-shrink-0 group-hover:border-[#D4AF37]/20 transition-all">
                                        {item.products.product_images?.[0]?.image_url ? (
                                            <img
                                                src={item.products.product_images[0].image_url}
                                                alt={item.products.name}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/20 italic font-black text-[10px] uppercase">
                                                No Asset
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-white tracking-tight group-hover:text-[#D4AF37] transition-colors">{item.products.name}</h4>
                                            <span className="font-display font-black text-[#D4AF37] italic tracking-tighter">{formatCurrency(item.total_price)}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase">{item.products.sku}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                            <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Financial Ledger */}
                    <GlassCard className="overflow-hidden border-[#D4AF37]/10 bg-[#0D0D0F]/60">
                        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] font-display italic">Financial Ledger</h3>
                            <Badge variant="outline" className="bg-[#D4AF37]/5 border-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-black uppercase italic tracking-widest px-3 py-1">
                                Verified Protocol
                            </Badge>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center text-white/40">
                                    <span className="text-[10px] uppercase font-black tracking-widest">Gross Revenue</span>
                                    <span className="text-sm font-bold font-mono text-white/80">{formatCurrency(order.subtotal + order.shipping_cost)}</span>
                                </div>
                                <div className="flex justify-between items-center text-white/40">
                                    <span className="text-[10px] uppercase font-black tracking-widest">Platform Commission</span>
                                    <span className="text-sm font-bold font-mono text-red-500/60">- {formatCurrency(order.commission_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-white/40">
                                    <span className="text-[10px] uppercase font-black tracking-widest">Service Protocol Fee</span>
                                    <span className="text-sm font-bold font-mono text-red-500/60">- {formatCurrency(0)}</span>
                                </div>
                                <div className="h-[1px] bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">Net Settlement</span>
                                    <span className="text-2xl font-display font-black text-[#D4AF37] italic tracking-tighter">
                                        <MetallicText>{formatCurrency(order.dealer_amount)}</MetallicText>
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center text-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] mx-auto shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Settlement Ready</p>
                                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-tighter mt-1 italic leading-relaxed">
                                        Funds will be disbursed to your registered banking protocol upon final delivery confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Timeline / Status */}
                    <GlassCard className="p-8 border-[#D4AF37]/10 bg-[#0D0D0F]/40 font-display">
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <Clock className="w-4 h-4 text-[#D4AF37]" /> PROTOCOL PROGRESSION
                        </h3>
                        <div className="grid grid-cols-5 gap-4">
                            {STATUS_FLOW.map((step, idx) => {
                                const isCompleted = idx <= currentStatusIndex;
                                const isCurrent = idx === currentStatusIndex;
                                return (
                                    <div key={step} className="flex flex-col items-center gap-3">
                                        <div className={`w-full h-1.5 rounded-full transition-all duration-1000 ${isCompleted ? 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-white/5'
                                            }`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isCurrent ? 'text-[#D4AF37]' : isCompleted ? 'text-white/60' : 'text-white/10'
                                            }`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: Decisions & Customer */}
                <div className="space-y-8">
                    {/* Control Panel */}
                    <GlassCard className="p-8 border-[#D4AF37]/10 bg-[#0D0D0F]/60">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-6 italic">DECISION TERMINAL</h3>

                        {(order.status === 'processing' || order.status === 'shipped') && (
                            <div className="mb-6 space-y-3">
                                <label className="text-[9px] font-black text-[#D4AF37]/60 uppercase tracking-widest ml-1">LOGISTICS TRACKING ID</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter Tracking Number..."
                                        className="h-12 bg-white/[0.03] border-white/10 rounded-xl font-mono text-white/80 focus:border-[#D4AF37]/50"
                                    />
                                    {order.status === 'shipped' && (
                                        <Button
                                            onClick={() => updateStatus('shipped')}
                                            disabled={updating}
                                            className="h-12 px-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/20 rounded-xl"
                                        >
                                            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {nextStatus ? (
                                <GradientButton
                                    disabled={updating || (nextStatus === 'shipped' && !trackingNumber)}
                                    onClick={() => updateStatus(nextStatus)}
                                    className="w-full h-14 text-[11px] font-black uppercase tracking-widest italic shadow-[0_10px_30px_rgba(212,175,55,0.15)]"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                                    Transition to {nextStatus}
                                </GradientButton>
                            ) : (
                                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">FULFILLMENT REACHED OPTIMUM</span>
                                </div>
                            )}

                            {order.status === 'pending' && (
                                <Button
                                    variant="ghost"
                                    onClick={() => updateStatus('cancelled')}
                                    className="w-full h-12 border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> REJECT PROTOCOL
                                </Button>
                            )}
                        </div>
                    </GlassCard>

                    {/* Customer Intelligence */}
                    <GlassCard className="p-8 border-white/5 bg-[#0D0D0F]/40 space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-6 italic">CLIENT INTELLIGENCE</h3>
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center font-display font-black text-xl italic text-[#D4AF37] shadow-inner">
                                    {order.orders?.shipping_name?.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-bold text-white text-lg tracking-tight">{order.orders?.shipping_name}</p>
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Asset Consignee</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex items-start gap-4">
                                <Phone className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Secure Line</span>
                                    <span className="text-sm text-white/80 font-mono italic">{order.orders?.shipping_phone}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Consignment Destination</span>
                                    <span className="text-sm text-white/80 leading-relaxed italic">{order.orders?.shipping_address}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Calendar className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Registry Recorded</span>
                                    <span className="text-sm text-white/80 italic">{format(new Date(order.orders?.created_at || new Date()), 'MMMM dd, yyyy - HH:mm')}</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div >
    );
}
