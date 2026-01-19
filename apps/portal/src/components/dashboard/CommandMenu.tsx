"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search,
    Command,
    X,
    History,
    TrendingUp,
    Package,
    Users,
    ShoppingBag,
    ArrowRight,
    Loader2,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchResult {
    id: string;
    type: 'order' | 'dealer' | 'product';
    title: string;
    subtitle: string;
    url: string;
}

export function CommandMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();

    const toggle = useCallback(() => setIsOpen(open => !open), []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                toggle();
            }
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggle]);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const [
                { data: orders },
                { data: dealers },
                { data: products }
            ] = await Promise.all([
                supabase.from('orders').select('id, order_number, shipping_name').ilike('order_number', `%${searchQuery}%`).limit(3),
                supabase.from('dealers').select('id, business_name, email').ilike('business_name', `%${searchQuery}%`).limit(3),
                supabase.from('products').select('id, name, sku').ilike('name', `%${searchQuery}%`).limit(3)
            ]);

            const combined: SearchResult[] = [
                ...(orders?.map(o => ({
                    id: o.id,
                    type: 'order' as const,
                    title: `Order #${o.order_number}`,
                    subtitle: o.shipping_name,
                    url: `/admin/orders/${o.id}`
                })) || []),
                ...(dealers?.map(d => ({
                    id: d.id,
                    type: 'dealer' as const,
                    title: d.business_name,
                    subtitle: d.email,
                    url: `/admin/dealers/${d.id}`
                })) || []),
                ...(products?.map(p => ({
                    id: p.id,
                    type: 'product' as const,
                    title: p.name,
                    subtitle: p.sku,
                    url: `/admin/catalog` // Placeholder URL
                })) || [])
            ];

            setResults(combined);
            setSelectedIndex(0);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    const handleSelect = (url: string) => {
        router.push(url);
        setIsOpen(false);
        setQuery("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (results.length === 0) return;

        if (e.key === "ArrowDown") {
            setSelectedIndex(i => (i + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            setSelectedIndex(i => (i - 1 + results.length) % results.length);
        } else if (e.key === "Enter" && results[selectedIndex]) {
            handleSelect(results[selectedIndex].url);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-[#0D0D0F]/80 backdrop-blur-2xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-[#141417] border border-[#D4AF37]/20 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8),0_0_2px_rgba(212,175,55,0.2)] overflow-hidden"
                    >
                        {/* Search Input Area */}
                        <div className="relative p-6 border-b border-white/5 bg-white/[0.02]">
                            <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search Protocol Registries..."
                                className="w-full bg-transparent pl-12 pr-4 py-4 text-lg font-display font-medium text-white placeholder:text-white/10 outline-none italic tracking-tight"
                            />
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {loading ? (
                                    <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
                                ) : (
                                    <div className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] text-white/20 font-black uppercase tracking-widest">ESC</div>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                            <div className="p-4">
                                {!query && (
                                    <div className="space-y-8 p-4">
                                        <div>
                                            <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                                <History className="w-3 h-3" /> Recent Expeditions
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Global Orders', 'Merchant Registry'].map((item) => (
                                                    <div key={item} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/20 transition-all cursor-pointer group">
                                                        <span className="text-xs font-bold text-white/40 group-hover:text-white">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                                <TrendingUp className="w-3 h-3" /> System Intelligence
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                                                            <Activity className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white transition-colors group-hover:text-[#D4AF37]">Operational Health</p>
                                                            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">System Protocols Normal</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {results.length > 0 && (
                                    <div className="space-y-2 p-2">
                                        {results.map((result, idx) => (
                                            <button
                                                key={`${result.type}-${result.id}`}
                                                onClick={() => handleSelect(result.url)}
                                                onMouseEnter={() => setSelectedIndex(idx)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 text-left group",
                                                    selectedIndex === idx
                                                        ? "bg-[#D4AF37]/10 border-[#D4AF37]/20 translate-x-1"
                                                        : "bg-transparent border border-transparent"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                                                        result.type === 'order' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                                                            result.type === 'dealer' ? "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]" :
                                                                "bg-purple-500/10 border-purple-500/20 text-purple-500"
                                                    )}>
                                                        {result.type === 'order' ? <ShoppingBag className="w-6 h-6" /> :
                                                            result.type === 'dealer' ? <Users className="w-6 h-6" /> :
                                                                <Package className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <p className={cn(
                                                            "text-sm font-bold transition-colors",
                                                            selectedIndex === idx ? "text-white" : "text-white/60"
                                                        )}>{result.title}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">{result.subtitle}</p>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all",
                                                    selectedIndex === idx ? "bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]" : "bg-white/5 border-white/10 text-white/20"
                                                )}>
                                                    {result.type}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {query && !loading && results.length === 0 && (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                            <Search className="w-8 h-8 text-white/10" />
                                        </div>
                                        <p className="text-white/40 font-display italic">No records found matching <span className="text-white font-bold">&quot;{query}&quot;</span></p>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-white/10">Try searching for Order Numbers, Dealer Names, or Product SKUs</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Area */}
                        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">↑↓</span> Navigate</span>
                                <span className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">ENTER</span> Execute</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Command className="w-3 h-3" />
                                <span>Global Intel Protocol v3.0</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
