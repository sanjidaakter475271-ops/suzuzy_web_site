"use client";

import { SalesAdminGuard } from "@/components/guards/auth-guards";
import SidebarNav from "../super-admin/_components/sidebar-nav";
import { CommandMenu } from "@/components/dashboard/CommandMenu";
import { Search, Zap } from "lucide-react";
import { MobileNav } from "@/components/dashboard/MobileNav";

export default function SalesAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SalesAdminGuard>
            <div className="flex min-h-screen bg-[#0D0D0F] text-[#F8F8F8]">
                <CommandMenu />

                {/* Sidebar - Reusing standard sidebar which now supports SALES_ADMIN */}
                <div className="hidden md:block border-r border-[#D4AF37]/10 bg-[#0D0D0F]">
                    <SidebarNav />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header - Specialized for Sales Command */}
                    <header className="h-16 border-b border-[#10B981]/10 flex items-center justify-between px-4 md:px-8 bg-[#0D0D0F]/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4 md:gap-8">
                            <MobileNav />
                            <div className="flex flex-col">
                                <h1 className="font-display text-sm uppercase tracking-widest text-[#10B981] whitespace-nowrap flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Sales Command
                                </h1>
                            </div>

                            {/* Visual Search Trigger */}
                            <button
                                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                                className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-[#10B981]/20 transition-all group"
                            >
                                <Search className="w-3.5 h-3.5 text-white/20 group-hover:text-[#10B981] transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/10 group-hover:text-white/40">Search Sales...</span>
                                <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[8px] text-white/20 font-sans">Ctrl K</kbd>
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs font-bold text-[#F8F8F8]">Sales Admin</p>
                                <p className="text-[10px] text-[#10B981]/60 font-medium">REVENUE CONTROL</p>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-[#10B981]/20 bg-[#10B981]/10 flex items-center justify-center text-[10px] text-[#10B981]">
                                SA
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </SalesAdminGuard>
    );
}
