"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    XCircle,
    Eye,
    Building2,
    Calendar,
    Mail,
    Phone,
    MapPin
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Dealer {
    id: string;
    business_name: string;
    email: string;
    phone: string;
    status: 'pending' | 'active' | 'rejected';
    created_at: string;
    profiles?: {
        full_name: string;
    };
    address_line1?: string;
    city?: string;
}

export default function AdminDealerModeration() {
    const [loading, setLoading] = useState(true);
    const [dealers, setDealers] = useState<Dealer[]>([]);
    const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);

    const fetchPendingDealers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('dealers')
                .select('*, profiles:owner_user_id(full_name)')
                .eq('status', 'pending')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setDealers(data || []);
        } catch (error) {
            console.error("Error fetching pending dealers:", error);
            toast.error("Failed to load waitlist");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingDealers();

        const sub = supabase.channel('dealer-moderation')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'dealers' }, () => fetchPendingDealers())
            .subscribe();

        return () => {
            supabase.removeChannel(sub);
        };
    }, []);

    const updateStatus = async (id: string, status: Dealer['status']) => {
        try {
            const { error } = await supabase
                .from('dealers')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Dealer application ${status}`);
            if (selectedDealer?.id === id) setSelectedDealer(null);
        } catch (error) {
            console.error("Error updating dealer status:", error);
            toast.error(`Decision failed for ${status}`);
        }
    };

    const columns: ColumnDef<Dealer>[] = [
        {
            accessorKey: "business_name",
            header: "Institution",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-display font-black text-xs uppercase italic">
                        {row.original.business_name[0]}
                    </div>
                    <div>
                        <p className="font-bold text-[#F8F8F8] tracking-tight">{row.original.business_name}</p>
                        <p className="text-[10px] text-[#A1A1AA] uppercase font-medium">{row.original.city || 'Location Pending'}</p>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "created_at",
            header: "Submission Date",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#F8F8F8]/60 uppercase tracking-widest">
                    <Calendar className="w-3 h-3 text-[#D4AF37]" />
                    {format(new Date(row.original.created_at), 'MMM dd, p')}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedDealer(row.original)}
                        className="h-8 px-3 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-[9px] font-black uppercase tracking-widest border border-transparent hover:border-[#D4AF37]/20"
                    >
                        Review
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(row.original.id, 'active')}
                        className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/10"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(row.original.id, 'rejected')}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                    >
                        <XCircle className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-10 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        DEALER <span className="text-[#D4AF37]">ADMISSIONS</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                        {dealers.length} Applications Awaiting Review
                    </p>
                </div>
            </div>

            <div className="bg-[#0D0D0F]/40 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/10 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={dealers}
                    searchKey="business_name"
                />
            </div>

            {/* Side Drawer Review Panel */}
            <AnimatePresence>
                {selectedDealer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDealer(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0D0D0F] border-l border-[#D4AF37]/20 z-50 shadow-[20px_0_60px_rgba(0,0,0,0.5)] p-10 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-display font-black italic text-[#F8F8F8]">Application <span className="text-[#D4AF37]">Dossier</span></h3>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedDealer(null)} className="text-[#A1A1AA] hover:text-[#F8F8F8]">
                                    <XCircle className="w-6 h-6" />
                                </Button>
                            </div>

                            <ScrollArea className="flex-1 -mx-4 px-4">
                                <div className="space-y-8">
                                    <div className="p-6 rounded-3xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl font-display font-black text-[#D4AF37] mb-4 italic">
                                            {selectedDealer.business_name[0]}
                                        </div>
                                        <h4 className="text-xl font-bold text-[#F8F8F8] tracking-tight">{selectedDealer.business_name}</h4>
                                        <Badge variant="outline" className="mt-2 text-[#D4AF37] border-[#D4AF37]/20 uppercase tracking-[0.2em] font-black text-[9px]">
                                            Pending Verification
                                        </Badge>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA] border-b border-white/5 pb-2">Business Information</p>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex items-center gap-3 text-sm text-[#F8F8F8]/80">
                                                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                                                    <span>{selectedDealer.profiles?.full_name || 'System Principal'} (Owner)</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-[#F8F8F8]/80">
                                                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                                                    <span>{selectedDealer.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-[#F8F8F8]/80">
                                                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                                                    <span>{selectedDealer.phone}</span>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm text-[#F8F8F8]/80">
                                                    <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                                                    <span>{selectedDealer.address_line1}, {selectedDealer.city}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Security Checks Placeholder */}
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-[#A1A1AA]">Integrity Scan</p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-[#A1A1AA]">Email Verified</span>
                                                <span className="text-green-500 font-bold">YES</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-[#A1A1AA]">Phone Reachable</span>
                                                <span className="text-green-500 font-bold">YES</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-[#A1A1AA]">Location Mapping</span>
                                                <span className="text-amber-500 font-bold">IN REVIEW</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                                <Button
                                    onClick={() => updateStatus(selectedDealer.id, 'rejected')}
                                    variant="outline"
                                    className="border-red-600/30 text-red-500 hover:bg-red-500/10 font-bold uppercase tracking-widest text-[10px] h-12"
                                >
                                    Deny Access
                                </Button>
                                <Button
                                    onClick={() => updateStatus(selectedDealer.id, 'active')}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest text-[10px] h-12"
                                >
                                    Approve Entity
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
