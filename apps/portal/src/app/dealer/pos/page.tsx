"use client";

import { useState, useEffect, useRef } from "react";
import {
    Search,
    ShoppingCart,
    User,
    Plus,
    Minus,
    Trash2,
    Zap,
    CreditCard,
    Banknote,
    QrCode,
    Package,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductVariant {
    id: string;
    sku: string;
    barcode: string;
    stock_quantity: number;
    price: number;
    products: {
        name: string;
        image_url?: string;
    };
}

interface CartItem extends ProductVariant {
    quantity: number;
}

interface Customer {
    id: string;
    full_name: string;
    phone: string;
    email: string;
}

export default function POSPage() {
    const { profile } = useUser();
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    // Customer Selection
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);

    const scanInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile?.dealer_id) {
            fetchData();
        }
    }, [profile]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("product_variants")
                .select(`
                    id, sku, barcode, stock_quantity, price,
                    products (name)
                `)
                .eq("products.dealer_id", profile?.dealer_id)
                .gt("stock_quantity", 0);

            if (error) throw error;
            setVariants(data as any || []);

            // Initial customer list
            const { data: custData } = await supabase
                .from("profiles")
                .select("id, full_name, phone, email")
                .eq("role", "customer")
                .limit(5);
            setCustomers(custData || []);

        } catch (error) {
            console.error("Error fetching POS data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const barcode = searchQuery.trim();
            const variant = variants.find(v => v.barcode === barcode || v.sku === barcode);
            if (variant) {
                addToCart(variant);
                setSearchQuery("");
            }
        }
    };

    const addToCart = (variant: ProductVariant) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === variant.id);
            if (existing) {
                if (existing.quantity >= variant.stock_quantity) return prev;
                return prev.map(item =>
                    item.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...variant, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                if (newQty > item.stock_quantity) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% Simulated Tax
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0 || !profile?.dealer_id) return;

        try {
            setCheckoutLoading(true);

            // 1. Create Sale
            const { data: sale, error: saleErr } = await supabase
                .from("sales")
                .insert([{
                    dealer_id: profile.dealer_id,
                    customer_id: selectedCustomer?.id || null,
                    subtotal: subtotal,
                    tax_amount: tax,
                    grand_total: total,
                    payment_status: 'paid',
                    status: 'completed',
                    payment_method: 'cash'
                }])
                .select()
                .single();

            if (saleErr) throw saleErr;

            // 2. Create Sale Items & Update Inventory (Simple version for MVP)
            // Note: Production would use DB functions to handle FIFO batch subtraction
            for (const item of cart) {
                await supabase.from("sale_items").insert([{
                    sale_id: sale.id,
                    variant_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity
                }]);

                // Update stock count (Trigger usually handles this, but we update variants for safety)
                await supabase.rpc('decrement_variant_stock', {
                    v_id: item.id,
                    qty: item.quantity
                });
            }

            alert("Checkout Successful! Receipt generated.");
            setCart([]);
            setSelectedCustomer(null);
            fetchData();
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Transaction failed. Check inventory levels.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const filteredVariants = variants.filter(v =>
        v.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-8 overflow-hidden">
            {/* Left: Product Grid & Search */}
            <div className="flex-1 flex flex-col min-w-0 space-y-8">
                {/* Search Bar - Barcode Optimized */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                            <Search className="w-5 h-5 text-white/20 group-focus-within:text-[#D4AF37] transition-all" />
                            <div className="w-[1px] h-4 bg-white/10" />
                        </div>
                        <Input
                            ref={scanInputRef}
                            autoFocus
                            placeholder="Scan Barcode or Search Inventory (Press / to focus)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleBarcodeScan}
                            className="h-16 bg-white/[0.02] border-white/5 rounded-2xl pl-16 text-sm font-medium focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all placeholder:text-white/10"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            <Badge variant="outline" className="border-white/5 bg-white/5 text-[10px] text-white/20 tracking-widest font-black uppercase py-1">Scanner Ready</Badge>
                        </div>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-16 px-8 border-white/5 bg-white/[0.02] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#D4AF37] transition-all gap-3">
                                <User className="w-4 h-4" />
                                {selectedCustomer ? selectedCustomer.full_name : "Select Customer"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1A1A1C] border-white/10 text-white max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-display font-black tracking-tighter uppercase italic">Customer Registry</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <Input
                                    placeholder="Search by name or phone..."
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    className="bg-white/5 border-white/10 h-12"
                                />
                                <ScrollArea className="h-64">
                                    <div className="space-y-2">
                                        {customers.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => { setSelectedCustomer(c); }}
                                                className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/20 transition-all text-left group"
                                            >
                                                <p className="text-sm font-black text-[#F8F8F8] group-hover:text-[#D4AF37]">{c.full_name}</p>
                                                <p className="text-[10px] text-white/20 font-bold tracking-widest mt-0.5">{c.phone}</p>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <Button className="w-full bg-[#D4AF37] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] h-12 rounded-xl">Create New Record</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Grid */}
                <div className="flex-1 min-h-0 bg-white/[0.01] rounded-3xl border border-white/5 overflow-y-auto custom-scrollbar p-6">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-48 w-full bg-white/5 rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {filteredVariants.map((item, i) => (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        onClick={() => addToCart(item)}
                                        key={item.id}
                                        className="group relative flex flex-col p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#D4AF37]/20 transition-all text-left overflow-hidden ring-offset-0 ring-[#D4AF37] focus:ring-2"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex-1 space-y-3 relative z-10">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline" className="bg-[#D4AF37]/5 text-[#D4AF37] border-[#D4AF37]/20 text-[8px] font-black tracking-widest">
                                                    SKU: {item.sku}
                                                </Badge>
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">Stock: {item.stock_quantity}</span>
                                            </div>
                                            <h3 className="text-sm font-black text-[#F8F8F8] tracking-tight line-clamp-2 leading-tight group-hover:text-[#D4AF37] transition-colors uppercase italic">
                                                {item.products.name}
                                            </h3>
                                        </div>

                                        <div className="mt-6 flex items-end justify-between relative z-10">
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Net Value</p>
                                                <p className="text-lg font-display font-black text-[#F8F8F8]">৳{item.price.toLocaleString()}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0D0D0F] transition-all">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Checkout Sidebar */}
            <div className="w-[420px] flex flex-col space-y-6">
                <GlassCard className="flex-1 flex flex-col border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

                    {/* Cart Header */}
                    <div className="p-8 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-5 h-5 text-[#D4AF37]" strokeWidth={2.5} />
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#F8F8F8]">Current Cart</h2>
                        </div>
                        <Badge className="bg-white/5 text-white/40 border-none px-2.5 py-1 text-[10px] font-black uppercase">{cart.reduce((a, b) => a + b.quantity, 0)} Items</Badge>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 min-h-0 px-8 py-4 overflow-y-auto custom-scrollbar space-y-4">
                        <AnimatePresence initial={false}>
                            {cart.length > 0 ? (
                                cart.map((item) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        key={item.id}
                                        className="group p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[11px] font-black text-white leading-snug truncate uppercase italic">{item.products.name}</h4>
                                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">৳{item.price.toLocaleString()} / Unit</p>
                                            </div>
                                            <button
                                                onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                                                className="text-white/10 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center bg-white/5 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-8 rounded-md flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-10 text-center text-xs font-black text-[#F8F8F8]">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-8 h-8 rounded-md flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-sm font-black text-[#D4AF37] tracking-tight">৳{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-10">
                                    <ShoppingCart className="w-20 h-20 mb-4" strokeWidth={1} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Cart Vacuum Detected</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Calculation & Action */}
                    <div className="p-8 bg-[#1A1A1C]/50 backdrop-blur-md border-t border-white/5 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                <span>Sub-Total Matrix</span>
                                <span>৳{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                <span>Simulated Tax (5%)</span>
                                <span>৳{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Valuation Total</span>
                                <span className="text-3xl font-display font-black text-[#F8F8F8] tracking-tighter">৳{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="h-14 border-white/5 bg-white/[0.02] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                <QrCode className="w-4 h-4 mr-2 text-[#D4AF37]" />
                                Split Bill
                            </Button>
                            <Button variant="outline" className="h-14 border-white/5 bg-white/[0.02] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                <Banknote className="w-4 h-4 mr-2 text-green-500" />
                                Cash On
                            </Button>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || checkoutLoading}
                            className="w-full h-16 bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_12px_32px_rgba(212,175,55,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="flex items-center justify-center gap-3">
                                {checkoutLoading ? (
                                    <div className="w-5 h-5 border-2 border-[#0D0D0F]/30 border-t-[#0D0D0F] rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 fill-[#0D0D0F]" />
                                        <span>Authorize Transaction</span>
                                    </>
                                )}
                            </div>
                        </Button>
                    </div>
                </GlassCard>

                {/* Quick Info / Protocol Card */}
                <div className="bg-[#1A1A1C]/30 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <div>
                            <p className="text-[10px] font-black text-[#F8F8F8] uppercase tracking-tighter">Secure Terminal</p>
                            <p className="text-[9px] text-[#A1A1AA] font-bold uppercase tracking-widest">Operator: {profile?.full_name?.split(' ')[0]}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-black text-[#D4AF37]">v1.0.4</p>
                        <p className="text-[9px] text-white/20 uppercase font-black">Online</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
