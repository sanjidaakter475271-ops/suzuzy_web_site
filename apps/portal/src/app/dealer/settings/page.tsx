"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Store,
    ShieldCheck,
    Building2,
    CreditCard,
    Image as ImageIcon,
    Upload,
    Save,
    Loader2,
    Activity,
    FileText,
    Globe,
    Phone,
    Mail,
    MapPin,
    ArrowRight
} from "lucide-react";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = 'profile' | 'identity' | 'banking' | 'social';

export default function DealerSettings() {
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    const [dealerData, setDealerData] = useState<any>(null);
    const [bankData, setBankData] = useState<any>(null);

    useEffect(() => {
        async function fetchSettings() {
            if (!profile?.dealer_id) return;
            setLoading(true);
            try {
                const [
                    { data: dealer },
                    { data: bank }
                ] = await Promise.all([
                    supabase.from('dealers').select('*').eq('id', profile.dealer_id).single(),
                    supabase.from('dealer_bank_accounts').select('*').eq('dealer_id', profile.dealer_id).maybeSingle()
                ]);

                setDealerData(dealer);
                setBankData(bank || {
                    provider_name: '',
                    account_name: '',
                    account_number: '',
                    branch_name: '',
                    routing_number: '',
                    account_type: 'bank'
                });
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Failed to synchronize settings");
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, [profile?.dealer_id]);

    const handleSave = async () => {
        if (!profile?.dealer_id) return;

        startTransition(async () => {
            try {
                // Save Dealer Profile
                const { error: dealerError } = await supabase
                    .from('dealers')
                    .update({
                        business_name: dealerData.business_name,
                        description: dealerData.description,
                        phone: dealerData.phone,
                        email: dealerData.email,
                        address_line1: dealerData.address_line1,
                        city: dealerData.city,
                        trade_license_no: dealerData.trade_license_no,
                        tin_number: dealerData.tin_number,
                        bin_number: dealerData.bin_number,
                        social_links: dealerData.social_links,
                        cover_photo_url: dealerData.cover_photo_url,
                        logo_url: dealerData.logo_url
                    })
                    .eq('id', profile.dealer_id);

                if (dealerError) throw dealerError;

                // Save Bank Details
                const { error: bankError } = await supabase
                    .from('dealer_bank_accounts')
                    .upsert({
                        dealer_id: profile.dealer_id,
                        ...bankData,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'dealer_id' });

                if (bankError) throw bankError;

                toast.success("Security & profile parameters updated successfully");
            } catch (error: any) {
                console.error("Save error:", error);
                toast.error(error.message || "Failed to persist changes");
            }
        });
    };

    if (loading) {
        return (
            <div className="h-full w-full min-h-[600px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Authenticating Secure Node...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 selection:bg-[#D4AF37] selection:text-[#0D0D0F]">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#D4AF37]/60">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Administrative Security Terminal</span>
                    </div>
                    <h1 className="text-5xl font-display font-black text-white italic tracking-tighter leading-none">
                        STORE <MetallicText>SETTINGS</MetallicText>
                    </h1>
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <GradientButton
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex-1 lg:flex-none h-14 px-10 text-[10px] font-black uppercase italic tracking-[0.2em] shadow-[0_10px_40px_rgba(212,175,55,0.2)]"
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2 uppercase tracking-widest italic font-bold">
                                <Loader2 className="w-4 h-4 animate-spin text-[#0D0D0F]" />
                                Syncing...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Configuration
                            </div>
                        )}
                    </GradientButton>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { id: 'profile', label: 'Business Profile', icon: Store, desc: 'Public identity & branding' },
                        { id: 'social', label: 'Social Presence', icon: Globe, desc: 'Networks & Community' },
                        { id: 'identity', label: 'Legal & Identity', icon: FileText, desc: 'Tax & licensing data' },
                        { id: 'banking', label: 'Financial Routing', icon: CreditCard, desc: 'Disbursement parameters' },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as Tab)}
                            className={cn(
                                "w-full text-left p-6 rounded-2xl border transition-all duration-500 group relative overflow-hidden",
                                activeTab === t.id
                                    ? "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]"
                                    : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05] hover:border-white/10"
                            )}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <t.icon className={cn("w-5 h-5 transition-transform duration-500", activeTab === t.id ? "scale-110" : "group-hover:scale-110")} />
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest">{t.label}</p>
                                    <p className="text-[9px] opacity-40 font-bold uppercase tracking-tighter mt-0.5">{t.desc}</p>
                                </div>
                            </div>
                            {activeTab === t.id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 to-transparent pointer-events-none" />
                            )}
                        </button>
                    ))}

                    <div className="mt-8 p-6 bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-2xl">
                        <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-2">Partner Status</p>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                            <p className="text-[10px] text-white font-bold uppercase tracking-widest">Verified Merchant</p>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="lg:col-span-3">
                    <GlassCard className="p-8 md:p-12 border-white/5 bg-[#0D0D0F]/40">
                        {activeTab === 'profile' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Business Name</label>
                                        <div className="relative">
                                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <Input
                                                value={dealerData?.business_name || ''}
                                                onChange={(e) => setDealerData({ ...dealerData, business_name: e.target.value })}
                                                className="h-14 pl-12 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Partner Email (Public)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <Input
                                                value={dealerData?.email || ''}
                                                onChange={(e) => setDealerData({ ...dealerData, email: e.target.value })}
                                                className="h-14 pl-12 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Primary Contact</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <Input
                                                value={dealerData?.phone || ''}
                                                onChange={(e) => setDealerData({ ...dealerData, phone: e.target.value })}
                                                className="h-14 pl-12 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Storefront URL Slug</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <Input
                                                value={dealerData?.slug || ''}
                                                disabled
                                                className="h-14 pl-12 bg-white/[0.03] border-white/10 rounded-xl opacity-50 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Address Ledger</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 w-4 h-4 text-white/20" />
                                            <Textarea
                                                value={dealerData?.address_line1 || ''}
                                                onChange={(e) => setDealerData({ ...dealerData, address_line1: e.target.value })}
                                                className="min-h-[100px] pl-12 pt-4 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Showroom Mission Statement (Description)</label>
                                        <Textarea
                                            value={dealerData?.description || ''}
                                            onChange={(e) => setDealerData({ ...dealerData, description: e.target.value })}
                                            placeholder="Elegant description of your dealership..."
                                            className="min-h-[120px] bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 p-6"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'identity' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="p-6 bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-2xl flex items-center gap-4 mb-8">
                                    <FileText className="w-6 h-6 text-[#D4AF37]" />
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Administrative Compliance</h4>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">These identifiers are required for legal settlement and marketplace verification.</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Trade License Number</label>
                                        <Input
                                            value={dealerData?.trade_license_no || ''}
                                            onChange={(e) => setDealerData({ ...dealerData, trade_license_no: e.target.value })}
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">TIN (Tax Identification)</label>
                                        <Input
                                            value={dealerData?.tin_number || ''}
                                            onChange={(e) => setDealerData({ ...dealerData, tin_number: e.target.value })}
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">BIN (Business Identity)</label>
                                        <Input
                                            value={dealerData?.bin_number || ''}
                                            onChange={(e) => setDealerData({ ...dealerData, bin_number: e.target.value })}
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'banking' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Bank Institution Name</label>
                                        <Input
                                            value={bankData?.provider_name || ''}
                                            onChange={(e) => setBankData({ ...bankData, provider_name: e.target.value })}
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Settlement Account Name</label>
                                        <Input
                                            value={bankData?.account_name || ''}
                                            onChange={(e) => setBankData({ ...bankData, account_name: e.target.value })}
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Account Number</label>
                                        <Input
                                            value={bankData?.account_number || ''}
                                            onChange={(e) => setBankData({ ...bankData, account_number: e.target.value })}
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Branch Identity</label>
                                        <Input
                                            value={bankData?.branch_name || ''}
                                            onChange={(e) => setBankData({ ...bankData, branch_name: e.target.value })}
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-widest">Universal Routing No.</label>
                                        <Input
                                            value={bankData?.routing_number || ''}
                                            onChange={(e) => setBankData({ ...bankData, routing_number: e.target.value })}
                                            className="h-14 bg-white/[0.03] border-white/10 rounded-xl focus:border-[#D4AF37]/50 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </GlassCard>

                    {/* Branding Section (Shared/Bottom) */}
                    <div className="mt-10 grid md:grid-cols-3 gap-8">
                        <GlassCard className="p-8 border-white/5 bg-[#1A1A1C]/40 space-y-4">
                            <label className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] block text-center">Brand Identity (Logo)</label>
                            <div className="aspect-square bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#D4AF37]/30 transition-all cursor-pointer group relative overflow-hidden">
                                {dealerData?.logo_url ? (
                                    <img src={dealerData.logo_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 text-white/10 group-hover:text-[#D4AF37] transition-colors" />
                                        <span className="text-[9px] uppercase font-black text-white/20">Replace Identity asset</span>
                                    </>
                                )}
                                <Input
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        // Mock upload behavior - in real app would upload to storage
                                        // For now just taking a text input if we could, but file input is tricky without storage logic
                                        // Let's change this to a text input below the box for URL entry for now as requested by user constraints often
                                    }}
                                />
                                {/* Quick URL Input Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform">
                                    <Input
                                        placeholder="Img URL..."
                                        className="h-6 text-[9px] bg-transparent border-none text-white focus:ring-0"
                                        value={dealerData?.logo_url || ''}
                                        onChange={(e) => setDealerData({ ...dealerData, logo_url: e.target.value })}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="md:col-span-2 p-8 border-white/5 bg-[#1A1A1C]/40 space-y-4">
                            <label className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] block text-center">Hero Perspective (Cover Photo)</label>
                            <div className="aspect-[21/9] bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#D4AF37]/30 transition-all cursor-pointer group relative overflow-hidden">
                                {dealerData?.cover_photo_url ? (
                                    <img src={dealerData.cover_photo_url} alt="Banner" className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-white/10 group-hover:text-[#D4AF37] transition-colors" />
                                        <span className="text-[9px] uppercase font-black text-white/20">Update Landscape Cinematic asset</span>
                                    </>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform">
                                    <Input
                                        placeholder="Cover Photo URL..."
                                        className="h-6 text-[9px] bg-transparent border-none text-white focus:ring-0"
                                        value={dealerData?.cover_photo_url || ''}
                                        onChange={(e) => setDealerData({ ...dealerData, cover_photo_url: e.target.value })}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
