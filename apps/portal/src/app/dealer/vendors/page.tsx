"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, Globe, Phone, Mail, MapPin, ExternalLink, UserPlus, Package } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Vendor {
    id: string;
    name: string;
    code: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    status: 'active' | 'inactive' | 'blocked';
    is_preferred: boolean;
    current_balance: number;
}

export default function VendorsPage() {
    const { profile } = useUser();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchVendors();
        }
    }, [profile]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("vendors")
                .select("*")
                .eq("dealer_id", profile?.dealer_id)
                .order("name", { ascending: true });

            if (error) throw error;
            setVendors(data || []);
        } catch (error) {
            console.error("Error fetching vendors:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]/60">Supply Chain</span>
                    </div>
                    <h1 className="text-5xl font-display font-black tracking-tighter text-[#F8F8F8] italic">
                        VENDORS
                    </h1>
                    <p className="text-[#A1A1AA] text-sm max-w-md font-medium leading-relaxed">
                        Manage your supplier relationships, track credit limits, and monitor performance metrics.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dealer/vendors/new">
                        <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(212,175,55,0.2)]">
                            <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                            Partner Onboarding
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview (Minimalist Glassmorphism) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Partners", value: vendors.length, sub: "Active Suppliers" },
                    { label: "Preferred", value: vendors.filter(v => v.is_preferred).length, sub: "Top Rated" },
                    { label: "Total Owed", value: `৳${vendors.reduce((acc, v) => acc + (v.current_balance || 0), 0).toLocaleString()}`, sub: "Outstanding Balance" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm group hover:border-[#D4AF37]/30 transition-all"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-[#D4AF37]/50 transition-colors">
                            {stat.label}
                        </p>
                        <div className="flex items-end justify-between mt-2">
                            <h2 className="text-3xl font-display font-black text-[#F8F8F8] tracking-tight">{stat.value}</h2>
                            <p className="text-[9px] text-white/10 font-bold uppercase tracking-tighter mb-1">{stat.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-white/5">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                    <Input
                        placeholder="Search partners by name, code or person..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white/[0.02] border-white/5 rounded-2xl focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all text-sm font-medium"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="h-14 px-6 border-white/5 bg-white/[0.02] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#F8F8F8] transition-all">
                        <Filter className="w-4 h-4 mr-2 opacity-50" />
                        Refine Search
                    </Button>
                </div>
            </div>

            {/* Vendor Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-2xl bg-white/[0.02]" />
                    ))}
                </div>
            ) : filteredVendors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor, i) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            key={vendor.id}
                            className="group relative h-full flex flex-col p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden"
                        >
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-[#D4AF37]/10 transition-all" />

                            <div className="relative z-10 flex-1">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-[#D4AF37]/5 text-[#D4AF37] border-[#D4AF37]/20 text-[9px] font-black tracking-widest">
                                                {vendor.code || 'NO-CODE'}
                                            </Badge>
                                            {vendor.is_preferred && (
                                                <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0D0D0F] border-none text-[8px] font-black tracking-tighter">
                                                    PREMIUM PARTNER
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-display font-black text-[#F8F8F8] tracking-tight group-hover:text-[#D4AF37] transition-colors">
                                            {vendor.name}
                                        </h3>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/20 hover:text-[#F8F8F8]">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#1A1A1C] border-white/10 text-[#F8F8F8]">
                                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] cursor-pointer">View Dossier</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] cursor-pointer">Modify Details</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] cursor-pointer">Purchase Orders</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 hover:text-red-500 cursor-pointer">Block Partner</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-white/40">
                                        <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={3} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Contact: {vendor.contact_person || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/40">
                                        <Phone className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={3} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{vendor.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/40">
                                        <Mail className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={3} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider truncate">{vendor.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-white/40">
                                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-[#D4AF37]" strokeWidth={3} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider leading-relaxed line-clamp-2">
                                            {vendor.address || 'Address not listed'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-end justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Exposure</p>
                                    <p className={`text-xl font-display font-black tracking-tighter ${vendor.current_balance > 0 ? 'text-[#DC2626]' : 'text-green-500'}`}>
                                        ৳{(vendor.current_balance || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{vendor.status}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Package className="w-8 h-8 text-white/10" />
                    </div>
                    <h3 className="text-xl font-display font-black text-[#F8F8F8] tracking-tight mb-2 uppercase">No Partners Detected</h3>
                    <p className="text-[#A1A1AA] text-sm font-medium mb-8">Begin your supply chain by onboarding your first vendor partner.</p>
                    <Link href="/dealer/vendors/new">
                        <Button className="bg-white/5 hover:bg-[#D4AF37] text-white hover:text-[#0D0D0F] font-black uppercase tracking-widest text-[9px] h-10 px-8 rounded-xl transition-all">
                            Initiate First Onboarding
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}


