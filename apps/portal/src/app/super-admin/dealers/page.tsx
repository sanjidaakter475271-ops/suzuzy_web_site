"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal,
    ExternalLink,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    Phone,
    MapPin
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

interface Dealer {
    id: string;
    business_name: string;
    email: string;
    phone: string;
    status: 'pending' | 'active' | 'suspended' | 'rejected';
    created_at: string;
    owner_name?: string;
}

export default function DealersPage() {
    const [loading, setLoading] = useState(true);
    const [dealers, setDealers] = useState<Dealer[]>([]);

    const fetchDealers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/super-admin/dealers');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "System registry unavailable");
            }
            const data = await response.json();
            setDealers(data || []);
        } catch (error: any) {
            console.error("Error fetching dealers:", error);
            toast.error(error.message || "Failed to load dealers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDealers();

        const subscription = supabase
            .channel('dealers-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'dealers' }, () => {
                fetchDealers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const updateDealerStatus = async (id: string, status: Dealer['status']) => {
        try {
            const { error } = await supabase
                .from('dealers')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Dealer status updated to ${status}`);
        } catch (error) {
            console.error("Error updating dealer status:", error);
            toast.error("Failed to update status");
        }
    };

    const columns: ColumnDef<Dealer>[] = [
        {
            accessorKey: "business_name",
            header: "Business Name",
            cell: ({ row }) => {
                const dealer = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-xs uppercase">
                            {dealer.business_name[0]}
                        </div>
                        <div>
                            <p className="font-bold text-[#F8F8F8] tracking-tight">{dealer.business_name}</p>
                            <p className="text-[10px] text-[#A1A1AA] uppercase tracking-tighter">ID: {dealer.id.split('-')[0]}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "email",
            header: "Contact Intelligence",
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA]">
                        <Mail className="w-2.5 h-2.5" />
                        <span>{row.original.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA]">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{row.original.phone}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Authority Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const variants: Record<string, string> = {
                    active: "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
                    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
                    suspended: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
                    rejected: "bg-gray-500/10 text-gray-400 border-gray-500/20"
                };

                return (
                    <Badge className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${variants[status] || ""}`}>
                        {status}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "created_at",
            header: "Registered On",
            cell: ({ row }) => (
                <div className="text-[10px] font-medium text-[#A1A1AA]">
                    {format(new Date(row.original.created_at), 'MMM dd, yyyy')}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const dealer = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#D4AF37]/10">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-[#D4AF37]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1A1A1C] border-[#D4AF37]/20 text-[#A1A1AA]">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-[#D4AF37]">DEALER OPS</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/super-admin/dealers/${dealer.id}`} className="cursor-pointer flex items-center gap-2 text-xs">
                                    <ExternalLink className="w-3.5 h-3.5" /> View Detailed Dossier
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#D4AF37]/10" />
                            {dealer.status !== 'active' && (
                                <DropdownMenuItem
                                    onClick={() => updateDealerStatus(dealer.id, 'active')}
                                    className="cursor-pointer flex items-center gap-2 text-xs text-green-500 focus:text-green-500 focus:bg-green-500/10"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Grants Active Status
                                </DropdownMenuItem>
                            )}
                            {dealer.status !== 'suspended' && (
                                <DropdownMenuItem
                                    onClick={() => updateDealerStatus(dealer.id, 'suspended')}
                                    className="cursor-pointer flex items-center gap-2 text-xs text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                >
                                    <XCircle className="w-3.5 h-3.5" /> Suspend Operations
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        DEALER <span className="text-[#D4AF37]">CONSORTIUM</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                        Registry & Governance Control
                    </p>
                </div>
                <Link href="/super-admin/dealers/new">
                    <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                        Enlist New Consortia
                    </Button>
                </Link>
            </div>

            {/* Main Table */}
            <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#D4AF37]/5 blur-[100px] rounded-full" />

                <div className="relative z-10 bg-[#0D0D0F]/40 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/10 p-2 overflow-hidden hover:border-[#D4AF37]/20 transition-all duration-500">
                    <DataTable
                        columns={columns}
                        data={dealers}
                        searchKey="business_name"
                    />
                </div>
            </div>
        </div>
    );
}
