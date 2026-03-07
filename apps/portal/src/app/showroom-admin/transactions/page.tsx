"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    Eye,
    RotateCcw,
    FileText,
    Calendar,
    ChevronDown,
    CreditCard,
    User,
    Store
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Supabase generated types would be better, but defining here for speed
interface Sale {
    id: string;
    sale_number: string;
    dealers: { name: string; location: string };
    customer_name: string;
    grand_total: number;
    payment_method: string;
    payment_status: string;
    created_at: string;
    items_count?: number; // Calculated or separate query
}

interface SaleItem {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    sku: string;
}

export default function TransactionsPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [methodFilter, setMethodFilter] = useState("all");

    // Modal
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchSales();
    }, [statusFilter, methodFilter]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('sales')
                .select(`
                    id, sale_number, 
                    dealers (name, location),
                    customer_name,
                    grand_total, payment_method, payment_status, created_at
                `)
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('payment_status', statusFilter);
            }
            if (methodFilter !== 'all') {
                query = query.eq('payment_method', methodFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setSales(data as any);
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSaleDetails = async (saleId: string) => {
        setDetailsLoading(true);
        try {
            const { data, error } = await supabase
                .from('sale_items')
                .select('*')
                .eq('sale_id', saleId);

            if (error) throw error;
            setSaleItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleViewDetails = (sale: Sale) => {
        setSelectedSale(sale);
        fetchSaleDetails(sale.id);
    };

    const filteredSales = sales.filter(s =>
        s.sale_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.dealers.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'refunded': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-display font-black text-[#F8F8F8] uppercase tracking-tighter italic">Transaction History</h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Global Sales Registry</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest h-10">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
            <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-white/5">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                    <Input
                        placeholder="Search by ID, Dealer, or Customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 h-10 rounded-xl focus:ring-[#D4AF37]/20"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-white/5 bg-white/[0.02] text-xs h-10 gap-2">
                                <Filter className="w-3 h-3" />
                                Payment: <span className="text-[#D4AF37] capitalize">{methodFilter}</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1A1A1C] border-white/10 text-white">
                            <DropdownMenuItem onClick={() => setMethodFilter('all')}>All Methods</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMethodFilter('cash')}>Cash</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMethodFilter('bkash')}>bKash</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMethodFilter('card')}>Card</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-white/5 bg-white/[0.02] text-xs h-10 gap-2">
                                <Filter className="w-3 h-3" />
                                Status: <span className="text-[#D4AF37] capitalize">{statusFilter}</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1A1A1C] border-white/10 text-white">
                            <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('refunded')}>Refunded</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </GlassCard>

            {/* Table */}
            <div className="rounded-2xl border border-white/5 overflow-hidden bg-[#0D0D0F]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-white/[0.01]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Transaction ID</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Date & Time</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Dealer Information</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Customer</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Amount</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-white/20 text-xs uppercase tracking-widest animate-pulse">
                                        Retrieving Ledger Data...
                                    </td>
                                </tr>
                            ) : filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-white/20 text-xs uppercase tracking-widest">
                                        No transactions found matching criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <span className="font-mono text-xs font-bold text-[#D4AF37]">{sale.sale_number}</span>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <CreditCard className="w-3 h-3 text-white/20" />
                                                <span className="text-[10px] text-white/40 uppercase">{sale.payment_method}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-medium text-white/80">{format(new Date(sale.created_at), 'MMM dd, yyyy')}</span>
                                            <p className="text-[10px] text-white/30 font-mono mt-0.5">{format(new Date(sale.created_at), 'hh:mm a')}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Store className="w-3 h-3 text-white/20" />
                                                <span className="text-xs font-bold text-white/90">{sale.dealers.name}</span>
                                            </div>
                                            <span className="text-[10px] text-white/30 ml-5">{sale.dealers.location}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3 text-white/20" />
                                                <span className="text-xs text-white/70">{sale.customer_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-display font-black text-sm text-[#F8F8F8]">৳{sale.grand_total.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className={cn("text-[9px] uppercase font-black tracking-widest py-0.5", getStatusColor(sale.payment_status))}>
                                                {sale.payment_status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="w-4 h-4 text-white/50" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#1A1A1C] border-white/10 text-white">
                                                    <DropdownMenuLabel className="text-[10px] uppercase text-white/30 tracking-widest">Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-white/10" />
                                                    <DropdownMenuItem onClick={() => handleViewDetails(sale)} className="text-xs gap-2">
                                                        <Eye className="w-3 h-3" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs gap-2 text-white/50 cursor-not-allowed">
                                                        <FileText className="w-3 h-3" /> Download Invoice
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/10" />
                                                    <DropdownMenuItem className="text-xs gap-2 text-red-400 hover:text-red-400 hover:bg-red-500/10">
                                                        <RotateCcw className="w-3 h-3" /> Refund Transaction
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
                <DialogContent className="bg-[#1A1A1C] border-white/10 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-display font-black italic tracking-tighter uppercase flex items-center justify-between">
                            <span>Transaction Details</span>
                            {selectedSale && <span className="text-[#D4AF37]">{selectedSale.sale_number}</span>}
                        </DialogTitle>
                        <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">
                            Recorded on {selectedSale && format(new Date(selectedSale.created_at), 'MMMM dd, yyyy at hh:mm a')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSale && (
                        <div className="space-y-6 pt-4">
                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Dealer</p>
                                    <p className="text-sm font-bold text-white">{selectedSale.dealers.name}</p>
                                    <p className="text-xs text-white/50">{selectedSale.dealers.location}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Customer</p>
                                    <p className="text-sm font-bold text-white">{selectedSale.customer_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-[8px] border-white/10 text-white/40">{selectedSale.payment_method}</Badge>
                                        <Badge variant="outline" className={cn("text-[8px] border-none px-1.5", getStatusColor(selectedSale.payment_status))}>{selectedSale.payment_status}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div>
                                <h3 className="text-xs font-black uppercase text-white/40 tracking-widest mb-3">Purchased Items</h3>
                                <ScrollArea className="h-48 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                                    {detailsLoading ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(i => <div key={i} className="h-10 w-full bg-white/5 animate-pulse rounded-lg" />)}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {saleItems.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center group">
                                                    <div>
                                                        <p className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">{item.product_name}</p>
                                                        <p className="text-[10px] text-white/30 font-mono">SKU: {item.sku}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-white">৳{item.total_price.toLocaleString()}</p>
                                                        <p className="text-[10px] text-white/40">
                                                            {item.quantity} x ৳{item.unit_price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            {/* Summary Footer */}
                            <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                <div className="text-left">
                                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Payment Recorded via</p>
                                    <p className="text-sm text-white/60 capitalize mt-0.5 max-w-[200px]">
                                        {selectedSale.payment_method} transaction validated by system
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Total Amount</p>
                                    <p className="text-3xl font-display font-black text-[#D4AF37] italic tracking-tight">৳{selectedSale.grand_total.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
