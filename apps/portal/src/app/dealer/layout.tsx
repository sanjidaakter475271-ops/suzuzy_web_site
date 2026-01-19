"use client";

import { DealerGuard } from "@/components/guards/auth-guards";
import SidebarNav from "../super-admin/_components/sidebar-nav";
import SubscriptionBar from "./_components/subscription-bar";
import { CommandMenu } from "@/components/dashboard/CommandMenu";
import { Search } from "lucide-react";

export default function DealerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DealerGuard>
            <div className="flex min-h-screen bg-[#0D0D0F] text-[#F8F8F8]">
                <CommandMenu />

                {/* Sidebar */}
                <div className="w-64 border-r border-[#D4AF37]/10 bg-[#0D0D0F]">
                    <SidebarNav />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Top Info Bar */}
                    <SubscriptionBar />

                    {/* Header */}
                    <header className="h-16 border-b border-[#D4AF37]/10 flex items-center justify-between px-8 bg-[#0D0D0F]/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-8">
                            <h1 className="font-display text-sm uppercase tracking-widest text-[#D4AF37] whitespace-nowrap">
                                Dealer Hub
                            </h1>

                            {/* Visual Search Trigger */}
                            <button
                                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                                className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-[#D4AF37]/20 transition-all group"
                            >
                                <Search className="w-3.5 h-3.5 text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/10 group-hover:text-white/40">Search Asset...</span>
                                <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[8px] text-white/20 font-sans">Ctrl K</kbd>
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs font-bold text-[#F8F8F8]">Store Profile</p>
                                <p className="text-[10px] text-[#D4AF37]/60 font-medium whitespace-nowrap">VERIFIED PARTNER</p>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 flex items-center justify-center text-[10px] text-[#D4AF37]">
                                DP
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-8">
                        {children}
                    </main>
                </div>
            </div>
        </DealerGuard>
    );
}
