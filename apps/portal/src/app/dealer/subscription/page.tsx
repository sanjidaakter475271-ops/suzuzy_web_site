"use client";

import { useEffect, useState } from "react";
import {
    Zap,
    Check,
    ShieldCheck,
    CreditCard,
    BarChart3,
    Package,
    Users,
    Loader2,
    Calendar,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface SubscriptionInfo {
    status: string;
    billing_cycle: string;
    starts_at: string;
    ends_at: string;
    plans: {
        name: string;
        price: number;
    };
}

interface DealerSubscriptionCache {
    max_products: number;
    max_users: number;
    max_images_per_product: number;
    subscription_status: string;
}

export default function DealerSubscription() {
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [sub, setSub] = useState<SubscriptionInfo | null>(null);
    const [dealerCache, setDealerCache] = useState<DealerSubscriptionCache | null>(null);

    useEffect(() => {
        async function fetchSubData() {
            if (!profile?.dealer_id) return;

            setLoading(true);
            try {
                const [
                    { data: subData },
                    { data: dData }
                ] = await Promise.all([
                    supabase.from('subscriptions').select('*, plans(name, price)').eq('dealer_id', profile.dealer_id).eq('status', 'active').single(),
                    supabase.from('dealers').select('max_products, max_users, max_images_per_product, subscription_status').eq('id', profile.dealer_id).single()
                ]);

                if (subData) setSub((subData as unknown) as SubscriptionInfo);
                if (dData) setDealerCache(dData);

            } catch (error) {
                console.error("Error fetching subscription:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchSubData();
    }, [profile?.dealer_id]);

    if (loading) {
        return (
            <div className="h-full w-full min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        TIER <span className="text-[#D4AF37]">CONTROL</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                        Subscription Management & Feature Access
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Plan Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-[2.5rem] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform duration-700 group-hover:scale-[1.7]">
                            <Zap className="w-64 h-64 text-[#D4AF37]" />
                        </div>

                        <div className="relative z-10">
                            <Badge className="bg-[#D4AF37] text-[#0D0D0F] font-black uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-full mb-6">
                                Active Plan
                            </Badge>
                            <h3 className="text-6xl font-display font-black italic text-[#F8F8F8] mb-2">
                                {sub?.plans?.name || (dealerCache?.subscription_status === 'trial' ? 'FREE TRIAL' : 'BASE TIER')}
                            </h3>
                            <p className="text-[#A1A1AA] text-sm font-medium">
                                Renewing on <span className="text-[#F8F8F8] font-bold">{sub?.ends_at ? format(new Date(sub.ends_at), "MMMM d, yyyy") : 'Unknown Date'}</span>
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-[#D4AF37]/10">
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA]">Current Status</p>
                                    <div className="flex items-center gap-2 text-[#D4AF37] font-display font-bold italic text-xl">
                                        <ShieldCheck className="w-5 h-5" />
                                        {sub?.status || dealerCache?.subscription_status || 'NOT ACTIVE'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA]">Billing Cycle</p>
                                    <div className="flex items-center gap-2 text-[#F8F8F8] font-display font-bold italic text-xl uppercase">
                                        <Calendar className="w-5 h-5 text-[#D4AF37]" />
                                        {sub?.billing_cycle || 'Monthly'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA]">Monthly Investment</p>
                                    <div className="flex items-center gap-2 text-[#F8F8F8] font-display font-bold italic text-xl">
                                        <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                                        {sub?.plans?.price ? formatCurrency(sub.plans.price) : '0.00'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Access Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FeatureBox
                            icon={Package}
                            label="Product Capacity"
                            value={`${dealerCache?.max_products || 0} Assets`}
                        />
                        <FeatureBox
                            icon={Users}
                            label="Sub-Account Support"
                            value={`${dealerCache?.max_users || 0} Staff`}
                        />
                        <FeatureBox
                            icon={BarChart3}
                            label="Analytics Depth"
                            value="Professional"
                        />
                    </div>
                </div>

                {/* Side Actions */}
                <div className="space-y-6">
                    <div className="bg-[#1A1A1C] border border-white/5 rounded-[2rem] p-8 space-y-6">
                        <h4 className="text-lg font-display font-black italic text-[#F8F8F8]">Quick <span className="text-[#D4AF37]">Actions</span></h4>
                        <Button className="w-full bg-white/5 hover:bg-white/10 text-[#F8F8F8] font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl border border-white/5 justify-between px-6">
                            Upgrade Tier <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
                        </Button>
                        <Button variant="ghost" className="w-full text-[#A1A1AA] font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl hover:bg-white/5">
                            Billing History
                        </Button>
                        <Button variant="ghost" className="w-full text-red-500/50 font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl hover:bg-red-500/5">
                            Cancel Subscription
                        </Button>
                    </div>

                    <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-[2rem] p-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Enterprise Concierge</p>
                        <p className="text-xs text-[#A1A1AA] leading-relaxed mb-6 italic">
                            Need bespoke limits for your dealership? Contact our executive support for institutional accounts.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-[#F8F8F8] font-black uppercase tracking-widest text-[10px] hover:text-[#D4AF37]">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureBox({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="bg-[#0D0D0F]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 group hover:border-[#D4AF37]/20 transition-all duration-500">
            <Icon className="w-6 h-6 text-[#D4AF37] mb-6 transition-transform duration-500 group-hover:scale-110" />
            <p className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA] mb-1">{label}</p>
            <p className="text-xl font-display font-black italic text-[#F8F8F8] tracking-tight">{value}</p>
        </div>
    );
}
