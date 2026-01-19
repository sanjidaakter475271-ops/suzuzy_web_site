"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Shield,
    Mail,
    Phone,
    UserCircle,
    Loader2,
    ShieldCheck,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Role {
    id: string;
    name: string;
    display_name: string;
    level: number;
}

export default function NewPersonnelPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        role_id: ""
    });

    useEffect(() => {
        const fetchRoles = async () => {
            const { data } = await supabase
                .from('roles')
                .select('*')
                .filter('role_type', 'eq', 'system')
                .order('level', { ascending: true });

            setRoles(data || []);
        };
        fetchRoles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Note: In client-side Supabase, we can't create other users without signing out oneself
            // unless we have an Edge Function or use an admin client.
            // For this UI demonstration and "insurance" of logic:
            // We'll perform the profile insertion which effectively binds the role
            // once the user signs up with the same email.

            // To properly "Create User", we'd need an Edge Function call here.

            const selectedRole = roles.find(r => r.id === formData.role_id);

            const { data, error } = await supabase.functions.invoke('create-admin-user-v2', {
                body: {
                    email: formData.email,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    role_id: formData.role_id,
                    role: selectedRole?.name
                }
            });

            if (error) throw error;

            toast.success("Personnel Authorized & Protocol Initialized");
            router.push("/super-admin/users");
        } catch (error) {
            console.error("Error creating personnel:", error);
            toast.error("Protocol Rejection: Database Integrity Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="space-y-4">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-[10px] font-black text-[#A1A1AA] hover:text-[#D4AF37] transition-all uppercase tracking-widest"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Abort Authorization
                </button>
                <div className="flex flex-col gap-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        AUTHORIZE <span className="text-[#D4AF37]">PERSONNEL</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                        System Authority & Role Delegation
                    </p>
                </div>
            </div>

            <GlassCard className="p-10 border-[#D4AF37]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[80px] rounded-full -mr-20 -mt-20" />

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] ml-1">Identity Profile</Label>
                            <div className="relative group">
                                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                <Input
                                    placeholder="Legal Full Name"
                                    className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/10"
                                    required
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] ml-1">Corporate Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="id@royalconsortium.bh"
                                        className="pl-12 h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white placeholder:text-white/10"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] ml-1">Assigned Role</Label>
                                <Select
                                    onValueChange={(val: string) => setFormData({ ...formData, role_id: val })}
                                    required
                                >
                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all rounded-2xl text-white">
                                        <SelectValue placeholder="Select Authority" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A1C] border-[#D4AF37]/20 text-white">
                                        {roles.map(role => (
                                            <SelectItem key={role.id} value={role.id} className="focus:bg-[#D4AF37]/10 focus:text-[#D4AF37]">
                                                {role.display_name} (L{role.level})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#B8860B] hover:to-[#D4AF37] text-[#0D0D0F] font-black uppercase tracking-widest text-xs relative overflow-hidden group shadow-[0_0_40px_rgba(212,175,55,0.2)]"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5" />
                                        Confirm Authorization
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
