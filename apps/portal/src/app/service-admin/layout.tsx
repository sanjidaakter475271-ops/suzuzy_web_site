"use client";

import { ServiceAdminGuard } from "@/components/guards/auth-guards";
import SidebarNav from "../super-admin/_components/sidebar-nav";
import { CommandMenu } from "@/components/dashboard/CommandMenu";
import { Search, Wrench } from "lucide-react";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { motion } from "framer-motion";

export default function ServiceAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ServiceAdminGuard>
            <div className="flex min-h-screen bg-[#020617] text-[#F8F8F8] selection:bg-[#D4AF37]/30">
                <CommandMenu />

                {/* Sidebar */}
                <div className="hidden md:block border-r border-[#D4AF37]/10 bg-[#020617]">
                    <SidebarNav />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header - Optimized for Service Operations */}
                    <header className="h-16 border-b border-[#D4AF37]/10 flex items-center justify-between px-4 md:px-8 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
                        <div className="flex items-center gap-4 md:gap-8">
                            <MobileNav />
                            <div className="flex flex-col">
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-display text-sm uppercase tracking-widest text-[#D4AF37] whitespace-nowrap flex items-center gap-2"
                                >
                                    <Wrench className="w-4 h-4" />
                                    Service Operations
                                </motion.h1>
                            </div>

                            {/* Visual Search Trigger */}
                            <button
                                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                                className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-[#D4AF37]/20 transition-all group"
                            >
                                <Search className="w-3.5 h-3.5 text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/10 group-hover:text-white/40">Search Tickets...</span>
                                <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[8px] text-white/20 font-sans">Ctrl K</kbd>
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-[#F8F8F8]">Service Admin</p>
                                <p className="text-[10px] text-[#D4AF37]/60 font-medium">PRECISION CONTROL</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center text-[12px] font-bold text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                                SA
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-x-hidden relative">
                        {/* Background Decorative Element */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="p-4 md:p-8 relative z-10">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ServiceAdminGuard>
    );
}
