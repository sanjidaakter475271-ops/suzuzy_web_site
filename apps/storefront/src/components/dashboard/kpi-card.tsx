"use client";

import { motion } from "framer-motion";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string | number;
    change?: number; // percentage
    changeLabel?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    loading?: boolean;
    className?: string;
}

export function KPICard({
    title,
    value,
    change,
    changeLabel = "from last month",
    icon: Icon,
    trend = "neutral",
    loading = false,
    className,
}: KPICardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.4 }}
            className={cn(
                "relative overflow-hidden rounded-2xl bg-[#0D0D0F] border border-[#D4AF37]/10 p-6 group",
                "hover:border-[#D4AF37]/30 transition-all duration-300",
                className
            )}
        >
            {/* Background gradients */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-[60px] rounded-full -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/20 transition-colors">
                        <Icon className="w-5 h-5 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />
                    </div>

                    {change !== undefined && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border",
                            trend === "up" && "bg-green-500/10 text-green-500 border-green-500/20",
                            trend === "down" && "bg-red-500/10 text-red-500 border-red-500/20",
                            trend === "neutral" && "bg-white/5 text-white/40 border-white/5"
                        )}>
                            {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                            {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                            {trend === "neutral" && <Minus className="w-3 h-3" />}
                            <span>{Math.abs(change)}%</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
                        {title}
                    </h3>

                    {loading ? (
                        <div className="h-8 w-24 bg-white/5 animate-pulse rounded-md" />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl lg:text-3xl font-display font-black text-[#F8F8F8] italic tracking-tight">
                                {value}
                            </span>
                        </div>
                    )}

                    {changeLabel && (
                        <p className="text-[10px] text-white/30 font-medium">
                            {changeLabel}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
