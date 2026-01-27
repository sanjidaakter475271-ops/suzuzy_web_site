"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Shield,
    Mail,
    Phone,
    Clock,
    ChevronLeft,
    BarChart3,
    ShoppingBag,
    Zap,
    Lock,
    Unlock,
    AlertCircle,
    Loader2,
    Calendar,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Profile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    status: 'active' | 'suspended' | 'pending';
    onboarding_completed: boolean;
    created_at: string;
}

interface Order {
    id: string;
    order_number: string;
    created_at: string;
    total_amount: number;
    status: string;
}

interface Payment {
    id: string;
    transaction_id?: string;
    created_at: string;
    amount: number;
    status: string;
}

interface RoleData {
    orders: Order[];
    payments: Payment[];
}

export default function UserPortfolioPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [roleData, setRoleData] = useState<RoleData>({ orders: [], payments: [] });

    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // 1. Fetch Core Profile
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setProfile(profileData);

                // 2. Fetch Role-Specific Intelligence
                const data: RoleData = { orders: [], payments: [] };
                if (profileData.role.includes('dealer')) {
                    const { data: orders } = await supabase.from('orders').select('*').eq('dealer_id', id).order('created_at', { ascending: false });
                    const { data: payments } = await supabase.from('payments').select('*').eq('dealer_id', id).order('created_at', { ascending: false });
                    data.orders = (orders as Order[]) || [];
                    data.payments = (payments as Payment[]) || [];
                } else if (profileData.role === 'customer') {
                    const { data: orders } = await supabase.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false });
                    data.orders = (orders as Order[]) || [];
                } else if (profileData.role === 'accountant') {
                    const { data: payments } = await supabase.from('payments').select('*').limit(20).order('created_at', { ascending: false });
                    data.payments = (payments as Payment[]) || [];
                }
                setRoleData(data);

            } catch (error: unknown) {
                console.error("Portfolio retrieval failed:", error);
                toast.error("User profile encrypted or missing");
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, [id]);

    if (loading) {
        return (
            <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Accessing Portfolio Cryptography...</p>
            </div>
        );
    }

    if (!profile) return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-6 p-20 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-black text-white italic">Clearance Denied</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest">This user does not exist or your tokens are invalid</p>
            </div>
            <Button onClick={() => router.push('/super-admin/users')} variant="outline" className="border-white/10 text-white/60 hover:text-white">
                Back to Command Center
            </Button>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-8 pt-0">
            {/* Header / Navigation */}
            <div className="flex items-center gap-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group h-12 w-12 rounded-2xl border border-[#D4AF37]/10 hover:bg-[#D4AF37]/10 transition-all flex-shrink-0"
                >
                    <ChevronLeft className="w-5 h-5 text-[#D4AF37] group-hover:-translate-x-1 transition-transform" />
                </Button>
                <div>
                    <h2 className="text-3xl font-display font-black italic tracking-tight text-[#F8F8F8] leading-none">
                        PORTFOLIO <span className="text-[#D4AF37]">COMMAND</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black mt-2">
                        Personnel Identity & Operational Intelligence
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Identity Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0D0D0F]/40 backdrop-blur-2xl rounded-[2.5rem] border border-[#D4AF37]/10 p-8 space-y-8 relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-500 shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 blur-[80px] rounded-full group-hover:bg-[#D4AF37]/10 transition-colors" />

                        <div className="relative flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 rounded-3xl bg-[#D4AF37]/5 border-2 border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-display font-black text-4xl shadow-[0_0_30px_rgba(212,175,55,0.1)] skew-x-3 group-hover:skew-x-0 transition-all duration-700">
                                {profile.full_name[0]}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-[#F8F8F8] tracking-tight">{profile.full_name}</h3>
                                <div className="flex items-center justify-center gap-2">
                                    <Shield className="w-3 h-3 text-[#D4AF37]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] italic">{profile.role.replace('_', ' ')}</span>
                                </div>
                            </div>
                            <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${profile.status === 'active'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                                : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                                }`}>
                                {profile.status}
                            </Badge>
                        </div>

                        <div className="space-y-4 relative">
                            <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                <div className="flex items-center gap-4 group/item">
                                    <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-mono text-[#A1A1AA] group-hover/item:text-[#D4AF37] transition-colors">{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-mono text-[#A1A1AA] group-hover/item:text-[#D4AF37] transition-colors">{profile.phone || 'NO SECURE LINE'}</span>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-mono text-[#A1A1AA] group-hover/item:text-[#D4AF37] transition-colors">EST. {format(new Date(profile.created_at), 'MMM dd, yyyy')}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-[0.2em] text-white/30">
                                    <span>Clearance Progress</span>
                                    {profile.onboarding_completed ? (
                                        <span className="text-green-500 flex items-center gap-1.5"><Unlock className="w-3 h-3" /> FULLY AUTHORIZED</span>
                                    ) : (
                                        <span className="text-amber-500 flex items-center gap-1.5 animate-pulse"><Lock className="w-3 h-3" /> PENDING SETUP</span>
                                    )}
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                    <div
                                        className={`h-full transition-all duration-1500 rounded-full ${profile.onboarding_completed
                                            ? 'w-full bg-gradient-to-r from-green-500/50 to-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                            : 'w-1/3 bg-gradient-to-r from-amber-500/50 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/0 border border-[#D4AF37]/10 relative overflow-hidden group hover:bg-[#D4AF37]/5 transition-all duration-700 shadow-xl">
                        <Zap className="absolute -top-4 -right-4 w-24 h-24 text-[#D4AF37]/5 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-6 flex items-center gap-2">
                            <div className="w-1 h-3 bg-[#D4AF37]" /> System Handlers
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            <Button variant="outline" className="h-12 text-[10px] uppercase font-black tracking-widest border-white/5 bg-white/5 hover:bg-[#D4AF37] hover:text-[#0D0D0F] hover:border-[#D4AF37] transition-all rounded-xl flex items-center justify-between px-6">
                                Update Clearance <Shield className="w-4 h-4 ml-2" />
                            </Button>
                            <Button variant="outline" className="h-12 text-[10px] uppercase font-black tracking-widest border-white/5 bg-white/5 hover:bg-white/10 transition-all rounded-xl flex items-center justify-between px-6">
                                System Logs <Clock className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Portfolio Data Intelligence */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Visual Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-[#0D0D0F]/40 backdrop-blur-2xl rounded-3xl border border-[#D4AF37]/10 p-6 flex items-center gap-6 group hover:border-[#D4AF37]/40 transition-all shadow-xl"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-inner group-hover:bg-[#D4AF37]/10 transition-colors">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Total Orders</p>
                                <p className="text-2xl font-black text-[#F8F8F8] italic tracking-tighter">
                                    {roleData?.orders?.length || 0} Units
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-[#0D0D0F]/40 backdrop-blur-2xl rounded-3xl border border-[#D4AF37]/10 p-6 flex items-center gap-6 group hover:border-[#D4AF37]/40 transition-all shadow-xl"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-inner group-hover:bg-[#D4AF37]/10 transition-colors">
                                <BarChart3 className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Account Value</p>
                                <p className="text-2xl font-black text-[#F8F8F8] italic tracking-tighter">
                                    ${roleData?.orders?.reduce((acc: number, curr: Order) => acc + (curr.total_amount || 0), 0).toLocaleString() || '0'}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Operational Manifest */}
                    <div className="bg-[#0D0D0F]/40 backdrop-blur-2xl rounded-[2.5rem] border border-[#D4AF37]/10 p-8 relative overflow-hidden h-full min-h-[500px] shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent" />

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-8 bg-[#D4AF37]" />
                                <div>
                                    <h4 className="text-xl font-black text-white italic tracking-tight uppercase">Operational Manifest</h4>
                                    <p className="text-[10px] uppercase font-black text-white/20 tracking-widest">Personnel transaction history</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="h-10 text-[10px] uppercase font-black tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/10 hover:bg-[#D4AF37]/10 rounded-xl px-6">
                                Synchronize <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                        </div>

                        {(roleData?.orders?.length > 0 || roleData?.payments?.length > 0) ? (
                            <div className="grid grid-cols-1 gap-8">
                                {roleData?.orders?.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Recent Orders</span>
                                        </div>
                                        {roleData.orders.map((order: Order) => (
                                            <div key={order.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                                        <ShoppingBag className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">Order #{order.order_number}</p>
                                                        <p className="text-[10px] text-white/40 uppercase tracking-tighter">{format(new Date(order.created_at), 'MMM dd, p')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-mono font-bold text-[#D4AF37]">${order.total_amount?.toLocaleString()}</p>
                                                    <Badge variant="outline" className="text-[8px] uppercase tracking-tighter border-white/10 text-white/40">
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {roleData?.payments?.length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Financial Transactions</span>
                                        </div>
                                        {roleData.payments.map((payment: Payment) => (
                                            <div key={payment.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                                        <Zap className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">Payment #{payment.transaction_id || payment.id.slice(0, 8)}</p>
                                                        <p className="text-[10px] text-white/40 uppercase tracking-tighter">{format(new Date(payment.created_at), 'MMM dd, p')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-mono font-bold text-green-500">+${payment.amount?.toLocaleString()}</p>
                                                    <Badge variant="outline" className="text-[8px] uppercase tracking-tighter border-white/10 text-white/40">
                                                        {payment.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[350px] border-2 border-dashed border-white/5 rounded-[2.5rem] group hover:border-[#D4AF37]/20 transition-all duration-700 bg-white/[0.01]">
                                <div className="relative w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/10 group-hover:text-[#D4AF37] group-hover:bg-black group-hover:border-[#D4AF37]/30 group-hover:scale-110 transition-all duration-500 shadow-inner">
                                    <AlertCircle className="w-12 h-12" />
                                </div>
                                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic group-hover:text-white/40 transition-colors">
                                    NO PROTOCOLS LOGGED
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Aesthetic Grid Background */}
            <div className="fixed inset-0 z-[-1] pointer-events-none opacity-20"
                style={{
                    backgroundImage: `radial-gradient(#D4AF37 0.5px, transparent 0.5px)`,
                    backgroundSize: '24px 24px'
                }}
            />
        </div>
    );
}
