'use client';

import React from 'react';
import { Power, Menu } from 'lucide-react';
import Link from 'next/link';

interface POSLayoutProps {
    children: React.ReactNode;
}

const POSLayout: React.FC<POSLayoutProps> = ({ children }) => {
    return (
        <div className="h-screen w-screen bg-surface-page dark:bg-dark-page flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="h-16 bg-surface-card dark:bg-dark-card border-b border-surface-border dark:border-dark-border flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
                            RC
                        </div>
                        <div className="leading-tight">
                            <h1 className="font-black text-lg text-ink-heading dark:text-white uppercase tracking-tighter">Royal Consortium</h1>
                            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">POS Terminal</p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-xs font-bold text-ink-heading dark:text-white">Rafiq Ahmed</span>
                        <span className="text-[10px] font-bold text-ink-muted uppercase">Sales Rep</span>
                    </div>
                    <Link
                        href="/dashboard"
                        className="bg-danger/10 text-danger hover:bg-danger hover:text-white p-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                    >
                        <Power size={18} />
                        Exit POS
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {children}
            </main>
        </div>
    );
};

export default POSLayout;
