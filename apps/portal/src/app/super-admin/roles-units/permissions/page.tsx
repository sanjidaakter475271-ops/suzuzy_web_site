"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Shield, ShieldAlert, Loader2, RefreshCcw, LayoutGrid, Save, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Permission {
    id: string;
    name: string;
    module: string;
    description: string;
}

interface Role {
    id: string;
    name: string;
    level: number;
}

export default function PermissionsManagementPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [syncing, setSyncing] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPerm, setNewPerm] = useState({ name: "", module: "", description: "" });
    const [isCreating, setIsCreating] = useState(false);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/super-admin/permissions');
            if (!res.ok) throw new Error("Failed to load permissions");
            const data = await res.json();
            setPermissions(data || []);
        } catch (error) {
            console.error("Error fetching permissions:", error);
            toast.error("Failed to load permission registry");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/super-admin/roles');
            if (!res.ok) throw new Error("Failed to load roles");
            const data = await res.json();
            setRoles(data || []);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const fetchAssignedPermissions = useCallback(async (roleId: string) => {
        if (!roleId) return;
        try {
            const res = await fetch(`/api/super-admin/roles/${roleId}/permissions`);
            if (!res.ok) throw new Error("Failed to load assigned permissions");
            const data = await res.json();
            setAssignedPermissions(data || []);
            setHasChanges(false);
        } catch (error) {
            console.error("Error fetching assigned permissions:", error);
            toast.error("Failed to load role assignments");
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
        fetchRoles();
    }, []);

    useEffect(() => {
        if (selectedRole) {
            fetchAssignedPermissions(selectedRole);
        } else {
            setAssignedPermissions([]);
            setHasChanges(false);
        }
    }, [selectedRole, fetchAssignedPermissions]);

    const handlePermissionToggle = (permissionId: string) => {
        setAssignedPermissions(prev => {
            const isAssigned = prev.includes(permissionId);
            const next = isAssigned
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId];
            return next;
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!selectedRole) return;
        setIsSaving(true);
        const loadToast = toast.loading("Saving authority changes...");
        try {
            const res = await fetch(`/api/super-admin/roles/${selectedRole}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissionIds: assignedPermissions })
            });

            if (!res.ok) throw new Error("Update failure");

            toast.success("Role privileges synchronized", { id: loadToast });
            setHasChanges(false);
        } catch (error) {
            console.error("Error saving permissions:", error);
            toast.error("Failed to persist changes", { id: loadToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        const loadToast = toast.loading("Resynchronizing system protocols...");
        try {
            const res = await fetch('/api/super-admin/sync-permissions', { method: 'POST' });
            if (!res.ok) throw new Error("Sync failure");
            toast.success("System permissions synchronized", { id: loadToast });
            fetchPermissions();
        } catch (error) {
            toast.error("Protocol sync failed", { id: loadToast });
        } finally {
            setSyncing(false);
        }
    };

    const handleCreatePermission = async () => {
        if (!newPerm.name || !newPerm.module) {
            toast.error("Name and module are required");
            return;
        }

        setIsCreating(true);
        const loadToast = toast.loading("Creating unique clearance protocol...");
        try {
            const res = await fetch('/api/super-admin/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPerm)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Creation failure");
            }

            toast.success("New clearance protocol registered", { id: loadToast });
            setNewPerm({ name: "", module: "", description: "" });
            setIsCreateModalOpen(false);
            fetchPermissions();
        } catch (error: any) {
            toast.error(error.message, { id: loadToast });
        } finally {
            setIsCreating(false);
        }
    };

    const filteredPermissions = permissions.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Grouping
    const grouped = filteredPermissions.reduce((acc, p) => {
        if (!acc[p.module]) acc[p.module] = [];
        acc[p.module].push(p);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <div className="space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        SYSTEM <span className="text-[#D4AF37]">CLEARANCE</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                        Granular Permission Registry
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-[#0D0D0F]/40 border border-[#D4AF37]/20 p-1.5 rounded-2xl">
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-[200px] h-10 bg-transparent border-none text-white focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Select Authority Role" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0D0D0F] border-[#D4AF37]/20 text-white">
                                <SelectItem value="none" className="focus:bg-[#D4AF37]/10 focus:text-[#D4AF37]">Clear Selection</SelectItem>
                                {roles.map(role => (
                                    <SelectItem key={role.id} value={role.id} className="focus:bg-[#D4AF37]/10 focus:text-[#D4AF37]">
                                        {role.name.replace(/_/g, ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <AnimatePresence>
                            {hasChanges && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="h-9 px-4 bg-[#D4AF37] hover:bg-[#B8860B] text-[#0D0D0F] font-black uppercase tracking-widest text-[9px] rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                                    >
                                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Save className="w-3.5 h-3.5 mr-2" />}
                                        Save Changes
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#D4AF37] transition-all" />
                        <Input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Filter registry..."
                            className="pl-12 w-full md:w-64 h-12 bg-[#0D0D0F]/40 border-[#D4AF37]/20 focus:border-[#D4AF37]/50 focus:bg-[#0D0D0F]/60 rounded-2xl text-white placeholder:text-white/20"
                        />
                    </div>

                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        className="h-12 px-8 bg-transparent border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 text-[#D4AF37] font-black uppercase tracking-widest text-[10px] rounded-2xl"
                    >
                        {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                        Sync
                    </Button>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="h-12 px-8 bg-[#D4AF37] hover:bg-[#B8860B] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                New Permission
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0D0D0F] border-[#D4AF37]/20 text-white max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-display font-black tracking-tight uppercase">
                                    New <span className="text-[#D4AF37]">Clearance</span> Protocol
                                </DialogTitle>
                                <DialogDescription className="text-white/40 text-xs uppercase tracking-[0.1em]">
                                    Define a new granular system authorization entry.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/60 ml-1">Protocol Key</Label>
                                    <Input
                                        id="name"
                                        value={newPerm.name}
                                        onChange={e => setNewPerm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. inventory:manage"
                                        className="bg-[#0D0D0F]/40 border-[#D4AF37]/20 focus:border-[#D4AF37]/50 h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="module" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/60 ml-1">System Module</Label>
                                    <Input
                                        id="module"
                                        value={newPerm.module}
                                        onChange={e => setNewPerm(prev => ({ ...prev, module: e.target.value }))}
                                        placeholder="e.g. inventory"
                                        className="bg-[#0D0D0F]/40 border-[#D4AF37]/20 focus:border-[#D4AF37]/50 h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/60 ml-1">Authorization Scope</Label>
                                    <Input
                                        id="description"
                                        value={newPerm.description}
                                        onChange={e => setNewPerm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description of the clearance scope..."
                                        className="bg-[#0D0D0F]/40 border-[#D4AF37]/20 focus:border-[#D4AF37]/50 h-11 rounded-xl"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="border-[#D4AF37]/20 hover:bg-[#D4AF37]/5 text-white/60 h-11 rounded-xl px-6"
                                >
                                    Abort
                                </Button>
                                <Button
                                    onClick={handleCreatePermission}
                                    disabled={isCreating}
                                    className="bg-[#D4AF37] hover:bg-[#B8860B] text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] h-11 rounded-xl px-10 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Establish Protocol
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
                    <p className="text-[#D4AF37]/40 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Initializing System Registry...</p>
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <GlassCard className="p-20 text-center border-dashed border-[#D4AF37]/10">
                    <ShieldAlert className="w-16 h-16 text-white/5 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No Clearance protocol Found</h3>
                    <p className="text-white/30 text-sm max-w-sm mx-auto leading-relaxed">The system registry is currently empty. Execute "Sync Protocols" to initialize baseline clearance definitions.</p>
                </GlassCard>
            ) : (
                <div className="space-y-12 pb-20">
                    {Object.entries(grouped).map(([module, perms], idx) => (
                        <motion.section
                            key={module}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
                                <div className="flex items-center gap-2 px-6 py-2 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-full">
                                    <LayoutGrid className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">{module}</h3>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {perms.map(p => (
                                    <GlassCard key={p.id} className="p-6 group hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all duration-500 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                            <Shield className="w-16 h-16 text-[#D4AF37] -rotate-12" />
                                        </div>

                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 text-[9px] font-black uppercase tracking-tight mb-2">
                                                        KEY: {p.name.split('_')[0]}
                                                    </Badge>
                                                    <h4 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
                                                        {p.name.replace(/_/g, ' ')}
                                                    </h4>
                                                </div>

                                                {selectedRole && selectedRole !== "none" ? (
                                                    <Switch
                                                        checked={assignedPermissions.includes(p.id)}
                                                        onCheckedChange={() => handlePermissionToggle(p.id)}
                                                        className="data-[state=checked]:bg-[#D4AF37]"
                                                    />
                                                ) : assignedPermissions.includes(p.id) ? (
                                                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                                                ) : null}
                                            </div>

                                            <p className="text-[10px] text-white/30 font-mono tracking-tighter">
                                                perm://{p.module}/{p.name}
                                            </p>

                                            <p className="text-[11px] text-white/50 leading-relaxed h-12 line-clamp-3 group-hover:text-white/70 transition-colors">
                                                {p.description || "Grants tactical authorization for this module feature."}
                                            </p>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </motion.section>
                    ))}
                </div>
            )}
        </div>
    );
}
