"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft,
    Building2,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    History,
    Star,
    TrendingUp,
    ShieldCheck,
    Edit3,
    Package
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Vendor {
    id: string;
    name: string;
    code: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    status: 'active' | 'inactive' | 'blocked';
    is_preferred: boolean;
    current_balance: number;
    credit_limit: number;
    payment_terms: string;
    total_purchases: number;
    total_transactions: number;
    average_rating: number;
    notes: string;
}

export default function VendorDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { profile } = useUser();
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && profile?.dealer_id) {
            fetchVendor();
        }
    }, [id, profile]);

    const fetchVendor = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("vendors")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            setVendor(data);
        } catch (error) {
            console.error("Error fetching vendor:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 py-10">
                <Skeleton className="h-10 w-48 bg-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-96 md:col-span-1 bg-white/5 rounded-2xl" />
                    <Skeleton className="h-96 md:col-span-2 bg-white/5 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <ShieldCheck className="w-16 h-16 text-white/10" />
                <h2 className="text-2xl font-display font-black text-[#F8F8F8] uppercase tracking-tighter">Partner Not Found</h2>
                <Button onClick={() => router.back()} variant="ghost" className="text-[#D4AF37]">Return to Partners</Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 text-white/40 hover:text-[#D4AF37] transition-all"
                >
                    <div className="w-10 h-10 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Supply Chain Repository</span>
                </button>

                <div className="flex items-center gap-4">
                    <Button variant="outline" className="border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest rounded-xl px-6 h-10 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all">
                        Archive Partner
                    </Button>
                    <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] rounded-xl px-8 h-10 shadow-[0_8px_20px_rgba(212,175,55,0.2)]">
                        <Edit3 className="w-3.5 h-3.5 mr-2" />
                        Modify Dossier
                    </Button>
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Essential Info */}
                <GlassCard className="lg:col-span-1 p-8 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 blur-3xl -mr-20 -mt-20 rounded-full" />

                    <div className="relative space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-[#D4AF37]/5 text-[#D4AF37] border-[#D4AF37]/20 text-[9px] font-black tracking-widest">
                                    {vendor.code || 'UNCODED'}
                                </Badge>
                                <Badge className={`${vendor.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} border-none text-[8px] font-black tracking-widest uppercase`}>
                                    {vendor.status}
                                </Badge>
                            </div>
                            <h1 className="text-4xl font-display font-black text-[#F8F8F8] tracking-tighter italic leading-none">
                                {vendor.name}
                            </h1>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37]">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Corporate Entity</p>
                                    <p className="text-xs font-bold text-[#F8F8F8]">{vendor.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37]">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Communication Channel</p>
                                    <p className="text-xs font-bold text-[#F8F8F8]">{vendor.phone || 'Connection Unavailable'}</p>
                                    <p className="text-[10px] text-white/40">{vendor.email || 'No email registered'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#D4AF37]">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Global Positioning</p>
                                    <p className="text-xs font-bold text-[#F8F8F8] leading-relaxed">{vendor.address || 'Location coordinates missing'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 space-y-4">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-[#D4AF37]/20 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Partner Reliability</p>
                                    <Star className="w-3 h-3 text-[#D4AF37]" fill="#D4AF37" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-display font-black text-[#F8F8F8]">{vendor.average_rating || '5.0'}</span>
                                    <span className="text-[10px] font-bold text-white/20 uppercase">/ 5.0 Rating</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Right Column: Analytics & Ledger */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Financial Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: CreditCard, label: "Current Exposure", value: `৳${(vendor.current_balance || 0).toLocaleString()}`, sub: `Limit: ৳${(vendor.credit_limit || 0).toLocaleString()}`, color: "text-[#DC2626]" },
                            { icon: TrendingUp, label: "Lifetime Volume", value: `৳${(vendor.total_purchases || 0).toLocaleString()}`, sub: "Total Procurement", color: "text-green-500" },
                            { icon: History, label: "Engagement Hub", value: vendor.total_transactions || 0, sub: "Purchase Cycles", color: "text-[#D4AF37]" },
                        ].map((stat, i) => (
                            <GlassCard key={i} className="p-6 group hover:border-[#D4AF37]/30 transition-all">
                                <div className="flex items-center gap-3 mb-4 text-white/20 group-hover:text-[#D4AF37]/50 transition-colors">
                                    <stat.icon className="w-4 h-4 stroke-[2]" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                                </div>
                                <h3 className={`text-2xl font-display font-black tracking-tighter ${stat.color}`}>{stat.value}</h3>
                                <p className="text-[9px] text-white/10 font-bold uppercase tracking-tighter mt-1">{stat.sub}</p>
                            </GlassCard>
                        ))}
                    </div>

                    {/* Tabs for detailed data */}
                    <GlassCard className="min-h-[500px]">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="w-full justify-start gap-12 px-8 h-16 bg-white/[0.02] border-b border-white/5 rounded-none">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-[#D4AF37] data-[state=active]:shadow-none text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all border-b-2 border-transparent data-[state=active]:border-[#D4AF37] rounded-none px-0 h-full">
                                    Strategic Overview
                                </TabsTrigger>
                                <TabsTrigger value="orders" className="data-[state=active]:bg-transparent data-[state=active]:text-[#D4AF37] data-[state=active]:shadow-none text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all border-b-2 border-transparent data-[state=active]:border-[#D4AF37] rounded-none px-0 h-full">
                                    Purchase Registry
                                </TabsTrigger>
                                <TabsTrigger value="ledger" className="data-[state=active]:bg-transparent data-[state=active]:text-[#D4AF37] data-[state=active]:shadow-none text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all border-b-2 border-transparent data-[state=active]:border-[#D4AF37] rounded-none px-0 h-full">
                                    Financial Statement
                                </TabsTrigger>
                            </TabsList>

                            <div className="p-8">
                                <TabsContent value="overview" className="mt-0 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Settlement Archetype</p>
                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                                <span className="text-xs font-bold text-[#F8F8F8]">Payment Terms</span>
                                                <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30 text-[9px] font-bold uppercase">Net {vendor.payment_terms || 'Cash'}</Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Partner Status</p>
                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                                <span className="text-xs font-bold text-[#F8F8F8]">Strategic Priority</span>
                                                <Badge className={vendor.is_preferred ? "bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0D0D0F]" : "bg-white/10 text-white/40"}>
                                                    {vendor.is_preferred ? 'ULTRA-TIER' : 'STANDARD'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Partner Intelligence & Briefing</p>
                                        <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 min-h-[120px]">
                                            <p className="text-sm text-white/60 leading-relaxed italic">
                                                {vendor.notes || "No operational briefing has been recorded for this partner entity. Ensure data collection on next engagement."}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="orders" className="mt-0 flex flex-col items-center justify-center py-20 opacity-30">
                                    <Package className="w-12 h-12 mb-4" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">No procurement history detected</p>
                                </TabsContent>

                                <TabsContent value="ledger" className="mt-0 flex flex-col items-center justify-center py-20 opacity-30">
                                    <CreditCard className="w-12 h-12 mb-4" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Financial ledger is vacuum</p>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
