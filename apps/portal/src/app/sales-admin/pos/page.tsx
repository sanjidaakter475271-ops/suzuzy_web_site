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
    ShieldCheck,
    Store,
    LayoutGrid
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
import { cn } from "@/lib/utils";

interface Dealer {
    id: string;
    name: string;
    location?: string;
}

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
    role: string;
}

export default function AdminPOSPage() {
    const { profile } = useUser();

    // Global State
    const [dealers, setDealers] = useState<Dealer[]>([]);
    const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);

    // POS State
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    // Customer Selection
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

    const scanInputRef = useRef<HTMLInputElement>(null);

    // Initial Fetch: Get Dealers
    useEffect(() => {
        const fetchDealers = async () => {
            const { data } = await supabase
                .from('dealers')
                .select('id, name, location')
                .eq('status', 'active')
                .order('name');
            if (data) setDealers(data);
        };
        fetchDealers();
    }, []);

    // Fetch Products when Dealer Changes
    useEffect(() => {
        if (selectedDealer) {
            fetchProducts(selectedDealer.id);
            setCart([]); // Clear cart on dealer switch
            setSelectedCustomer(null);
        }
    }, [selectedDealer]);

    const fetchProducts = async (dealerId: string) => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from("product_variants")
                .select(`
                    id, product_id, sku, barcode, stock_quantity, price,
                    products (name)
                `)
                .eq("products.dealer_id", dealerId)
                .gt("stock_quantity", 0);

            if (data) setVariants(data as any);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        const { data } = await supabase
            .from("profiles")
            .select("id, full_name, phone, email, role")
            .in("role", ["customer", "dealer_staff", "dealer_manager"]) // Expanded customer pool
            .ilike("full_name", `%${customerSearch}%`)
            .limit(10);

        if (data) setCustomers(data);
    };

    // Trigger customer fetch when dialog opens or search changes
    useEffect(() => {
        if (isCustomerDialogOpen) {
            fetchCustomers();
        }
    }, [isCustomerDialogOpen, customerSearch]);


    const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const barcode = searchQuery.trim();
            const variant = variants.find(v => v.barcode === barcode || v.sku === barcode);
            if (variant) {
                addToCart(variant);
                setSearchQuery("");
                // Play simplified beep if desired
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
        if (cart.length === 0 || !selectedDealer) return;

        try {
            setCheckoutLoading(true);

            // Call the atomic transaction RPC
            const { data: saleId, error: rpcErr } = await supabase.rpc('create_sale_transaction', {
                p_dealer_id: selectedDealer.id,
                p_customer_id: selectedCustomer?.id || null, // Allow guest checkout if no customer
                p_subtotal: subtotal,
                p_tax_amount: tax,
                p_grand_total: total,
                p_payment_method: 'cash', // Default to cash for now
                p_items: cart
            });

            if (rpcErr) throw rpcErr;

            // Success feedback
            // Could add toast here
            setCart([]);
            setSelectedCustomer(null);
            fetchProducts(selectedDealer.id); // Refresh stock
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Transaction failed. Please check logs.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const filteredVariants = variants.filter(v =>
        v.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.barcode && v.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Render Dealer Selector if no dealer selected
    if (!selectedDealer) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-6">
                <GlassCard className="w-full max-w-4xl p-12 flex flex-col items-center text-center space-y-8 border-[#D4AF37]/20">
                    <div className="w-24 h-24 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 mb-4">
                        <Store className="w-10 h-10 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-black text-[#F8F8F8] italic tracking-tighter mb-2">
                            Select Dealer Context
                        </h1>
                        <p className="text-white/40 text-lg">Choose a dealer to initiate the Point of Sale terminal.</p>
                    </div>

                    <div className="w-full max-w-md relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input
                            placeholder="Search active dealers..."
                            className="h-16 pl-12 bg-white/5 border-white/10 rounded-2xl text-lg"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-8">
                        {dealers.map(dealer => (
                            <button
                                key={dealer.id}
                                onClick={() => setSelectedDealer(dealer)}
                                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/30 transition-all group text-left"
                            >
                                <h3 className="font-bold text-[#F8F8F8] group-hover:text-[#D4AF37] transition-colors">{dealer.name}</h3>
                                {dealer.location && <p className="text-xs text-white/30 mt-1 flex items-center gap-1"><Store className="w-3 h-3" /> {dealer.location}</p>}
                            </button>
                        ))}
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 overflow-hidden">
            {/* Left: Product Grid & Search */}
            <div className="flex-1 flex flex-col min-w-0 space-y-6">

                {/* Context Bar */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedDealer(null)}
                            className="h-10 px-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl text-xs uppercase font-bold tracking-widest"
                        >
                            Change Dealer
                        </Button>
                        <div className="h-4 w-px bg-white/10" />
                        <div>
                            <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Active Context</p>
                            <p className="text-sm font-black text-[#D4AF37]">{selectedDealer.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-green-500/20 text-green-500 bg-green-500/5 text-[10px] font-bold uppercase tracking-widest py-1 px-3">
                            <Zap className="w-3 h-3 mr-1" /> System Online
                        </Badge>
                    </div>
                </div>

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
                            placeholder="Scan Barcode or Search Inventory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleBarcodeScan}
                            className="h-14 bg-white/[0.02] border-white/5 rounded-2xl pl-16 text-sm font-medium focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]/30 transition-all placeholder:text-white/10"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            <Badge variant="outline" className="border-white/5 bg-white/5 text-[10px] text-white/20 tracking-widest font-black uppercase py-1">Scanner Ready</Badge>
                        </div>
                    </div>

                    <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-14 px-8 border-white/5 bg-white/[0.02] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#D4AF37] transition-all gap-3">
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
                                    className="bg-white/5 border-white/10 h-10 rounded-xl"
                                />
                                <ScrollArea className="h-64">
                                    <div className="space-y-2">
                                        {customers.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => { setSelectedCustomer(c); setIsCustomerDialogOpen(false); }}
                                                className="w-full p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/20 transition-all text-left group flex justify-between items-center"
                                            >
                                                <div>
                                                    <p className="text-sm font-black text-[#F8F8F8] group-hover:text-[#D4AF37]">{c.full_name}</p>
                                                    <p className="text-[10px] text-white/20 font-bold tracking-widest mt-0.5">{c.phone}</p>
                                                </div>
                                                <Badge variant="outline" className="border-white/5 text-[9px] uppercase">{c.role}</Badge>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
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
                    ) : variants.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <Store className="w-16 h-16 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">No products found for this dealer</p>
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
            <div className="w-[400px] flex flex-col space-y-6">
                <GlassCard className="flex-1 flex flex-col border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

                    {/* Cart Header */}
                    <div className="p-6 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-5 h-5 text-[#D4AF37]" strokeWidth={2.5} />
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#F8F8F8]">Transaction</h2>
                        </div>
                        <Badge className="bg-white/5 text-white/40 border-none px-2.5 py-1 text-[10px] font-black uppercase">{cart.reduce((a, b) => a + b.quantity, 0)} Items</Badge>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 min-h-0 px-6 py-4 overflow-y-auto custom-scrollbar space-y-3">
                        <AnimatePresence initial={false}>
                            {cart.length > 0 ? (
                                cart.map((item) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        key={item.id}
                                        className="group p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[11px] font-black text-white leading-snug truncate uppercase italic">{item.products.name}</h4>
                                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">৳{item.price.toLocaleString()} x {item.quantity}</p>
                                            </div>
                                            <button
                                                onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                                                className="text-white/10 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center bg-white/5 rounded-lg p-0.5">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-7 h-7 rounded-md flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-xs font-black text-[#F8F8F8]">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-7 h-7 rounded-md flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <p className="text-xs font-black text-[#D4AF37] tracking-tight">৳{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-10">
                                    <ShoppingCart className="w-16 h-16 mb-4" strokeWidth={1} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Cart is Empty</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Calculation & Action */}
                    <div className="p-6 bg-[#1A1A1C]/50 backdrop-blur-md border-t border-white/5 space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                <span>Sub-Total</span>
                                <span>৳{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                <span>Tax (5%)</span>
                                <span>৳{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Total Due</span>
                                <span className="text-2xl font-display font-black text-[#F8F8F8] tracking-tighter">৳{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="h-12 border-white/5 bg-white/[0.02] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                <QrCode className="w-3.5 h-3.5 mr-2 text-[#D4AF37]" />
                                Split
                            </Button>
                            <Button variant="outline" className="h-12 border-white/5 bg-white/[0.02] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                <Banknote className="w-3.5 h-3.5 mr-2 text-green-500" />
                                Cash
                            </Button>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || checkoutLoading}
                            className="w-full h-14 bg-[#D4AF37] hover:bg-[#B8962E] text-[#0D0D0F] font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_12px_32px_rgba(212,175,55,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="flex items-center justify-center gap-2">
                                {checkoutLoading ? (
                                    <div className="w-4 h-4 border-2 border-[#0D0D0F]/30 border-t-[#0D0D0F] rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 fill-[#0D0D0F]" />
                                        <span>Confirm Sales Record</span>
                                    </>
                                )}
                            </div>
                        </Button>
                    </div>
                </GlassCard>

                {/* Quick Info / Protocol Card */}
                <div className="bg-[#1A1A1C]/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <div>
                            <p className="text-[9px] font-black text-[#F8F8F8] uppercase tracking-tighter">Admin Override</p>
                            <p className="text-[8px] text-[#A1A1AA] font-bold uppercase tracking-widest">{profile?.full_name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-[#D4AF37]">ADMIN POS</p>
                        <p className="text-[8px] text-white/20 uppercase font-black">Authorized</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
