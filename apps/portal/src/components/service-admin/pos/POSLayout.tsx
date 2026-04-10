'use client';

import React from 'react';
import { Power, Menu } from 'lucide-react';
import Link from 'next/link';
import FloatingNotifications from '../layout/FloatingNotifications';
import { useNotificationSync } from '@/hooks/useNotificationSync';

interface POSLayoutProps {
    children: React.ReactNode;
}

const POSLayout: React.FC<POSLayoutProps> = ({ children }) => {
    // Enable real-time notifications in POS
    useNotificationSync();

    return (
        <div className="h-screen w-screen bg-dark-page flex flex-col overflow-hidden text-slate-200">
            {/* Top Bar */}
            <header className="h-16 bg-dark-card border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-30 shadow-2xl">
                <div className="flex items-center gap-4">
                    <Link href="/service-admin/dashboard" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-all duration-300">
                            RC
                        </div>
                        <div className="leading-tight">
                            <h1 className="font-black text-lg text-white uppercase tracking-tighter group-hover:text-orange-500 transition-colors">Royal Consortium</h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">POS Terminal</p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-black text-white uppercase tracking-tight">Rafiq Ahmed</span>
                        <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Sales Representative</span>
                    </div>
                    <Link
                        href="/service-admin/dashboard"
                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-red-500/20 shadow-lg shadow-red-500/5"
                    >
                        <Power size={16} />
                        Exit POS
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative bg-dark-page">
                {children}
            </main>

            {/* Floating Notifications */}
            <FloatingNotifications />
        </div>
    );
};

export default POSLayout;
