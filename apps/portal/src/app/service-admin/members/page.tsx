"use client";

import { useState, useEffect } from "react";
import {
    Users, UserPlus, Search, ShieldCheck, ShieldAlert,
    MoreHorizontal, Mail, Phone, Fingerprint, MapPin,
    ArrowRight, Loader2, Filter, CheckCircle2, XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface StaffMember {
    id: string;
    staff_id: string;
    name: string;
    email: string;
    phone: string;
    nid: string;
    designation: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    is_active: boolean;
}

const INITIAL_STAFF_FORM = {
    name: "",
    email: "",
    phone: "",
    nid: "",
    designation: "Technician",
};

export default function TeamMembersPage() {
    const [members, setMembers] = useState<StaffMember[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [formData, setFormData] = useState(INITIAL_STAFF_FORM);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('service_staff')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setMembers(data);
        setIsLoading(false);
    };

    const handleSearch = async () => {
        setIsLoading(true);
        let query = supabase.from('service_staff').select('*');

        if (searchQuery) {
            query = query.or(`phone.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,staff_id.ilike.%${searchQuery}%`);
        }

        const { data } = await query.order('created_at', { ascending: false });
        if (data) setMembers(data);
        setIsLoading(false);
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { data, error } = await supabase
            .from('service_staff')
            .insert([{ ...formData, status: 'approved' }])
            .select();

        if (error) {
            toast.error("Failed to add member: " + error.message);
        } else {
            toast.success("New technician deployed to the matrix.");
            setIsAddDialogOpen(false);
            setFormData(INITIAL_STAFF_FORM);
            fetchMembers();
        }
        setIsSubmitting(false);
    };

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('service_staff')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            toast.error("Operation failed");
        } else {
            toast.success(`Member status updated to ${newStatus}`);
            fetchMembers();
        }
    };

    return (
        <div className="space-y-8 max-w-[1700px] mx-auto pb-20">
            {/* Header Area */}
            <header className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-[#F8F8F8] flex items-center gap-3">
                        <Users className="w-8 h-8 text-[#D4AF37]" />
                        Technician Matrix
                    </h1>
                    <p className="text-white/40 text-sm mt-1">Manage, oversee, and authorize service team members.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-[350px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                        <Input
                            placeholder="Find technician by phone/name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="bg-white/[0.03] border-white/5 h-12 pl-10 focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all rounded-xl text-sm"
                        />
                    </div>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] flex gap-2">
                                <UserPlus className="w-4 h-4" />
                                ADD TECHNICIAN
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0D0D12] border-[#D4AF37]/20 text-white max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-display text-[#D4AF37]">Onboard New Technician</DialogTitle>
                                <DialogDescription className="text-white/40">Register a new member to the service matrix. Credentials will be required for app sync.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddMember} className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Full Name *</Label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-white/[0.03] border-white/5 focus:border-[#D4AF37]/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Phone Number *</Label>
                                        <Input
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-white/[0.03] border-white/5 focus:border-[#D4AF37]/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">NID / ID Number *</Label>
                                        <Input
                                            required
                                            value={formData.nid}
                                            onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                                            className="bg-white/[0.03] border-white/5 focus:border-[#D4AF37]/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Designation</Label>
                                        <Input
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                            className="bg-white/[0.03] border-white/5 focus:border-[#D4AF37]/40"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Email (Optional)</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-white/[0.03] border-white/5 focus:border-[#D4AF37]/40"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="ghost" type="button" onClick={() => setIsAddDialogOpen(false)} className="flex-1 border border-white/5 hover:bg-white/5">CANCEL</Button>
                                    <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "AUTHENTICATE & SAVE"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-[200px] rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
                        ))
                    ) : members.map((member, idx) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="bg-[#0D0D12] border-white/5 hover:border-[#D4AF37]/20 transition-all overflow-hidden group">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/10 flex items-center justify-center font-bold text-[#D4AF37]">
                                            {member.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-white">{member.name}</CardTitle>
                                            <p className="text-[10px] font-mono text-white/30">{member.staff_id}</p>
                                        </div>
                                    </div>
                                    <Badge className={`px-3 py-0.5 border-none font-bold text-[8px] tracking-widest ${member.status === 'approved' ? 'bg-[#10B981]/10 text-[#10B981]' :
                                            member.status === 'pending' ? 'bg-[#D4AF37]/10 text-[#D4AF37] animate-pulse' :
                                                'bg-[#EF4444]/10 text-[#EF4444]'
                                        }`}>
                                        {member.status.toUpperCase()}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Phone</p>
                                            <p className="text-xs text-white/60 flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-[#D4AF37]/50" />
                                                {member.phone}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">NID</p>
                                            <p className="text-xs text-white/60 flex items-center gap-2">
                                                <Fingerprint className="w-3 h-3 text-[#D4AF37]/50" />
                                                {member.nid || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex gap-2">
                                        {member.status === 'pending' ? (
                                            <>
                                                <Button
                                                    onClick={() => handleStatusUpdate(member.id, 'approved')}
                                                    className="flex-1 h-9 bg-[#10B981] hover:bg-[#10B981]/90 text-black text-[10px] font-bold rounded-lg"
                                                >
                                                    APPROVE
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusUpdate(member.id, 'rejected')}
                                                    variant="ghost"
                                                    className="h-9 w-9 p-0 rounded-lg border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/5"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="ghost" className="w-full h-9 border border-white/5 hover:bg-white/5 text-[10px] font-bold text-white/40 tracking-widest">
                                                VIEW PROFILE MATRIX
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[#D4AF37]/10 transition-colors" />
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
