"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, ShieldCheck, CreditCard, Building2, UserCircle, Phone, Mail, MapPin, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Label } from "@/components/ui/label";

export default function NewVendorPage() {
    const router = useRouter();
    const { profile } = useUser();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        payment_terms: "cash",
        credit_limit: 0,
        notes: "",
        is_preferred: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.dealer_id) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from("vendors")
                .insert([{
                    ...formData,
                    dealer_id: profile.dealer_id,
                    status: 'active'
                }]);

            if (error) throw error;
            router.push("/dealer/vendors");
        } catch (error) {
            console.error("Error creating vendor:", error);
            alert("Failed to create vendor. Please check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Nav Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 text-white/40 hover:text-[#D4AF37] transition-all"
                >
                    <div className="w-10 h-10 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center group-hover:border-[#D4AF37]/30 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Return to Partners</span>
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Secure Onboarding Protocol</span>
                </div>
            </div>

            {/* Title Section */}
            <div className="space-y-3">
                <h1 className="text-5xl font-display font-black tracking-tighter text-[#F8F8F8] italic leading-tight">
                    PARTNER <span className="text-[#D4AF37]">ONBOARDING</span>
                </h1>
                <p className="text-[#A1A1AA] text-sm max-w-xl font-medium leading-relaxed">
                    Establish a new supply chain connection. Please provide verified corporate details to maintain procurement integrity.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Section 1: Identity */}
                    <GlassCard className="p-8 space-y-8 h-full">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                <Building2 className="w-6 h-6 stroke-[1.5]" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-[#F8F8F8]">Corporate Identity</h2>
                                <p className="text-[10px] font-bold text-[#D4AF37]/50 uppercase tracking-tighter">Official Business Records</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Company Name</Label>
                                <div className="relative group">
                                    <Input
                                        required
                                        placeholder="Ex: Royal Automotive Spares"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium pl-6"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Vendor Code (Internal)</Label>
                                <Input
                                    placeholder="Ex: VEN-RC-001"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium pl-6"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Authorized Contact Person</Label>
                                <div className="relative group">
                                    <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-[#D4AF37] transition-all" />
                                    <Input
                                        placeholder="Full Name"
                                        value={formData.contact_person}
                                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                        className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium pl-14"
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Section 2: Contact & Logsitics */}
                    <GlassCard className="p-8 space-y-8 h-full">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                <Globe className="w-6 h-6 stroke-[1.5]" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-[#F8F8F8]">Logistics & Comms</h2>
                                <p className="text-[10px] font-bold text-[#D4AF37]/50 uppercase tracking-tighter">Connectivity Parameters</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Phone Terminal</Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-[#D4AF37] transition-all" />
                                        <Input
                                            placeholder="+880 1XXX-XXXXXX"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium pl-14"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">E-Mail Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-[#D4AF37] transition-all" />
                                        <Input
                                            type="email"
                                            placeholder="vendor@company.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium pl-14"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Operating Headquarters</Label>
                                <div className="relative group">
                                    <MapPin className="absolute left-5 top-6 w-4 h-4 text-white/10 group-focus-within:text-[#D4AF37] transition-all" />
                                    <Textarea
                                        placeholder="Full legal address..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="min-h-[110px] bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium pl-14 pt-5 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Section 3: Financial Parameters */}
                <GlassCard className="p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                            <CreditCard className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#F8F8F8]">Financial Protocol</h2>
                            <p className="text-[10px] font-bold text-[#D4AF37]/50 uppercase tracking-tighter">Settlement & Credit Metrics</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Payment Settlement Terms</Label>
                            <Select
                                value={formData.payment_terms}
                                onValueChange={(val) => setFormData({ ...formData, payment_terms: val })}
                            >
                                <SelectTrigger className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium px-6">
                                    <SelectValue placeholder="Select terms" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1C] border-white/10 text-white">
                                    <SelectItem value="cash">Instant Cash</SelectItem>
                                    <SelectItem value="7_days">Net 7 Days</SelectItem>
                                    <SelectItem value="15_days">Net 15 Days</SelectItem>
                                    <SelectItem value="30_days">Net 30 Days</SelectItem>
                                    <SelectItem value="60_days">Net 60 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Initial Credit Limit (৳)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.credit_limit}
                                onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
                                className="h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium px-6"
                            />
                        </div>

                        <div className="flex flex-col justify-end pb-1">
                            <label className="group flex items-center gap-4 cursor-pointer p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#D4AF37]/20 transition-all">
                                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${formData.is_preferred ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-white/10 group-hover:border-[#D4AF37]/50'}`}>
                                    {formData.is_preferred && <div className="w-2 h-2 rounded-full bg-[#0D0D0F]" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.is_preferred}
                                    onChange={(e) => setFormData({ ...formData, is_preferred: e.target.checked })}
                                />
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#F8F8F8]">Premium Partner</p>
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Elevated priority in sourcing</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2.5 pt-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Additional Intelligence</Label>
                        <Textarea
                            placeholder="Optional notes, performance expectations, or historical context..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="min-h-[120px] bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium p-6 resize-none"
                        />
                    </div>
                </GlassCard>

                {/* Action Bar */}
                <div className="flex items-center justify-end gap-6 pt-8 border-t border-white/5">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                    >
                        Abort Registration
                    </Button>
                    <Button
                        disabled={loading}
                        className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-[11px] h-14 px-12 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_12px_32px_rgba(212,175,55,0.25)]"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-[#0D0D0F]/30 border-t-[#0D0D0F] rounded-full animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                                Finalize Onboarding
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
