"use client";

import { motion } from "framer-motion";
import {
    LayoutGrid,
    Tags,
    ArrowUpRight,
    Boxes,
    Activity,
    Database,
    ChevronRight,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { MetallicText } from "@/components/ui/premium/MetallicText";
import { GradientButton } from "@/components/ui/premium/GradientButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CatalogHub() {
    const [stats, setStats] = useState({
        categories: 0,
        brands: 0,
        products: 0
    });

    useEffect(() => {
        async function fetchStats() {
            const [cat, brand, prod] = await Promise.all([
                supabase.from('categories').select('*', { count: 'exact', head: true }),
                supabase.from('brands').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true })
            ]);
            setStats({
                categories: cat.count || 0,
                brands: brand.count || 0,
                products: prod.count || 0
            });
        }
        fetchStats();
    }, []);

    const sections = [
        {
            title: "Taxonomy Engine",
            subtitle: "Category Management",
            desc: "Architect the classification hierarchy of vehicles and components.",
            icon: Boxes,
            href: "/admin/catalog/categories",
            count: stats.categories,
            color: "from-blue-500/20 to-indigo-500/20"
        },
        {
            title: "Brand Registry",
            subtitle: "Manufacturer Identity",
            desc: "Manage authorized manufacturing entities and global origins.",
            icon: Tags,
            href: "/admin/catalog/brands",
            count: stats.brands,
            color: "from-amber-500/20 to-orange-500/20"
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#D4AF37]/60">
                    <Database className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Core Data Architecture</span>
                </div>
                <h1 className="text-6xl font-display font-black text-white italic tracking-tighter leading-none">
                    CATALOG <MetallicText>CENTRAL</MetallicText>
                </h1>
                <p className="max-w-2xl text-white/40 text-sm font-medium leading-relaxed mt-4">
                    High-performance orchestration of product taxonomies and brand identities.
                    Maintain the integrity of the global asset registry with precision.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Active Taxonomies", val: stats.categories, icon: LayoutGrid },
                    { label: "Verified Brands", val: stats.brands, icon: Activity },
                    { label: "Managed Assets", val: stats.products, icon: TrendingUp },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-6 border-white/5 bg-[#1A1A1C]/30 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-1">{stat.label}</p>
                            <p className="text-3xl font-display font-black text-white italic">{stat.val}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-[#D4AF37]">
                            <stat.icon className="w-6 h-6 opacity-40" />
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {sections.map((section, idx) => (
                    <Link key={idx} href={section.href} className="group cursor-pointer">
                        <motion.div
                            whileHover={{ y: -10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <GlassCard className="relative overflow-hidden p-10 border-white/5 bg-[#0D0D0F]/60 h-full flex flex-col justify-between group-hover:border-[#D4AF37]/30 transition-all duration-500">
                                {/* Gradient Background Pulse */}
                                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${section.color} blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 opacity-30 transition-opacity duration-1000`} />

                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform duration-500">
                                        <section.icon className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]/80">{section.title}</h3>
                                            <div className="h-[1px] flex-1 bg-white/5" />
                                        </div>
                                        <h2 className="text-3xl font-display font-black text-white italic tracking-tight">{section.subtitle}</h2>
                                        <p className="text-white/40 text-sm font-medium leading-relaxed max-w-[80%] pt-4 italic">
                                            {section.desc}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-12 relative z-10 flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-display font-black text-white/10 group-hover:text-[#D4AF37]/10 transition-colors uppercase italic">{section.count} Registry Units</span>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/30 transition-all duration-500">
                                        <ArrowUpRight className="w-6 h-6" />
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Bottom Tip */}
            <div className="p-8 rounded-[2rem] bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-[#D4AF37]/20 transition-all duration-700">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
                        <Database className="w-6 h-6 text-[#D4AF37] animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white tracking-tight uppercase">System Integrity Scan</h4>
                        <p className="text-xs text-white/40 font-medium italic">Operational status: All registries synchronized with primary database clusters.</p>
                    </div>
                </div>
                <GradientButton className="h-12 px-8 text-[10px] font-black uppercase italic tracking-widest whitespace-nowrap">
                    Trigger Reconciliation
                </GradientButton>
            </div>
        </div>
    );
}
