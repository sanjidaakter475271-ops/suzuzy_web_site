"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Shield,
    Lock,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { Switch } from "../../../../../components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Role {
    id: string;
    name: string;
    display_name: string;
    level: number;
    description: string;
}

interface Permission {
    id: string;
    name: string;
    description: string;
    module: string;
}

export default function RoleDetailPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const router = useRouter();

    // Guard against missing ID during initial render or if params fail
    if (!id) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    const [role, setRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Role Details (Stay with Supabase for single row read)
                const { data: roleData, error: roleError } = await supabase
                    .from('roles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (roleError) throw roleError;
                setRole(roleData);

                // 2. Fetch All Permissions via SECURE API
                const permRes = await fetch('/api/super-admin/permissions');
                if (!permRes.ok) throw new Error("Failed to load global permissions registry");
                const permData = await permRes.json();
                setPermissions(permData || []);

                // 3. Fetch Assigned Permissions via SECURE API
                const assignedRes = await fetch(`/api/super-admin/roles/${id}/permissions`);
                if (!assignedRes.ok) throw new Error("Failed to load assigned clearance");
                const assignedData = await assignedRes.json();

                setSelectedPermissions(new Set(assignedData || []));

            } catch (error) {
                console.error("Error fetching role data:", error);
                toast.error("Failed to load role details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleTogglePermission = (permId: string) => {
        const newSet = new Set(selectedPermissions);
        if (newSet.has(permId)) {
            newSet.delete(permId);
        } else {
            newSet.add(permId);
        }
        setSelectedPermissions(newSet);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/super-admin/roles/${id}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissionIds: Array.from(selectedPermissions) })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Registry update failure");
            }

            toast.success("Role clearance protocol updated successfully");
        } catch (error: any) {
            console.error("Error saving permissions:", error);
            toast.error(error.message || "Failed to save permissions");
        } finally {
            setSaving(false);
        }
    };

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const module = perm.module || "General";
        if (!acc[module]) acc[module] = [];
        acc[module].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    if (!role) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <h2 className="text-xl font-bold text-white">Role Not Found</h2>
                <Button onClick={() => router.back()} variant="outline">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white/5 text-white/60 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-display font-black text-[#F8F8F8] italic">
                                {role.display_name}
                            </h2>
                            <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 uppercase tracking-widest text-[10px] font-bold">
                                Level {role.level}
                            </Badge>
                        </div>
                        <p className="text-[#A1A1AA] text-sm mt-1">{role.description || "No description provided"}</p>
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-6 bg-[#D4AF37] hover:bg-[#B8860B] text-[#0D0D0F] font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Configuration
                </Button>
            </div>

            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <GlassCard key={category} className="p-6 border-[#D4AF37]/10 flex flex-col h-full bg-[#1A1A1C]/40">
                        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                            <Shield className="w-4 h-4 text-[#D4AF37]" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                {category.replace('_', ' ')}
                            </h3>
                        </div>

                        <div className="space-y-4 flex-1">
                            {perms.map(perm => {
                                const isSelected = selectedPermissions.has(perm.id);
                                return (
                                    <div
                                        key={perm.id}
                                        className={`flex items-start justify-between p-3 rounded-lg transition-all ${isSelected ? 'bg-white/5 hover:bg-white/10' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="space-y-1">
                                            <p className={`text-xs font-bold transition-colors ${isSelected ? 'text-white' : 'text-white/60'}`}>
                                                {perm.name.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-[10px] text-white/30 line-clamp-2 leading-relaxed">
                                                {perm.description || "Grants access to this feature"}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={isSelected}
                                            onCheckedChange={() => handleTogglePermission(perm.id)}
                                            className="data-[state=checked]:bg-[#D4AF37]"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                ))}
            </div>

            {permissions.length === 0 && (
                <GlassCard className="p-12 text-center border-dashed border-red-500/20">
                    <Lock className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">System Permissions Missing</h3>
                    <p className="text-white/40 text-sm">No permissions found in the system registry. Please seed the permissions database.</p>
                </GlassCard>
            )}
        </div>
    );
}
