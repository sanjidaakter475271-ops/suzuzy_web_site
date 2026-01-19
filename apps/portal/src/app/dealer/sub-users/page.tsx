"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    UserPlus,
    User,
    Mail,
    Trash2,
    Edit2,
    CheckCircle2,
    XCircle,
    Loader2,
    ShieldCheck,
    Lock,
    Eye,
    Settings2,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface TeamMember {
    id: string;
    user_id: string;
    dealer_id: string;
    dealer_role: string;
    can_manage_products: boolean;
    can_manage_orders: boolean;
    can_view_finance: boolean;
    can_manage_inventory: boolean;
    can_manage_staff: boolean;
    profiles: {
        full_name: string;
        email?: string;
    };
    created_at: string;
}

export default function DealerTeam() {
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [searchEmail, setSearchEmail] = useState("");
    const [foundUser, setFoundUser] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Form states for adding/editing
    const [role, setRole] = useState("staff");
    const [permissions, setPermissions] = useState({
        products: false,
        orders: false,
        finance: false,
        inventory: false,
        staff: false
    });

    const fetchTeam = async () => {
        if (!profile?.dealer_id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('dealer_users')
                .select('*, profiles:user_id(full_name, email)')
                .eq('dealer_id', profile.dealer_id);

            if (error) throw error;
            setTeam((data as any) || []);
        } catch (error: any) {
            console.error("Error fetching team:", error);
            toast.error("Failed to load command staff");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, [profile?.dealer_id]);

    const handleSearchUser = async () => {
        if (!searchEmail) return;
        setIsSearching(true);
        setFoundUser(null);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('email', searchEmail.trim())
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setFoundUser(data);
            } else {
                toast.error("Personnel not found in global directory");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddMember = async () => {
        if (!foundUser || !profile?.dealer_id) return;

        try {
            const { error } = await supabase
                .from('dealer_users')
                .insert({
                    user_id: foundUser.id,
                    dealer_id: profile.dealer_id,
                    dealer_role: role,
                    can_manage_products: permissions.products,
                    can_manage_orders: permissions.orders,
                    can_view_finance: permissions.finance,
                    can_manage_inventory: permissions.inventory,
                    can_manage_staff: permissions.staff
                });

            if (error) throw error;

            toast.success("New personnel authorized successfully");
            setIsAddModalOpen(false);
            fetchTeam();
            // Reset state
            setSearchEmail("");
            setFoundUser(null);
        } catch (error: any) {
            toast.error(error.message || "Authorization failed");
        }
    };

    const handleUpdateMember = async () => {
        if (!selectedMember) return;

        try {
            const { error } = await supabase
                .from('dealer_users')
                .update({
                    dealer_role: role,
                    can_manage_products: permissions.products,
                    can_manage_orders: permissions.orders,
                    can_view_finance: permissions.finance,
                    can_manage_inventory: permissions.inventory,
                    can_manage_staff: permissions.staff
                })
                .eq('id', selectedMember.id);

            if (error) throw error;

            toast.success("Authorization protocol updated");
            setIsEditModalOpen(false);
            fetchTeam();
        } catch (error: any) {
            toast.error(error.message || "Update failed");
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm("Confirm revocation of all access rights for this personnel?")) return;

        try {
            const { error } = await supabase
                .from('dealer_users')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Access rights revoked");
            fetchTeam();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const openEditModal = (member: TeamMember) => {
        setSelectedMember(member);
        setRole(member.dealer_role);
        setPermissions({
            products: member.can_manage_products,
            orders: member.can_manage_orders,
            finance: member.can_view_finance,
            inventory: member.can_manage_inventory,
            staff: member.can_manage_staff
        });
        setIsEditModalOpen(true);
    };

    const columns: ColumnDef<TeamMember>[] = [
        {
            accessorKey: "profiles.full_name",
            header: "Member Identity",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-display font-black text-xs uppercase italic shadow-inner">
                        {row.original.profiles?.full_name?.[0] || 'U'}
                    </div>
                    <div>
                        <p className="font-bold text-[#F8F8F8] tracking-tight">{row.original.profiles?.full_name}</p>
                        <p className="text-[10px] text-[#A1A1AA] font-medium tracking-widest uppercase italic">{row.original.dealer_role}</p>
                    </div>
                </div>
            )
        },
        {
            id: "permissions",
            header: "Access Rights",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 flex-wrap max-w-[300px]">
                    <PermissionBadge active={row.original.can_manage_products} label="Products" />
                    <PermissionBadge active={row.original.can_manage_orders} label="Orders" />
                    <PermissionBadge active={row.original.can_view_finance} label="Finance" />
                    <PermissionBadge active={row.original.can_manage_inventory} label="Inventory" />
                    <PermissionBadge active={row.original.can_manage_staff} label="Staff" />
                </div>
            )
        },
        {
            accessorKey: "created_at",
            header: "Enrolled",
            cell: ({ row }) => (
                <div className="text-[10px] text-[#A1A1AA] font-medium uppercase font-mono tracking-tighter">
                    {new Date(row.original.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(row.original)}
                        className="h-9 w-9 p-0 text-[#A1A1AA] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-xl transition-all"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMember(row.original.id)}
                        className="h-9 w-9 p-0 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    if (loading && team.length === 0) {
        return (
            <div className="h-full w-full min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        TEAM <span className="text-[#D4AF37]">COMMAND</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black opacity-60">
                        Authorized Personnel & Operations Control
                    </p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                            <UserPlus className="mr-2 w-4 h-4" /> Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0D0D0F] border-[#D4AF37]/20 text-[#F8F8F8] sm:max-w-[500px] rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle className="font-display italic font-black text-2xl uppercase tracking-tight">Authorize Personnel</DialogTitle>
                            <DialogDescription className="text-[#A1A1AA] text-xs">Search for personnel by email to grant access to this terminal.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {!foundUser ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">Global Registry Search</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="email"
                                                placeholder="personnel@example.com"
                                                className="bg-white/5 border-white/10 rounded-xl h-12 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                                value={searchEmail}
                                                onChange={(e) => setSearchEmail(e.target.value)}
                                            />
                                            <Button
                                                onClick={handleSearchUser}
                                                disabled={isSearching}
                                                className="h-12 w-12 bg-[#D4AF37] text-[#0D0D0F]"
                                            >
                                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-[#0D0D0F] flex items-center justify-center font-black">
                                            {foundUser.full_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold">{foundUser.full_name}</p>
                                            <p className="text-xs text-[#A1A1AA]">{foundUser.email}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setFoundUser(null)} className="ml-auto text-xs text-[#D4AF37] hover:bg-transparent">Change</Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">Designated Role</Label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                            >
                                                <option value="staff" className="bg-[#0D0D0F]">Operational Staff</option>
                                                <option value="manager" className="bg-[#0D0D0F]">Fleet Manager</option>
                                                <option value="finance" className="bg-[#0D0D0F]">Financial Officer</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">Operational Clearance</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <PermissionToggle
                                                    label="Products"
                                                    active={permissions.products}
                                                    onClick={() => setPermissions(p => ({ ...p, products: !p.products }))}
                                                />
                                                <PermissionToggle
                                                    label="Orders"
                                                    active={permissions.orders}
                                                    onClick={() => setPermissions(p => ({ ...p, orders: !p.orders }))}
                                                />
                                                <PermissionToggle
                                                    label="Finance"
                                                    active={permissions.finance}
                                                    onClick={() => setPermissions(p => ({ ...p, finance: !p.finance }))}
                                                />
                                                <PermissionToggle
                                                    label="Inventory"
                                                    active={permissions.inventory}
                                                    onClick={() => setPermissions(p => ({ ...p, inventory: !p.inventory }))}
                                                />
                                                <PermissionToggle
                                                    label="Staff Mgmt"
                                                    active={permissions.staff}
                                                    onClick={() => setPermissions(p => ({ ...p, staff: !p.staff }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button onClick={handleAddMember} className="w-full h-14 bg-[#D4AF37] text-[#0D0D0F] font-black uppercase tracking-[0.2em] rounded-2xl">Confirm Authorization</Button>
                                </motion.div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="bg-[#0D0D0F]/40 backdrop-blur-xl rounded-[2.5rem] border border-[#D4AF37]/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <DataTable
                    columns={columns}
                    data={team}
                    searchKey="profiles_full_name"
                />
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="bg-[#0D0D0F] border-[#D4AF37]/20 text-[#F8F8F8] sm:max-w-[500px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="font-display italic font-black text-2xl uppercase tracking-tight">Adjust Permissions</DialogTitle>
                        <DialogDescription className="text-[#A1A1AA] text-xs">Modify operational clearance for {selectedMember?.profiles?.full_name}.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">Designated Role</Label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="staff" className="bg-[#0D0D0F]">Operational Staff</option>
                                    <option value="manager" className="bg-[#0D0D0F]">Fleet Manager</option>
                                    <option value="finance" className="bg-[#0D0D0F]">Financial Officer</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">Operational Clearance</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <PermissionToggle
                                        label="Products"
                                        active={permissions.products}
                                        onClick={() => setPermissions(p => ({ ...p, products: !p.products }))}
                                    />
                                    <PermissionToggle
                                        label="Orders"
                                        active={permissions.orders}
                                        onClick={() => setPermissions(p => ({ ...p, orders: !p.orders }))}
                                    />
                                    <PermissionToggle
                                        label="Finance"
                                        active={permissions.finance}
                                        onClick={() => setPermissions(p => ({ ...p, finance: !p.finance }))}
                                    />
                                    <PermissionToggle
                                        label="Inventory"
                                        active={permissions.inventory}
                                        onClick={() => setPermissions(p => ({ ...p, inventory: !p.inventory }))}
                                    />
                                    <PermissionToggle
                                        label="Staff Mgmt"
                                        active={permissions.staff}
                                        onClick={() => setPermissions(p => ({ ...p, staff: !p.staff }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleUpdateMember} className="w-full h-14 bg-[#D4AF37] text-[#0D0D0F] font-black uppercase tracking-[0.2em] rounded-2xl">Sync Protocol</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function PermissionBadge({ active, label }: { active: boolean; label: string }) {
    return (
        <div className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${active
            ? "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]"
            : "bg-white/5 border-white/10 text-white/10"
            }`}>
            {label}
        </div>
    );
}

function PermissionToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${active
                ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]"
                : "bg-white/5 border-white/10 text-[#A1A1AA] hover:bg-white/10"}`}
        >
            <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
            {active ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 opacity-30" />}
        </button>
    );
}
