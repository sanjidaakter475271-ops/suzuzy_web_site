"use client";

import { motion } from "framer-motion";
import { Zap, Crown, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SubscriptionBar() {
    // Hardcoded for now, will be dynamic in integration phase
    const planName = "Professional Plan";
    const daysRemaining = 23;
    const productCount = 45;
    const productLimit = 200;
    const percentage = (productCount / productLimit) * 100;

    return (
        <div className="bg-[#D4AF37] px-8 py-2 flex items-center justify-between overflow-hidden relative">
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/4 skew-x-[-20deg]"
            />

            <div className="flex items-center gap-6 relative z-10">
                <div className="flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-[#0D0D0F]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0D0D0F]">
                        {planName}
                    </span>
                </div>

                <div className="h-4 w-px bg-[#0D0D0F]/20" />

                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-[#0D0D0F]/70 uppercase tracking-tighter">
                        Product Usage
                    </span>
                    <div className="w-32 h-1.5 bg-[#0D0D0F]/10 rounded-full overflow-hidden border border-[#0D0D0F]/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-[#0D0D0F]"
                        />
                    </div>
                    <span className="text-[10px] font-black text-[#0D0D0F]">
                        {productCount}/{productLimit}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-6 relative z-10">
                <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#DC2626]" />
                    <span className="text-[10px] font-bold text-[#0D0D0F] uppercase tracking-wider">
                        {daysRemaining} DAYS REMAINING
                    </span>
                </div>

                <Link
                    href="/dealer/subscription"
                    className="bg-[#0D0D0F] text-[#D4AF37] px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest hover:bg-[#1A1A1C] transition-colors"
                >
                    Upgrade Now
                </Link>
            </div>
        </div>
    );
}
