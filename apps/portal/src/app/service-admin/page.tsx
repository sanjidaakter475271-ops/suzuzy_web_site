"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, UserPlus, Wrench, CheckCircle2,
    AlertCircle, Phone, Fingerprint, Bike,
    ArrowRight, Loader2, Plus, Clock, Users, User,
    History, MapPin, Mail, Calendar, Info, RefreshCcw,
    ShieldAlert, ShieldCheck, Trash2, Box, CreditCard, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

interface Ramp {
    id: string;
    ramp_number: number;
    status: 'idle' | 'busy' | 'offline';
    staff_id?: string;
    staff?: { name: string, staff_id: string };
    current_ticket_id?: string;
}

interface Staff {
    id: string;
    staff_id: string;
    name: string;
    is_active: boolean;
}

interface ServiceTicket {
    id: string;
    service_number: string;
    created_at: string;
    updated_at: string;
    status: string;
    service_description: string;
    staff_id: string;
    vehicle_id: string;
    ramp?: { ramp_number: number } | null;
    vehicle?: any;
    staff?: { name: string, staff_id: string };
    requisitions?: any[];
}

const INITIAL_FORM = {
    customer_name: "",
    phone_number: "",
    engine_number: "",
    chassis_number: "",
    model_id: "",
    color: "",
    division: "",
    district_city: "",
    thana_upozilla: "",
    post_office: "",
    village_mahalla_para: "",
    house_road_no: "",
    email: "",
    customer_nid: "",
    profession: "",
    date_of_birth: "",
    weight_kgs: "",
    gender: "",
    previous_bike_model: "",
    bike_driving_place: "",
    road_condition: "",
    date_of_purchase: format(new Date(), 'yyyy-MM-dd'),
    purchase_from: ""
};

