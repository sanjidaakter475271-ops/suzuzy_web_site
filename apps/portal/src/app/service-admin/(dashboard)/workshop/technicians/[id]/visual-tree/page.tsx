'use client';

import React, { use } from 'react';
import { ServiceTree } from '@/components/service-admin/hr/ServiceTree';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Share2, Download, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default function TechnicianVisualTreePage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const router = useRouter();

    return (
        <div className="flex flex-col h-screen bg-[#080809] text-white overflow-hidden">
            {/* Cinematic Background */}
            <div className="absolute top-0 right-0 w-full h-full bg-brand/[0.02] blur-[150px] pointer-events-none" />

            {/* Premium Header */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl relative z-20">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-2xl bg-white/5 border border-white/10 hover:text-brand transition-all"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Badge className="bg-brand/10 text-brand border-brand/20 text-[8px] font-black uppercase tracking-widest px-2">Operational Intelligence</Badge>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">System Uplink Stable</span>
                        </div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
                            Graphical <span className="text-brand">Service Architecture</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest gap-2">
                        <Download size={14} /> Export Map
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest gap-2">
                        <Share2 size={14} /> Encrypted Link
                    </Button>
                </div>
            </header>

            {/* Fullscreen Tree Visualization */}
            <main className="flex-1 p-8 relative z-10 overflow-hidden">
                <div className="h-full w-full rounded-[3rem] border border-white/5 bg-black/20 shadow-2xl relative overflow-hidden group">
                    <ServiceTree staffId={id} />

                    {/* Floating Overlay Controls */}
                    <div className="absolute bottom-8 right-8 flex gap-3">
                        <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 text-nowrap">Live Stream Data</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Status Bar */}
            <footer className="h-10 border-t border-white/5 px-8 flex items-center justify-between bg-black/60 backdrop-blur-md relative z-20">
                <div className="flex items-center gap-6">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">Encrypted Secure Session ID: {id.split('-')[0].toUpperCase()} - 04.5.6</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand opacity-40" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">© 2026 SUZUKY CENTRAL COMMAND</span>
                </div>
            </footer>
        </div>
    );
}
