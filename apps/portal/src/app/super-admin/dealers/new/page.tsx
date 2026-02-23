"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Store,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    Loader2,
    Building2,
    UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function NewDealerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        business_name: "",
        email: "",
        phone: "",
        address_line1: "",
        city: "",
        owner_name: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/super-admin/dealers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Deployment failure");

            toast.success("Consortia Enlisted Successfully");
            router.push("/super-admin/dealers");
        } catch (error) {
            console.error("Error creating dealer:", error);
            toast.error("Deployment Failed: Infrastructure Reject");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="space-y-4">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-[10px] font-black text-[#A1A1AA] hover:text-[#D4AF37] transition-all uppercase tracking-widest"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Cancel Deployment
                </button>
                <div className="flex flex-col gap-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        ENLIST <span className="text-[#D4AF37]">CONSORTIA</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                        Direct Registry Entry & Access Provisioning
                    </p>
                </div>
            </div>

            <GlassCard className="p-10 border-[#D4AF37]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[80px] rounded-full -mr-20 -mt-20" />

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Business Info */}
                        <div className="space-y-4">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] ml-1">Entity Intelligence</Label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                <Input
                                    placeholder="Legal Business Name"
                                    className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/10"
                                    required
                                    value={formData.business_name}
                                    onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] ml-1">Primary Comm Link (Email)</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="business@example.com"
                                        className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/10"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] ml-1">Secure Line (Phone)</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        placeholder="+880 1XXX-XXXXXX"
                                        className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/10"
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] ml-1">HQ Address</Label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        placeholder="Street Address, Area"
                                        className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/10"
                                        required
                                        value={formData.address_line1}
                                        onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] ml-1">Jurisdiction (City)</Label>
                                <div className="relative group">
                                    <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        placeholder="City Name"
                                        className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/10"
                                        required
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#B8860B] hover:to-[#D4AF37] text-[#0D0D0F] font-black uppercase tracking-widest text-xs relative overflow-hidden group shadow-[0_0_40px_rgba(212,175,55,0.2)]"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5" />
                                        Initialize Protocol Enlistment
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}

function Compass(props: React.ComponentProps<"svg">) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m16.24 7.76-1.41 4.95-4.95 1.41 1.41-4.95 4.95-1.41Z" />
            <circle cx="12" cy="12" r="10" />
        </svg>
    )
}
