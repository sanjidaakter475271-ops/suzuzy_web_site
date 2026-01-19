"use client";

import { ShieldAlert, CreditCard, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";
import { GlassCard } from "@/components/ui/premium/GlassCard";

export default function SubscriptionRenewPage() {
    return (
        <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[150px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#DC2626]/5 blur-[150px] rounded-full -ml-64 -mb-64" />

            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 relative z-10">
                <div className="flex flex-col justify-center space-y-6">
                    <h1 className="text-5xl font-display font-black text-white italic leading-tight">
                        MEMBERSHIP <br />
                        <MetallicText>RENEWAL</MetallicText>
                    </h1>
                    <p className="text-[#A1A1AA] text-lg font-medium">
                        Your dealer privileges require an active subscription. Restore full access to your command terminal immediately.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 text-white/80">
                            <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                            <span>Unlimited Inventory Listings</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                            <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                            <span>Priority Support Channel</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                            <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                            <span>Advanced Analytics Suite</span>
                        </div>
                    </div>
                </div>

                <GlassCard className="p-8 border-[#D4AF37]/30 space-y-8 flex flex-col justify-center">
                    <div className="text-center space-y-2">
                        <p className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest">Selected Plan</p>
                        <h2 className="text-3xl font-display font-black text-white">PROFESSIONAL</h2>
                        <p className="text-4xl font-black text-white">$299<span className="text-lg text-white/40 font-bold">/mo</span></p>
                    </div>

                    <div className="space-y-4">
                        <GradientButton className="w-full h-14 text-lg">
                            <CreditCard className="w-5 h-5 mr-3" />
                            Secure Checkout
                        </GradientButton>
                        <p className="text-center text-xs text-white/30">
                            Secured by Stripe SSL Encryption
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
