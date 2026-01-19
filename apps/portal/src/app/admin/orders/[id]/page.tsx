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
    Hash,
    Building2,
    DollarSign
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
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
    status: string;
    dealer_amount: number;
    commission_amount: number;
    tracking_number: string;
    dealers: {
        business_name: string;
    };
    order_items: OrderItem[];
}

interface GlobalOrder {
    id: string;
    order_number: string;
    grand_total: number;
    subtotal: number;
    shipping_cost: number;
    payment_status: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    created_at: string;
    sub_orders: SubOrder[];
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<GlobalOrder | null>(null);

    const fetchOrderDetail = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    sub_orders (
                        id,
                        status,
                        dealer_amount,
                        commission_amount,
                        tracking_number,
                        dealers (
                            business_name
                        ),
                        order_items (
                            *,
                            products:product_id (
                                name,
                                sku,
                                product_images (
                                    image_url
                                )
                            )
                        )
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setOrder(data as unknown as GlobalOrder);
        } catch (error) {
            console.error("Fetch failed:", error);
            toast.error("Global Order Dossier inaccessible");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="h-full w-full min-h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-[10px] uppercase font-black tracking-widest text-white/20 italic">Decrypting Global Logistics...</p>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 selection:bg-[#D4AF37] selection:text-[#0D0D0F]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="icon" className="h-12 w-12 border border-white/5 bg-white/[0.02] hover:bg-white/5 text-white/40 hover:text-white rounded-xl">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-[#D4AF37]/60">
                            <Hash className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Global Fulfillment Dossier</span>
                        </div>
                        <h1 className="text-4xl font-display font-black text-white italic tracking-tighter">
                            PROTOCOL <MetallicText>#{order.order_number}</MetallicText>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 border-white/10 bg-white/[0.02] hover:bg-white/5 text-white/40 hover:text-white transition-all rounded-xl uppercase text-[10px] font-black tracking-widest">
                        <Printer className="w-4 h-4 mr-2" /> Export JSON
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Multi-Dealer Fulfillment */}
                <div className="lg:col-span-2 space-y-8">
                    {order.sub_orders.map((subOrder) => (
                        <GlassCard key={subOrder.id} className="border-[#D4AF37]/10 bg-[#0D0D0F]/40 overflow-hidden">
                            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] font-display italic">Fulfillment Line: {subOrder.dealers.business_name}</h3>
                                        <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest mt-1">Entity Reference: {subOrder.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${subOrder.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        subOrder.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20'
                                    }`}>
                                    {subOrder.status}
                                </Badge>
                            </div>
                            <div className="p-8 space-y-6">
                                {subOrder.order_items.map((item) => (
                                    <div key={item.id} className="flex gap-6 group">
                                        <div className="h-20 w-20 rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden flex-shrink-0 group-hover:border-[#D4AF37]/20 transition-all">
                                            <img
                                                src={item.products.product_images?.[0]?.image_url}
                                                alt={item.products.name}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-white text-sm tracking-tight group-hover:text-[#D4AF37] transition-colors">{item.products.name}</h4>
                                                <span className="font-display font-black text-[#D4AF37] italic tracking-tighter text-sm">{formatCurrency(item.total_price)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase">{item.products.sku}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                                <span className="text-[9px] text-white/50 font-black uppercase tracking-widest">Quantity: {item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between items-center py-4 border-t border-white/5 mt-4">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Truck className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Tracking: {subOrder.tracking_number || "AWAITING LOGISTICS DATA"}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[9px] text-white/20 uppercase font-black">Dealer Share</p>
                                            <p className="text-sm font-mono font-bold text-white/80">{formatCurrency(subOrder.dealer_amount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-[#D4AF37]/40 uppercase font-black tracking-tighter">Treasury Comm.</p>
                                            <p className="text-sm font-mono font-bold text-[#D4AF37]">{formatCurrency(subOrder.commission_amount)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Right Column: Global Summary & Intelligence */}
                <div className="space-y-8">
                    {/* Financial Consolidation */}
                    <GlassCard className="p-8 border-[#D4AF37]/10 bg-[#0D0D0F]/60">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 italic">TREASURY CONSOLIDATION</h3>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Gross Liquidity</span>
                                <span className="text-lg font-mono font-bold text-white/80">{formatCurrency(order.grand_total)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]/60">Platform Commission</span>
                                <span className="text-lg font-mono font-bold text-[#D4AF37]">
                                    {formatCurrency(order.sub_orders.reduce((acc, curr) => acc + Number(curr.commission_amount), 0))}
                                </span>
                            </div>
                            <div className="h-[1px] bg-white/5" />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Disbursement Queue</span>
                                <span className="text-lg font-mono font-bold text-white/60">
                                    {formatCurrency(order.sub_orders.reduce((acc, curr) => acc + Number(curr.dealer_amount), 0))}
                                </span>
                            </div>
                        </div>

                        <div className="mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Status</span>
                                <Badge variant="outline" className={`${order.payment_status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'} text-[9px] uppercase font-black`}>
                                    {order.payment_status}
                                </Badge>
                            </div>
                            <p className="text-[9px] text-white/20 font-medium uppercase leading-relaxed italic">
                                Treasury verification complete. Payouts scheduled for next disbursement cycle upon fulfillment validation.
                            </p>
                        </div>
                    </GlassCard>

                    {/* Consignee Dossier */}
                    <GlassCard className="p-8 border-white/5 bg-[#0D0D0F]/40 space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-6 italic">CONSIGNEE INTELLIGENCE</h3>
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center font-display font-black text-xl italic text-[#D4AF37] shadow-inner">
                                    {order.shipping_name?.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-bold text-white text-lg tracking-tight">{order.shipping_name}</p>
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic tracking-tighter mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Authorized Receiver</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex items-start gap-4">
                                <Phone className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Encrypted Line</span>
                                    <span className="text-sm text-white/80 font-mono italic">{order.shipping_phone}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Delivery Vector</span>
                                    <span className="text-sm text-white/80 leading-relaxed italic">{order.shipping_address}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Calendar className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Registry Record</span>
                                    <span className="text-sm text-white/80 italic">{format(new Date(order.created_at || new Date()), 'MMMM dd, yyyy - HH:mm')}</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
