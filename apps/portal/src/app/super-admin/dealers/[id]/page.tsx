"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShieldCheck,
    ShieldAlert,
    Store,
    Package,
    ShoppingCart,
    DollarSign,
    CheckCircle2,
    XCircle,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface DealerDetail {
    id: string;
    business_name: string;
    email: string;
    phone: string;
    status: 'pending' | 'active' | 'suspended' | 'rejected'; // Keep 'rejected' for existing logic
    address_line1?: string; // Make optional as per original schema
    city?: string; // Make optional as per original schema
    created_at: string;
    logo_url?: string; // Keep logo_url
    profiles?: {
        full_name: string;
    };
    // Add other fields as they appear in the schema
}

export default function DealerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [dealer, setDealer] = useState<DealerDetail | null>(null);
    const [stats, setStats] = useState({
        productCount: 0,
        orderCount: 0,
        totalRevenue: 0
    });

    const id = params.id as string;

    useEffect(() => {
        if (!id) return;

        async function fetchDealerData() {
            setLoading(true);
            try {
                const res = await fetch(`/api/super-admin/dealers/${id}`);
                if (!res.ok) throw new Error("Dealer registry retrieval failure");
                const data = await res.json();

                setDealer(data);
                setStats({
                    productCount: data.productCount || 0,
                    orderCount: data.orderCount || 0,
                    totalRevenue: data.totalRevenue || 0
                });
            } catch (error) {
                console.error("Error fetching dealer details:", error);
                toast.error("Failed to load dealer dossier");
            } finally {
                setLoading(false);
            }
        }

        fetchDealerData();
    }, [id]);

    const updateStatus = async (newStatus: DealerDetail['status']) => {
        try {
            const { error } = await supabase
                .from('dealers')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setDealer(prev => prev ? { ...prev, status: newStatus } : null);
            toast.success(`Dossier status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-t-2 border-b-2 border-[#D4AF37] rounded-full animate-spin" />
            </div>
        );
    }

    if (!dealer) {
        return (
            <div className="text-center py-20">
                <AlertTriangle className="w-12 h-12 text-[#DC2626] mx-auto mb-4" />
                <h3 className="text-2xl font-display font-bold text-[#F8F8F8]">Dossier Not Found</h3>
                <p className="text-[#A1A1AA] mt-2">The requested dealer identity cannot be verified.</p>
                <Button onClick={() => router.back()} className="mt-8">Return to Registry</Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Back & Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-xs font-black text-[#A1A1AA] hover:text-[#D4AF37] transition-all uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Registry
                </button>

                <div className="flex gap-3">
                    {dealer.status === 'pending' && (
                        <>
                            <Button
                                onClick={() => updateStatus('active')}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-6 h-10 uppercase tracking-widest"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Dealer
                            </Button>
                            <Button
                                onClick={() => updateStatus('rejected')}
                                variant="outline"
                                className="border-red-600/50 text-red-500 hover:bg-red-500/10 text-xs font-bold px-6 h-10 uppercase tracking-widest"
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                            </Button>
                        </>
                    )}
                    {dealer.status === 'active' && (
                        <Button
                            onClick={() => updateStatus('suspended')}
                            variant="outline"
                            className="border-red-600/50 text-red-500 hover:bg-red-500/10 text-xs font-bold px-6 h-10 uppercase tracking-widest"
                        >
                            <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
                        </Button>
                    )}
                    {dealer.status === 'suspended' && (
                        <Button
                            onClick={() => updateStatus('active')}
                            className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0D0D0F] text-xs font-bold px-6 h-10 uppercase tracking-widest"
                        >
                            <ShieldCheck className="w-4 h-4 mr-2" /> Reinstate
                        </Button>
                    )}
                </div>
            </div>

            {/* Profile Header */}
            <div className="relative rounded-[3rem] bg-[#0D0D0F] border border-[#D4AF37]/10 p-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 blur-[120px] rounded-full -mr-32 -mt-32" />

                <div className="relative z-10 flex flex-col md:flex-row gap-12">
                    {/* Logo/Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#1A1A1C] to-[#0D0D0F] border border-[#D4AF37]/20 flex items-center justify-center text-5xl font-display font-black italic text-[#D4AF37]">
                            {dealer.business_name[0]}
                        </div>
                        <Badge className={`mt-6 w-full flex justify-center py-1.5 uppercase tracking-widest font-black text-[10px] ${dealer.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                            }`}>
                            {dealer.status}
                        </Badge>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mb-2">Verified Identity Dossier</p>
                            <h1 className="text-5xl font-display font-black italic tracking-tighter text-[#F8F8F8]">
                                {dealer.business_name}
                            </h1>
                            <div className="flex flex-wrap gap-6 mt-6">
                                <div className="flex items-center gap-2 text-[#A1A1AA] text-sm">
                                    <Mail className="w-4 h-4 text-[#D4AF37]/60" />
                                    <span>{dealer.profiles?.full_name || 'System Principal'} (Owner)</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#A1A1AA] text-sm">
                                    <Phone className="w-4 h-4 text-[#D4AF37]/60" />
                                    {dealer.phone}
                                </div>
                                <div className="flex items-center gap-2 text-[#A1A1AA]">
                                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                                    <span>{dealer.address_line1 || 'No physical address'}, {dealer.city || 'Unknown Location'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#A1A1AA] text-sm">
                                    <Calendar className="w-4 h-4 text-[#D4AF37]/60" />
                                    Joined {format(new Date(dealer.created_at), 'MMMM yyyy')}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Inventory', value: stats.productCount, icon: Package },
                                { label: 'Total Orders', value: stats.orderCount, icon: ShoppingCart },
                                { label: 'Lifetime Rev', value: formatCurrency(stats.totalRevenue), icon: DollarSign },
                                { label: 'Rating', value: '4.8/5.0', icon: ShieldCheck },
                            ].map((stat, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/20 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <stat.icon className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#D4AF37]" />
                                    </div>
                                    <p className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-lg font-display font-bold text-[#F8F8F8] italic mt-1">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Content Tabs (Placeholder for now) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="rounded-3xl bg-[#0D0D0F] border border-[#D4AF37]/10 p-8">
                        <h3 className="text-xl font-display font-bold text-[#F8F8F8] mb-6 italic">Business <span className="text-[#D4AF37]">Intelligence</span></h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest border-b border-white/5 pb-2">Business Address</p>
                                    <p className="text-sm text-[#F8F8F8] leading-relaxed">
                                        {dealer.address_line1 || 'No physical operational address verified in dossier.'}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest border-b border-white/5 pb-2">Legal Verification</p>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                                        <ShieldCheck className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-[10px] font-black text-[#F8F8F8] uppercase tracking-widest">Trade License</p>
                                            <p className="text-[9px] text-[#A1A1AA]">ID: RC-TL-1254896</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="rounded-3xl bg-[#0D0D0F] border border-[#D4AF37]/10 p-8">
                        <h3 className="text-xl font-display font-bold text-[#F8F8F8] mb-6 italic mr-2">Operational <span className="text-[#DC2626]">Safety</span></h3>
                        <div className="space-y-4">
                            <p className="text-xs text-[#A1A1AA] leading-relaxed"> Perform administrative actions on this entity with extreme caution. Every change is logged in the master audit timeline. </p>
                            <Button variant="outline" className="w-full border-[#DC2626]/30 text-[#DC2626] hover:bg-[#DC2626]/10 text-[10px] font-black uppercase tracking-widest">
                                Force Global Logout
                            </Button>
                            <Button variant="outline" className="w-full border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-[10px] font-black uppercase tracking-widest">
                                Contact Business Owner
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
