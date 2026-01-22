"use client";

import { AdminGuard } from "@/components/guards/auth-guards";
import SidebarNav from "../super-admin/_components/sidebar-nav";
import { CommandMenu } from "@/components/dashboard/CommandMenu";
import { Search } from "lucide-react";
import { MobileNav } from "@/components/dashboard/MobileNav";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="flex min-h-screen bg-[#0D0D0F] text-[#F8F8F8]">
                <CommandMenu />

                {/* Sidebar - Using the same visual language */}
                <div className="hidden md:block border-r border-[#D4AF37]/10 bg-[#0D0D0F]">
                    <SidebarNav />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="h-16 border-b border-[#D4AF37]/10 flex items-center justify-between px-4 md:px-8 bg-[#0D0D0F]/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4 md:gap-8">
                            <MobileNav />
                            <h1 className="font-display text-sm uppercase tracking-widest text-[#D4AF37] whitespace-nowrap">
                                Admin Console
                            </h1>

                            {/* Visual Search Trigger */}
                            <button
                                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                                className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-[#D4AF37]/20 transition-all group"
                            >
                                <Search className="w-3.5 h-3.5 text-white/20 group-hover:text-[#D4AF37] transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/10 group-hover:text-white/40">Search Protocol...</span>
                                <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[8px] text-white/20 font-sans">Ctrl K</kbd>
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs font-bold text-[#F8F8F8]">Portal Access</p>
                                <p className="text-[10px] text-[#D4AF37]/60">ADMINISTRATIVE AUTH</p>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 flex items-center justify-center text-[10px] text-[#D4AF37]">
                                AD
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}
