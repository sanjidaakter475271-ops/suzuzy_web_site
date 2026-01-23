"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
    Activity,
    Volume2,
    VolumeX,
    Clock,
    MapPin,
    CreditCard,
    User,
    Search,
    Wifi
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SaleTransaction {
    sale_id: string;
    sale_number: string;
    dealer_name: string;
    customer_name: string;
    grand_total: number;
    payment_method: string;
    payment_status: string;
    sale_time: string;
}

export default function LiveMonitorPage() {
    const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isConnected, setIsConnected] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch initial data
    const fetchInitialData = async () => {
        const { data, error } = await supabase.rpc('get_recent_sales', { limit_count: 50 });
        if (data) setTransactions(data);
    };

    useEffect(() => {
        fetchInitialData();

        // Realtime Subscription
        const channel = supabase
            .channel('live-monitor')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'sales'
                },
                async (payload) => {
                    // Play sound
                    if (soundEnabled) playNotificationSound();

                    // Optimistically add new sale (or refetch detailed data)
                    // We refetch to get joined dealer name
                    const { data } = await supabase.rpc('get_recent_sales', { limit_count: 1 });
                    if (data && data.length > 0) {
                        const newSale = data[0];
                        // Avoid duplicates if multiple events fire
                        setTransactions(prev => {
                            if (prev.find(t => t.sale_id === newSale.sale_id)) return prev;
                            return [newSale, ...prev].slice(0, 100); // Keep last 100
                        });
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [soundEnabled]);

    const playNotificationSound = () => {
        try {
            // Simple beep sound
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.value = 880; // A5
            gainNode.gain.value = 0.1;

            oscillator.start();
            setTimeout(() => oscillator.stop(), 100);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-BD', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount);
    };

    const totalToday = transactions.reduce((acc, curr) => {
        const isToday = new Date(curr.sale_time).getDate() === new Date().getDate();
        return isToday ? acc + curr.grand_total : acc;
    }, 0);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
            {/* Header / Stats Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0D0D0F] border border-[#D4AF37]/10">
                <div className="flex items-center gap-8">
                    <div>
                        <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-bold">Monitor Status</p>
                        <div className="flex items-center gap-2 mt-1">
                            {isConnected ? (
                                <span className="flex items-center gap-2 text-xs font-bold text-[#10B981]">
                                    <Wifi className="w-3 h-3" /> LIVE FEED
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 text-xs font-bold text-[#EF4444]">
                                    <Wifi className="w-3 h-3" /> DISCONNECTED
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div>
                        <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-bold">Session Volume</p>
                        <p className="text-xl font-display font-black italic text-[#F8F8F8]">{formatCurrency(totalToday)}</p>
                    </div>
                </div>

                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                    {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-[#10B981]" />
                    ) : (
                        <VolumeX className="w-5 h-5 text-[#EF4444]" />
                    )}
                </button>
            </div>

            {/* Live Feed */}
            <div className="flex-1 overflow-hidden relative rounded-2xl bg-[#0D0D0F] border border-[#D4AF37]/10 flex flex-col">
                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Transaction Stream
                    </h3>
                    <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded border border-[#10B981]/20 animate-pulse">
                        RECEIVING DATA...
                    </span>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3"
                >
                    <AnimatePresence initial={false}>
                        {transactions.map((tx) => (
                            <motion.div
                                key={tx.sale_id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: "auto" }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 rounded-xl bg-[#1A1A1C] border border-white/5 hover:border-[#D4AF37]/30 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-[10px] font-mono text-[#A1A1AA] bg-white/5 px-2 py-1 rounded">
                                            {formatTime(tx.sale_time)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-[#F8F8F8]">{tx.dealer_name}</span>
                                                <span className="text-[10px] text-white/20">•</span>
                                                <span className="text-xs text-[#10B981] font-mono">{tx.sale_number}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-[#A1A1AA]">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {tx.customer_name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CreditCard className="w-3 h-3" /> {tx.payment_method}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-lg font-display font-black italic text-[#F8F8F8]">
                                            {formatCurrency(tx.grand_total)}
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider",
                                            tx.payment_status === 'paid' ? "text-[#10B981]" : "text-[#F59E0B]"
                                        )}>
                                            {tx.payment_status}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {transactions.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-[#A1A1AA]/30">
                            <Activity className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-sm">Waiting for incoming signals...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
