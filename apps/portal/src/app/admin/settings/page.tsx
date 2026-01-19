"use client"

import { useState } from "react";
import {
    Settings,
    Shield,
    Database,
    Bell,
    Globe,
    Eye,
    Save,
    RefreshCw,
    Lock,
    Paintbrush
} from "lucide-react";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            toast.success("System configurations updated successfully");
        }, 1500);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                        SYSTEM <MetallicText>CONFIGURATION</MetallicText>
                    </h1>
                    <p className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest mt-2">
                        Control center for portal-wide settings & parameters
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 bg-[#D4AF37] text-black hover:bg-[#B8962E] text-[10px] font-black uppercase tracking-widest px-10 shadow-[0_10px_40px_rgba(212,175,55,0.2)]"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Commit Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Nav (Mini) */}
                <div className="space-y-2">
                    {[
                        { label: "General Control", icon: Settings, active: true },
                        { label: "Security & RLS", icon: Shield },
                        { label: "Data Integrity", icon: Database },
                        { label: "Aesthetic Engine", icon: Paintbrush },
                        { label: "Communications", icon: Bell },
                        { label: "Localization", icon: Globe }
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest ${item.active ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Main Settings Panel */}
                <div className="md:col-span-2 space-y-8">
                    <GlassCard className="p-8 space-y-8">
                        <div>
                            <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tight mb-6">Portal Identity</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Platform Name</label>
                                    <Input
                                        defaultValue="RoyalConsortium Terminal"
                                        className="bg-white/5 border-white/10 rounded-xl h-12 text-white placeholder:text-white/20 focus:border-[#D4AF37]/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Support Response Target (Minutes)</label>
                                    <Input
                                        type="number"
                                        defaultValue="15"
                                        className="bg-white/5 border-white/10 rounded-xl h-12 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-white/5" />

                        <div>
                            <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tight mb-6">Maintenance Mode</h3>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div>
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">Status: Operational</p>
                                    <p className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-widest mt-1">Live traffic is active</p>
                                </div>
                                <div className="w-12 h-6 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center px-1">
                                    <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg" />
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-white/5" />

                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tight">Moderation Logic</h3>
                                <Lock className="w-4 h-4 text-[#D4AF37]/40" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded border-2 border-[#D4AF37] bg-[#D4AF37]/20 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-black rounded-sm" />
                                    </div>
                                    <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Auto-verify Premium Products</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded border-2 border-white/10 flex items-center justify-center">
                                    </div>
                                    <span className="text-xs font-bold text-white/70 uppercase tracking-widest opacity-40">Enable Global Shadow-Ban (Restricted)</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8 border-rose-500/20 bg-rose-500/5">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-500">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-lg font-display font-black text-white italic uppercase tracking-tight">Danger Zone</h3>
                                    <p className="text-xs text-[#A1A1AA] font-medium leading-relaxed">System-wide resets or critical data purges. These actions are irreversible and will be logged in the Audit Trail with your operator ID.</p>
                                </div>
                                <Button variant="ghost" className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-widest p-0 h-auto">
                                    Purge Operation Log Cache <RefreshCw className="w-3 h-3 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
