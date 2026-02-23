"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ShieldCheck, MoreHorizontal, Users, Lock, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Role {
    id: string;
    name: string;
    display_name: string;
    level: number;
    role_type: string;
    description: string;
    _count?: {
        profiles: number;
    }
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        display_name: "",
        level: "99",
        description: ""
    });

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/super-admin/roles');
            if (!res.ok) throw new Error("Registry retrieval failed");
            const data = await res.json();
            setRoles(data || []);
        } catch (error) {
            console.error("Error fetching roles:", error);
            toast.error("Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            // Auto-generate system name from display name if not provided
            const systemName = formData.name || formData.display_name.toLowerCase().replace(/\s+/g, '_');

            const { error } = await supabase
                .from('roles')
                .insert([
                    {
                        name: systemName,
                        display_name: formData.display_name,
                        level: parseInt(formData.level),
                        description: formData.description,
                        role_type: 'custom'
                    }
                ]);

            if (error) throw error;

            toast.success("Role definition created successfully");
            setIsCreateOpen(false);
            setFormData({ name: "", display_name: "", level: "99", description: "" });
            fetchRoles();
        } catch (error) {
            console.error("Error creating role:", error);
            toast.error("Failed to create role definition");
        } finally {
            setCreating(false);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-colors" />
                    <Input
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 bg-white/5 border-white/10 focus:border-[#D4AF37]/50 focus:bg-white/10 rounded-xl text-white placeholder:text-white/20"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={async () => {
                            const loadingToast = toast.loading("Syncing system hierarchy...");
                            try {
                                const res = await fetch('/api/super-admin/sync-roles', { method: 'POST' });
                                if (!res.ok) throw new Error("Sync failed");
                                toast.success("System roles synchronized", { id: loadingToast });
                                fetchRoles();
                            } catch (err) {
                                toast.error("Sync protocol failure", { id: loadingToast });
                            }
                        }}
                        className="h-12 px-6 bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl transition-all"
                    >
                        Sync Roles
                    </Button>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            const loadingToast = toast.loading("Deploying system permissions...");
                            try {
                                const res = await fetch('/api/super-admin/sync-permissions', { method: 'POST' });
                                if (!res.ok) throw new Error("Sync failed");
                                toast.success("Permissions synchronized", { id: loadingToast });
                                fetchRoles();
                            } catch (err) {
                                toast.error("Permission sync failure", { id: loadingToast });
                            }
                        }}
                        className="h-12 px-6 bg-white/5 border-white/10 hover:bg-[#D4AF37]/10 text-white hover:text-[#D4AF37] font-bold uppercase tracking-wider rounded-xl transition-all"
                    >
                        Sync Perms
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 bg-[#D4AF37] hover:bg-[#B8860B] text-[#0D0D0F] font-bold uppercase tracking-wider rounded-xl">
                                <Plus className="w-4 h-4 mr-2" />
                                Define New Role
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1A1A1C] border-[#D4AF37]/20 text-white sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-display font-black italic text-[#F8F8F8]">
                                    DEFINE <span className="text-[#D4AF37]">SYSTEM ROLE</span>
                                </DialogTitle>
                                <DialogDescription className="text-white/40 text-xs">
                                    Create a new role definition. Permissions can be assigned after creation.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleCreate} className="space-y-6 mt-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold text-[#D4AF37]">Display Name</Label>
                                        <Input
                                            placeholder="e.g. Junior Sales Executive"
                                            value={formData.display_name}
                                            onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                            className="bg-white/5 border-white/10 focus:border-[#D4AF37]/50"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold text-[#D4AF37]">System Name (ID)</Label>
                                            <Input
                                                placeholder="auto-generated"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-white/5 border-white/10 focus:border-[#D4AF37]/50 font-mono text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold text-[#D4AF37]">Hierarchy Level</Label>
                                            <Select
                                                value={formData.level}
                                                onValueChange={val => setFormData({ ...formData, level: val })}
                                            >
                                                <SelectTrigger className="bg-white/5 border-white/10 focus:border-[#D4AF37]/50 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1A1A1C] border-[#D4AF37]/20 text-white h-60">
                                                    {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                                                        <SelectItem key={num} value={num.toString()}>
                                                            Level {num}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold text-[#D4AF37]">Description</Label>
                                        <Input
                                            placeholder="Brief description of responsibilities"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="bg-white/5 border-white/10 focus:border-[#D4AF37]/50"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-[#D4AF37] hover:bg-[#B8860B] text-[#0D0D0F] font-bold uppercase tracking-wider"
                                    disabled={creating}
                                >
                                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Definition"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
                </div>
            ) : filteredRoles.length === 0 ? (
                <GlassCard className="p-12 text-center border-dashed border-[#D4AF37]/20">
                    <ShieldCheck className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Roles Defined</h3>
                    <p className="text-white/40 text-sm">Define roles to start assigning permissions.</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRoles.map((role, index) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={`/super-admin/roles-units/roles/${role.id}`}>
                                <GlassCard className="p-6 h-full flex flex-col justify-between group hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all cursor-pointer relative overflow-hidden">
                                    {/* Role Level Background Indicator */}
                                    <div className="absolute top-0 right-0 p-4 opacity-10 font-display font-black text-6xl text-[#D4AF37] group-hover:scale-110 transition-transform">
                                        {role.level}
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="p-3 bg-white/5 rounded-xl text-white/80 group-hover:text-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-colors">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            {role.role_type === 'system' && (
                                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                    SYSTEM
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="relative z-10">
                                            <h3 className="text-xl font-bold text-[#F8F8F8] mb-1 group-hover:text-[#D4AF37] transition-colors">
                                                {role.display_name}
                                            </h3>
                                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">
                                                {role.name}
                                            </p>

                                            <p className="text-sm text-white/60 line-clamp-2 h-10">
                                                {role.description || "No description provided."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-3 relative z-10">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-tight">
                                                <Users className="w-3 h-3" />
                                                {/* @ts-ignore */}
                                                <span>{role._count?.profiles || 0} Operators</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-[#D4AF37]/60 uppercase tracking-tight">
                                                <ShieldCheck className="w-3 h-3" />
                                                {/* @ts-ignore */}
                                                <span>{role._count?.role_permissions || 0} Privileges</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-2 border-t border-white/5">
                                            <div className="flex items-center gap-1 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                Manage Clearance <MoreHorizontal className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