export default function ServiceAdminDashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const [history, setHistory] = useState<ServiceTicket[]>([]);
    const [ramps, setRamps] = useState<Ramp[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [bikeModels, setBikeModels] = useState<{ id: string, name: string }[]>([]);
    const [activeTab, setActiveTab] = useState("info");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingVerification, setPendingVerification] = useState<ServiceTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [verifyingProducts, setVerifyingProducts] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        if (selectedTicket) {
            setVerifyingProducts((selectedTicket as any).requisitions || []);
        }
    }, [selectedTicket]);

    const handleProductSearch = async (val: string) => {
        setProductSearch(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        const { data } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${val}%`)
            .limit(5);
        if (data) setSearchResults(data);
    };

    const addProductToVerification = (product: any) => {
        const existing = verifyingProducts.find(p => p.product_id === product.id);
        if (existing) {
            updateProductQty(product.id, existing.quantity + 1);
        } else {
            setVerifyingProducts([...verifyingProducts, {
                product_id: product.id,
                quantity: 1,
                unit_price: product.sale_price,
                product: { name: product.name, sale_price: product.sale_price, stock_quantity: product.stock_quantity }
            }]);
        }
        setProductSearch("");
        setSearchResults([]);
    };

    const updateProductQty = (productId: string, qty: number) => {
        if (qty < 1) return;
        setVerifyingProducts(verifyingProducts.map(p =>
            p.product_id === productId ? { ...p, quantity: qty } : p
        ));
    };

    const removeProduct = (productId: string) => {
        setVerifyingProducts(verifyingProducts.filter(p => p.product_id !== productId));
    };

    const handleFinalSubmit = async () => {
        if (!selectedTicket) return;
        setIsSubmitting(true);

        try {
            // High-Security Atomic Settlement via RPC
            const { error: rpcError } = await supabase.rpc('finalize_service_settlement', {
                p_ticket_id: selectedTicket.id,
                p_verifying_products: verifyingProducts
            });

            if (rpcError) throw rpcError;

            toast.success("Security clearance verified. Resources settled.");
            setIsVerifyModalOpen(false);
            fetchPendingVerification();
        } catch (error: any) {
            toast.error(`Clearance Failed: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchRamps();
        fetchModels();
        fetchStaff();
        fetchPendingVerification();

        const rampSub = supabase
            .channel('service_ramps_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'service_ramps' }, () => {
                fetchRamps();
            })
            .subscribe();

        const ticketSub = supabase
            .channel('service_tickets_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'service_tickets' }, () => {
                fetchPendingVerification();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(rampSub);
            supabase.removeChannel(ticketSub);
        };
    }, []);

    const fetchRamps = async () => {
        const { data } = await supabase
            .from('service_ramps')
            .select('*, staff:service_staff(name, staff_id)')
            .order('ramp_number', { ascending: true });
        if (data) setRamps(data);
    };

    const fetchStaff = async () => {
        const { data } = await supabase.from('service_staff').select('*');
        if (data) setStaff(data || []);
    };

    const fetchPendingVerification = async () => {
        const { data } = await supabase
            .from('service_tickets')
            .select(`
                *,
                vehicle:service_vehicles(*),
                staff:service_staff(name, staff_id),
                requisitions:service_requisitions(*, product:products(name, sale_price, stock_quantity))
            `)
            .eq('status', 'processing_stage_3')
            .order('updated_at', { ascending: false });
        if (data) setPendingVerification(data);
    };

    const fetchModels = async () => {
        const { data } = await supabase.from('bike_models').select('id, name').eq('is_active', true);
        if (data) setBikeModels(data);
    };

    const handleSearch = async (query: string = searchQuery) => {
        if (!query) return;
        setIsSearching(true);

        const { data, error } = await supabase
            .from('service_vehicles')
            .select('*')
            .or(`engine_number.eq.${query},chassis_number.eq.${query},phone_number.eq.${query}`)
            .single();

        if (data) {
            setFormData({
                ...INITIAL_FORM,
                ...data,
                date_of_birth: data.date_of_birth || "",
                date_of_purchase: data.date_of_purchase || format(new Date(), 'yyyy-MM-dd'),
            });
            setIsExistingCustomer(true);
            fetchHistory(data.id);
            toast.success("Record localized. Information populated.");
        } else {
            toast.error("No record detected. System ready for new entry.");
            setIsExistingCustomer(false);
            setFormData({ ...INITIAL_FORM, engine_number: query });
            setHistory([]);
        }
        setIsSearching(false);
    };

    const fetchHistory = async (vehicleId: string) => {
        const { data } = await supabase
            .from('service_tickets')
            .select('*, ramp:service_ramps(ramp_number)')
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: false });
        if (data) setHistory(data);
    };

    const createTicket = async () => {
        setIsSubmitting(true);
        let vehicleId = (formData as any).id;

        // Upsert vehicle first
        const vehicleData = { ...formData };
        if (isExistingCustomer) {
            const { error } = await supabase.from('service_vehicles').update(vehicleData).eq('id', vehicleId);
            if (error) { toast.error("Update failed"); setIsSubmitting(false); return; }
        } else {
            const { data, error } = await supabase.from('service_vehicles').insert([vehicleData]).select().single();
            if (error) { toast.error("Registration failed"); setIsSubmitting(false); return; }
            vehicleId = data.id;
        }

        const srvNumber = `SRV-${Math.floor(Math.random() * 900000) + 100000}`;
        const freeRamp = ramps.find(r => r.status === 'idle');

        const { data: ticket, error: tError } = await supabase
            .from('service_tickets')
            .insert({
                vehicle_id: vehicleId,
                status: freeRamp ? 'in_service' : 'waiting',
                ramp_id: freeRamp?.id,
                staff_id: freeRamp?.staff_id,
                service_number: srvNumber
            })
            .select()
            .single();

        if (tError) {
            toast.error("Ticket generation failed");
        } else {
            if (freeRamp) {
                await supabase.from('service_ramps').update({
                    status: 'busy',
                    current_ticket_id: ticket.id
                }).eq('id', freeRamp.id);
                toast.success(`Ticket ${srvNumber} assigned to Ramp 0${freeRamp.ramp_number} (${freeRamp.staff?.name} | ${freeRamp.staff?.staff_id})`);
            } else {
                toast.success(`Ticket ${srvNumber} placed in waiting queue`);
            }
            handleSearch(formData.engine_number);
            setActiveTab("history");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-8 max-w-[1700px] mx-auto pb-20">
            {/* Command Bar */}
            <header className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-[#F8F8F8] flex items-center gap-3">
                        <RefreshCcw className="w-8 h-8 text-[#D4AF37] animate-spin-slow" />
                        Service Command Center
                    </h1>
                    <p className="text-white/40 text-sm mt-1">Real-time customer tracking and ramp allocation system.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-[350px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                        <Input
                            placeholder="Search Engine / Chassis / Phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="bg-white/[0.03] border-white/5 h-12 pl-10 focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all rounded-xl text-sm"
                        />
                    </div>
                    <Button
                        onClick={() => handleSearch()}
                        className="h-12 px-6 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                        disabled={isSearching}
                    >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "GET INFORMATION"}
                    </Button>
                </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-white/[0.02] border border-white/5 p-1 rounded-2xl h-14">
                    <TabsTrigger value="info" className="rounded-xl px-8 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold tracking-widest text-[10px] h-full transition-all">
                        CUSTOMER INFORMATION
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-8 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold tracking-widest text-[10px] h-full transition-all">
                        SERVICE HISTORY
                    </TabsTrigger>
                    <TabsTrigger value="ramps" className="rounded-xl px-8 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black font-bold tracking-widest text-[10px] h-full transition-all flex gap-2">
                        LIVE RAMPS <Badge className="bg-white/10 text-[8px] px-1.5">{ramps.filter(r => r.status === 'idle').length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="verification" className="rounded-xl px-8 data-[state=active]:bg-[#EF4444] data-[state=active]:text-white font-bold tracking-widest text-[10px] h-full transition-all flex gap-2">
                        PENDING VERIFICATION <Badge className="bg-red-500/20 text-red-500 text-[8px] px-1.5 animate-pulse">{pendingVerification.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Information Form */}
                <TabsContent value="info" className="outline-none focus:ring-0">
                    <Card className="bg-[#0D0D12] border-[#D4AF37]/10 overflow-hidden shadow-2xl">
                        <CardHeader className="bg-white/[0.01] border-b border-white/5 py-8">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-display text-white">Service Registration Matrix</CardTitle>
                                    <CardDescription className="text-white/40">Complete the mandatory fields below to initiate session.</CardDescription>
                                </div>
                                {isExistingCustomer && (
                                    <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-none px-4 py-1.5 font-bold tracking-widest italic animate-pulse">
                                        RECOGNIZED ENTITY
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {/* Core Data */}
                                <div className="md:col-span-1 space-y-6">
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                        <h3 className="text-[10px] font-black tracking-[0.2em] text-[#D4AF37] uppercase mb-4">Core Identifiers</h3>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Engine Number *</Label>
                                            <Input
                                                value={formData.engine_number}
                                                onChange={(e) => setFormData({ ...formData, engine_number: e.target.value.toUpperCase() })}
                                                className="bg-black/40 border-white/10 focus:border-[#D4AF37]/40 h-10 font-mono text-sm uppercase"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Frame Number *</Label>
                                            <Input
                                                value={formData.chassis_number}
                                                onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value.toUpperCase() })}
                                                className="bg-black/40 border-white/10 focus:border-[#D4AF37]/40 h-10 font-mono text-sm uppercase"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Phone Number *</Label>
                                            <Input
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                className="bg-black/40 border-white/10 focus:border-[#D4AF37]/40 h-10 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 space-y-4">
                                        <h3 className="text-[10px] font-black tracking-[0.2em] text-[#D4AF37] uppercase">Action Point</h3>
                                        <Button
                                            onClick={createTicket}
                                            disabled={isSubmitting || !formData.engine_number}
                                            className="w-full h-14 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-black tracking-widest text-[10px] rounded-xl group"
                                        >
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                                <>
                                                    CREATE SERVICE TICKET
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                        <p className="text-[9px] text-white/30 text-center leading-relaxed">
                                            Generating a ticket will automatically allocate a free ramp and technician.
                                        </p>
                                    </div>
                                </div>

                                {/* Detailed Data */}
                                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <FormGroup label="Customer Name *" value={formData.customer_name} onChange={(v) => setFormData({ ...formData, customer_name: v })} icon={<User className="w-3.5 h-3.5" />} />

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Bike Model *</Label>
                                        <Select value={formData.model_id} onValueChange={(v) => setFormData({ ...formData, model_id: v })}>
                                            <SelectTrigger className="bg-white/[0.03] border-white/5 h-10 focus:ring-[#D4AF37]/20 text-sm">
                                                <SelectValue placeholder="Select Model" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0D0D12] border-white/10 text-white">
                                                {bikeModels.map(m => (
                                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <FormGroup label="Color *" value={formData.color} onChange={(v) => setFormData({ ...formData, color: v })} />
                                    <FormGroup label="Division" value={formData.division} onChange={(v) => setFormData({ ...formData, division: v })} />
                                    <FormGroup label="District / City" value={formData.district_city} onChange={(v) => setFormData({ ...formData, district_city: v })} />
                                    <FormGroup label="Thana / Upozilla" value={formData.thana_upozilla} onChange={(v) => setFormData({ ...formData, thana_upozilla: v })} />
                                    <FormGroup label="Email Address" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} icon={<Mail className="w-3.5 h-3.5" />} />
                                    <FormGroup label="Customer NID" value={formData.customer_nid} onChange={(v) => setFormData({ ...formData, customer_nid: v })} />
                                    <FormGroup label="Profession" value={formData.profession} onChange={(v) => setFormData({ ...formData, profession: v })} />

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Date of Birth</Label>
                                        <Input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="bg-white/[0.03] border-white/5 h-10 text-sm invert opacity-60" />
                                    </div>

                                    <FormGroup label="Weight (kgs)" value={formData.weight_kgs} onChange={(v) => setFormData({ ...formData, weight_kgs: v })} />

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Gender</Label>
                                        <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                                            <SelectTrigger className="bg-white/[0.03] border-white/5 h-10 text-sm">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0D0D12] border-white/10 text-white">
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <FormGroup label="Previous Bike" value={formData.previous_bike_model} onChange={(v) => setFormData({ ...formData, previous_bike_model: v })} />
                                    <FormGroup label="Road Condition" value={formData.road_condition} onChange={(v) => setFormData({ ...formData, road_condition: v })} />

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Date of Purchase</Label>
                                        <Input type="date" value={formData.date_of_purchase} onChange={(e) => setFormData({ ...formData, date_of_purchase: e.target.value })} className="bg-white/[0.03] border-white/5 h-10 text-sm invert opacity-60" />
                                    </div>

                                    <FormGroup label="Purchase From" value={formData.purchase_from} onChange={(v) => setFormData({ ...formData, purchase_from: v })} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Service History */}
                <TabsContent value="history" className="outline-none focus:ring-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Summary Side */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="bg-[#0D0D12] border-[#D4AF37]/10 overflow-hidden">
                                <CardHeader className="border-b border-white/5">
                                    <CardTitle className="text-sm font-display uppercase tracking-widest text-[#D4AF37]">Profile Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                            <Fingerprint className="w-8 h-8 text-[#D4AF37]" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{formData.customer_name || "Unknown"}</h4>
                                            <p className="text-xs text-white/40">{formData.phone_number}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Total Visits</p>
                                            <p className="text-xl font-bold text-[#D4AF37]">{history.length}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Status</p>
                                            <p className="text-xs font-bold text-[#10B981]">ACTIVE</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* History Timeline */}
                        <div className="lg:col-span-8">
                            <div className="space-y-4">
                                {history.length === 0 ? (
                                    <div className="h-[400px] flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.01] text-center p-8">
                                        <History className="w-16 h-16 text-white/5 mb-4" />
                                        <h3 className="text-lg font-bold text-white/40">No records discovered</h3>
                                        <p className="text-sm text-white/20 max-w-xs mt-2">This customer has no previous service sessions recorded in the matrix.</p>
                                    </div>
                                ) : (
                                    history.map((ticket, idx) => (
                                        <motion.div
                                            key={ticket.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-6 rounded-2xl bg-[#0D0D12] border border-white/5 hover:border-[#D4AF37]/20 transition-all flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                                                    {history.length - idx}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-black text-white px-2 py-0.5 bg-white/5 rounded border border-white/5">{ticket.service_number}</span>
                                                        <Badge variant="outline" className="text-[9px] border-[#D4AF37]/20 text-[#D4AF37]">{ticket.status.toUpperCase()}</Badge>
                                                    </div>
                                                    <p className="text-xs text-white/40">Session Date: {format(new Date(ticket.created_at), 'PPP p')}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                {ticket.ramp && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-white/20 uppercase font-bold">Ramp Allocation</p>
                                                        <p className="text-sm font-bold text-white/80">Ramp 0{ticket.ramp.ramp_number}</p>
                                                    </div>
                                                )}
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-white/5 text-white/20 hover:text-[#D4AF37]">
                                                    <Info className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Live Ramps */}
                <TabsContent value="ramps" className="outline-none focus:ring-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                        {ramps.map((ramp) => (
                            <motion.div
                                key={ramp.id}
                                layout
                                className={`relative group h-48 rounded-3xl border transition-all overflow-hidden p-6 ${ramp.status === 'busy'
                                    ? 'bg-[#0F0F15] border-[#EF4444]/20 shadow-[0_8px_32px_rgba(239,68,68,0.1)]'
                                    : 'bg-[#0D0D12] border-white/5 hover:border-[#D4AF37]/30'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase mb-1">Ramp Unit</span>
                                        <span className="text-2xl font-display font-bold text-white">0{ramp.ramp_number}</span>
                                    </div>
                                    <Badge className={`px-4 py-1 border-none font-black text-[10px] tracking-widest ${ramp.status === 'busy' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#10B981]/10 text-[#10B981]'
                                        }`}>
                                        {ramp.status.toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    {ramp.status === 'busy' ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-xs font-bold text-white/60">{ramp.staff?.name || "Assigning..."}</p>
                                                    {ramp.staff?.staff_id && <p className="text-[9px] font-mono text-white/30">{ramp.staff.staff_id}</p>}
                                                </div>
                                            </div>
                                            <div className="relative pt-2">
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        animate={{ x: ["-100%", "100%"] }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                        className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#EF4444] to-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center opacity-10 group-hover:opacity-30 transition-all pt-2">
                                            <CheckCircle2 className="w-12 h-12 text-[#10B981] mb-2" />
                                            <p className="text-[10px] font-black tracking-widest uppercase">Operational</p>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>

                {/* Pending Verification Board */}
                <TabsContent value="verification" className="outline-none focus:ring-0">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                    <ShieldAlert className="w-6 h-6 text-[#EF4444]" />
                                    Terminal Verification
                                </h2>
                                <p className="text-white/40 text-sm mt-1">Review items, verify pricing, and authorized stock release.</p>
                            </div>
                        </div>

                        {pendingVerification.length === 0 ? (
                            <div className="h-[400px] flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.01] text-center p-8">
                                <ShieldCheck className="w-16 h-16 text-white/5 mb-4" />
                                <h3 className="text-lg font-bold text-white/40">No pending clearances</h3>
                                <p className="text-sm text-white/20 max-w-xs mt-2">All technician submissions have been verified and settled.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {pendingVerification.map((ticket) => (
                                    <motion.div
                                        key={ticket.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-6 rounded-3xl bg-[#0D0D12] border border-[#EF4444]/20 hover:border-[#EF4444]/40 transition-all flex flex-col md:flex-row gap-6 justify-between items-center group relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-6 z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center border border-[#EF4444]/20">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-[#EF4444] uppercase leading-none">Stage</p>
                                                    <p className="text-lg font-bold text-white">03</p>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-black text-white px-2 py-0.5 bg-white/5 rounded border border-white/5 text-mono uppercase">{ticket.service_number}</span>
                                                    <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-none text-[8px] font-black tracking-widest italic">AWAITING CLEARANCE</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-white/40 font-medium">
                                                    <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-[#D4AF37]/50" /> {ticket.staff?.name}</span>
                                                    <span className="flex items-center gap-1.5"><Bike className="w-3 h-3 text-[#D4AF37]/50" /> {ticket.vehicle?.engine_number}</span>
                                                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#D4AF37]/50" /> {format(new Date(ticket.updated_at), 'p')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                                            <div className="text-right hidden lg:block">
                                                <p className="text-[10px] text-white/20 uppercase font-black tracking-tighter">Items Logged</p>
                                                <p className="text-sm font-bold text-white">{(ticket as any).requisitions?.length || 0} Products</p>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    setSelectedTicket(ticket);
                                                    setIsVerifyModalOpen(true);
                                                }}
                                                className="w-full md:w-auto h-12 px-8 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-black rounded-xl shadow-[0_8px_32px_rgba(239,68,68,0.2)] flex gap-3"
                                            >
                                                OPEN CLEARANCE MATRIX
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#EF4444]/5 to-transparent pointer-events-none" />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Verification & Clearance Modal */}
            <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
                <DialogContent className="max-w-5xl bg-[#0D0D12] border-white/5 p-0 overflow-hidden rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 h-[85vh]">
                        {/* Sidebar: Customer & Bike Info */}
                        <div className="lg:col-span-4 bg-white/[0.02] border-r border-white/5 p-8 space-y-8 overflow-y-auto">
                            <DialogHeader>
                                <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center mb-4 border border-[#EF4444]/20">
                                    <ShieldAlert className="w-6 h-6 text-[#EF4444]" />
                                </div>
                                <DialogTitle className="text-2xl font-display font-bold text-white uppercase tracking-tight">Security Clearance</DialogTitle>
                                <DialogDescription className="text-white/40 text-xs uppercase tracking-widest font-black">Authorized Personnel Only</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black tracking-[0.2em] text-[#D4AF37] uppercase opacity-50">Origin Entity</h4>
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/40 font-bold uppercase tracking-widest">Name</span>
                                            <span className="text-white font-black">{selectedTicket?.vehicle?.customer_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/40 font-bold uppercase tracking-widest">Phone</span>
                                            <span className="text-white font-black">{selectedTicket?.vehicle?.phone_number}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/40 font-bold uppercase tracking-widest">NID</span>
                                            <span className="text-white font-black">{selectedTicket?.vehicle?.customer_nid || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black tracking-[0.2em] text-[#D4AF37] uppercase opacity-50">Equipment Specs</h4>
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/40 font-bold uppercase tracking-widest">Frame</span>
                                            <span className="text-white font-mono font-black">{selectedTicket?.vehicle?.chassis_number}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/40 font-bold uppercase tracking-widest">Engine</span>
                                            <span className="text-white font-mono font-black">{selectedTicket?.vehicle?.engine_number}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-[#D4AF37]">
                                            <span className="font-bold uppercase tracking-widest">Staff Assigned</span>
                                            <span className="font-black">{selectedTicket?.staff?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Interaction: Product List & Modification */}
                        <div className="lg:col-span-8 p-8 flex flex-col h-full bg-[#0F0F15]">
                            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-xl font-display font-bold text-white">Itemized Resource Matrix</h3>
                                        <p className="text-white/20 text-xs mt-1">Add, remove or modify hardware consumption.</p>
                                    </div>
                                    <div className="relative group/search w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within/search:text-[#D4AF37] transition-colors" />
                                        <Input
                                            placeholder="SCAN OR ADD ITEM..."
                                            value={productSearch}
                                            onChange={(e) => handleProductSearch(e.target.value)}
                                            className="bg-white/[0.03] border-white/5 h-10 pl-10 text-[10px] font-black tracking-widest uppercase focus:border-[#D4AF37]/40"
                                        />
                                        <AnimatePresence>
                                            {searchResults.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="absolute top-full mt-2 w-full bg-[#1A1A24] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[100]"
                                                >
                                                    {searchResults.map(p => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => addProductToVerification(p)}
                                                            className="w-full p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-none group/item"
                                                        >
                                                            <div className="text-left">
                                                                <p className="text-xs font-bold text-white">{p.name}</p>
                                                                <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-tighter">Stock: {p.stock_quantity}</p>
                                                            </div>
                                                            <Plus className="w-4 h-4 text-white/20 group-hover/item:text-[#D4AF37]" />
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
                                    <Table>
                                        <TableHeader className="bg-white/[0.02]">
                                            <TableRow className="border-white/5 hover:bg-transparent">
                                                <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 h-10">Resource</TableHead>
                                                <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 h-10">Unit Price</TableHead>
                                                <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 h-10">Quantity</TableHead>
                                                <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 h-10 text-right">Total</TableHead>
                                                <TableHead className="h-10 w-10"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {verifyingProducts.map((p, idx) => (
                                                <TableRow key={idx} className="border-white/5 hover:bg-white/[0.01] transition-all">
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                                <Box className="w-4 h-4 text-white/20" />
                                                            </div>
                                                            <p className="text-xs font-bold text-white">{p.product?.name}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-mono text-white/60">৳{p.unit_price?.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateProductQty(p.product_id, p.quantity - 1)}
                                                                className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"
                                                            >-</button>
                                                            <span className="text-xs font-black min-w-[1.5rem] text-center text-[#D4AF37]">{p.quantity}</span>
                                                            <button
                                                                onClick={() => updateProductQty(p.product_id, p.quantity + 1)}
                                                                className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"
                                                            >+</button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-black text-white">৳{(p.unit_price * p.quantity).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <button
                                                            onClick={() => removeProduct(p.product_id)}
                                                            className="text-white/10 hover:text-[#EF4444] transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">Settlement Total</p>
                                    <h2 className="text-4xl font-display font-black text-white tracking-tight">
                                        ৳{verifyingProducts.reduce((acc, p) => acc + (p.unit_price * p.quantity), 0).toLocaleString()}
                                    </h2>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsVerifyModalOpen(false)}
                                        className="h-14 px-8 border-white/10 hover:bg-white/5 text-xs font-black tracking-widest uppercase rounded-2xl"
                                    >
                                        ABORT
                                    </Button>
                                    <Button
                                        disabled={isSubmitting}
                                        onClick={handleFinalSubmit}
                                        className="h-14 px-10 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-black tracking-widest uppercase rounded-2xl shadow-[0_12px_48px_rgba(239,68,68,0.3)] flex gap-4"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4" /> EXECUTE SETTLEMENT</>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function FormGroup({ label, value, onChange, icon }: { label: string, value: string, onChange: (v: string) => void, icon?: any }) {
    return (
        <div className="space-y-2">
            <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</Label>
            <div className="relative group/field">
                {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-[#D4AF37] transition-colors">{icon}</div>}
                <Input
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className={`bg-white/[0.03] border-white/5 h-10 text-sm focus:border-[#D4AF37]/40 ${icon ? 'pl-9' : ''}`}
                />
            </div>
        </div>
    );
}
