"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal,
    Mail,
    Phone,
    Shield,
    UserCircle,
    CheckCircle2,
    XCircle,
    UserMinus,
    UserCheck,
    Loader2,
    RefreshCw,
    Trash2,
    BarChart3,
    Zap
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

interface Profile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    status: 'active' | 'suspended' | 'pending';
    onboarding_completed: boolean;
    temp_password?: string;
    created_at: string;
}

export default function UsersManagementPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<Profile[]>([]);
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Role weighting for level-based flow
    const roleWeights: Record<string, number> = {
        super_admin: 4,
        admin: 3,
        dealer: 2,
        customer: 1
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers((data as Profile[]) || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Cloud synchronization failed");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users
        .filter(user => {
            const roleMatch = roleFilter === "all" || user.role === roleFilter;
            const statusMatch = statusFilter === "all" || user.status === statusFilter;
            return roleMatch && statusMatch;
        })
        .sort((a, b) => {
            const weightA = roleWeights[a.role] || 0;
            const weightB = roleWeights[b.role] || 0;
            if (weightB !== weightA) return weightB - weightA;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    useEffect(() => {
        fetchUsers();

        const subscription = supabase
            .channel('profiles-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchUsers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const updateUserStatus = async (id: string, status: Profile['status']) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            // Optimistic Update: Immediately update status in the list
            setUsers(currentUsers =>
                currentUsers.map(u =>
                    u.id === id ? { ...u, status } : u
                )
            );

            toast.success(`User status updated to ${status.toUpperCase()}`);
        } catch (error) {
            console.error("Error updating user status:", error);
            toast.error("Status transition failed");
        }
    };

    const resetPassword = async (userId: string) => {
        const confirm = window.confirm("Are you sure you want to force a password reset? This user will be required to re-onboard.");
        if (!confirm) return;

        try {
            const { data, error } = await supabase.functions.invoke('manage-user-lifecycle', {
                body: { action: 'reset_password', target_user_id: userId }
            });

            if (error) throw error;

            toast.success("Security reset successful. Temp password: " + data.new_password);
            fetchUsers(); // Refresh list to show new temp password
        } catch (error: any) {
            console.error("Reset failed:", error);
            toast.error("Security reset protocol failed");
        }
    };

    const deleteUser = async (userId: string) => {
        const confirm = window.confirm("CRITICAL ACTION: This will permanently eradicate the account and all associated data. Proceed?");
        if (!confirm) return;

        try {
            const { error } = await supabase.functions.invoke('manage-user-lifecycle', {
                body: { action: 'delete', target_user_id: userId }
            });

            if (error) throw error;

            setUsers(current => current.filter(u => u.id !== userId));
            toast.success("Account permanently removed from system");
        } catch (error: any) {
            console.error("Deletion failed:", error);
            toast.error("Account eradication failed");
        }
    };

    const columns: ColumnDef<Profile>[] = [
        {
            accessorKey: "full_name",
            header: "Identity",
            cell: ({ row }) => {
                const createdAt = new Date(row.original.created_at);
                const isNew = (new Date().getTime() - createdAt.getTime()) < (48 * 60 * 60 * 1000);

                return (
                    <div className="flex items-center gap-3 relative">
                        {isNew && (
                            <motion.span
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-3 left-0 text-[8px] font-black text-[#D4AF37] tracking-[0.2em] italic bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20 flex items-center gap-1 shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                            >
                                <Zap className="w-2 h-2" /> NEW
                            </motion.span>
                        )}
                        <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-display font-black text-xs uppercase italic shadow-inner">
                            {row.original.full_name?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-[#F8F8F8] tracking-tight">{row.original.full_name}</p>
                            <p className="text-[10px] text-[#A1A1AA] uppercase tracking-tighter">ID: {row.original.id.split('-')[0]}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "email",
            header: "Communications",
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA]">
                        <Mail className="w-3 h-3 text-[#D4AF37]" />
                        <span className="font-mono">{row.original.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA]">
                        <Phone className="w-3 h-3 text-[#D4AF37]" />
                        <span className="font-mono">{row.original.phone || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            id: "credentials",
            header: "Security Credentials",
            cell: ({ row }) => {
                const isCompleted = row.original.onboarding_completed;
                const tempPass = row.original.temp_password;

                return (
                    <div className="space-y-1">
                        {!isCompleted && tempPass ? (
                            <div
                                className="group flex flex-col gap-1 cursor-pointer active:scale-95 transition-transform"
                                onClick={() => {
                                    navigator.clipboard.writeText(tempPass);
                                    toast.success("Password copied to clipboard");
                                }}
                            >
                                <span className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest group-hover:text-white transition-colors">Temporary Access</span>
                                <code className="text-xs font-mono bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/20 group-hover:bg-[#D4AF37]/20 group-hover:border-[#D4AF37]/40 transition-all">
                                    {tempPass}
                                </code>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-[10px] text-green-500/50 italic">
                                <Shield className="w-3 h-3" />
                                <span>Secured by User</span>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: "role",
            header: "Authorization Level",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F8F8F8] italic">
                        {row.original.role?.replace('_', ' ')}
                    </span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Security Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const variants: Record<string, string> = {
                    active: "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
                    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
                    suspended: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
                };

                return (
                    <Badge className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${variants[status] || "bg-white/5 border-white/10 text-white/40"}`}>
                        {status || 'Undefined'}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "created_at",
            header: "Enrolled",
            cell: ({ row }) => (
                <div className="text-[10px] font-medium text-[#A1A1AA] uppercase font-mono italic">
                    {format(new Date(row.original.created_at), 'MMM dd, yyyy')}
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#D4AF37]/10 transition-colors">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-[#D4AF37]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0D0D0F] border-[#D4AF37]/20 text-[#A1A1AA] rounded-2xl shadow-2xl">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-[#D4AF37] px-4 py-2">Account Control</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#D4AF37]/10" />

                            <Link href={`/super-admin/users/${user.id}`}>
                                <DropdownMenuItem className="cursor-pointer flex items-center gap-3 text-xs px-4 py-3 hover:text-[#F8F8F8] transition-colors">
                                    <BarChart3 className="w-4 h-4 text-[#D4AF37]" /> View User Portfolio
                                </DropdownMenuItem>
                            </Link>

                            <DropdownMenuItem
                                onClick={() => resetPassword(user.id)}
                                className="cursor-pointer flex items-center gap-3 text-xs px-4 py-3 hover:text-[#D4AF37] transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> Reset Password
                            </DropdownMenuItem>

                            {user.status !== 'active' && (
                                <DropdownMenuItem
                                    onClick={() => updateUserStatus(user.id, 'active')}
                                    className="cursor-pointer flex items-center gap-3 text-xs px-4 py-3 text-green-500 focus:text-green-500 focus:bg-green-500/10"
                                >
                                    <UserCheck className="w-4 h-4" /> Reactivate Protocol
                                </DropdownMenuItem>
                            )}
                            {user.status !== 'suspended' && (
                                <DropdownMenuItem
                                    onClick={() => updateUserStatus(user.id, 'suspended')}
                                    className="cursor-pointer flex items-center gap-3 text-xs px-4 py-3 text-amber-500 focus:text-amber-500 focus:bg-amber-500/10"
                                >
                                    <UserMinus className="w-4 h-4" /> Suspend Access
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-red-500/20" />
                            <DropdownMenuItem
                                onClick={() => deleteUser(user.id)}
                                className="cursor-pointer flex items-center gap-3 text-xs px-4 py-3 text-red-500 focus:text-red-500 focus:bg-red-500/10 font-bold"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Account
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ];

    if (loading && users.length === 0) {
        return (
            <div className="h-full w-full min-h-[400px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Synchronizing User Registry...</p>
            </div>
        );
    }

    const updateRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase.rpc('update_user_role_v2', {
                target_user_id: userId,
                new_role: newRole
            });

            if (error) throw error;

            // Optimistic Update: Immediately update the user in the list to avoid full page refresh
            setUsers(currentUsers =>
                currentUsers.map(u =>
                    u.id === userId ? { ...u, role: newRole } : u
                )
            );

            toast.success("Personnel authorization level updated");
            // No need for fetchUsers() if we update state locally, but keeping it for secondary sync
            // fetchUsers(); 
        } catch (error: any) {
            console.error("Error updating role:", error);
            toast.error("Authorization upgrade failed");
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black italic tracking-tight text-[#F8F8F8]">
                        USER <span className="text-[#D4AF37]">REGISTRY</span>
                    </h2>
                    <p className="text-[#A1A1AA] text-[10px] uppercase tracking-[0.3em] font-black">
                        Authorized Personnel & Role Sovereignty
                    </p>
                </div>
                <Link href="/super-admin/users/new">
                    <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0D0D0F] font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                        Authorize New Personnel
                    </Button>
                </Link>
            </div>

            {/* Filters & Actions Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-4 bg-[#0D0D0F]/40 backdrop-blur-xl p-2 px-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Phase:</span>
                        <div className="flex bg-white/5 p-1 rounded-xl">
                            {['all', 'active', 'pending', 'suspended'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                        ? 'bg-[#D4AF37] text-[#0D0D0F] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                        : 'text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Authority:</span>
                        <div className="flex bg-white/5 p-1 rounded-xl">
                            {['all', 'super_admin', 'admin', 'dealer', 'customer'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${roleFilter === role
                                        ? 'bg-white/10 text-white shadow-inner'
                                        : 'text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    {role.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right mr-4 hidden lg:block">
                        <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Active Fleet</p>
                        <p className="text-xl font-bold text-white italic tracking-tighter">{filteredUsers.length} <span className="text-white/20 text-xs">Personnel</span></p>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#D4AF37]/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#DC2626]/5 blur-[120px] rounded-full" />

                <div className="relative z-10 bg-[#0D0D0F]/40 backdrop-blur-2xl rounded-[2.5rem] border border-[#D4AF37]/10 p-2 overflow-hidden hover:border-[#D4AF37]/20 transition-all duration-700 shadow-2xl">
                    <DataTable
                        columns={[...columns,
                        {
                            id: "change-role",
                            header: "Change Auth",
                            cell: ({ row }) => (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-6 px-2 text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10">
                                            Update
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#0D0D0F] border-[#D4AF37]/20 text-[#A1A1AA] rounded-xl">
                                        <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-[#D4AF37]">Select Level</DropdownMenuLabel>
                                        {['customer', 'dealer', 'admin', 'super_admin'].map((role) => (
                                            <DropdownMenuItem
                                                key={role}
                                                onClick={() => updateRole(row.original.id, role)}
                                                className="text-[10px] uppercase font-mono cursor-pointer hover:text-[#F8F8F8] hover:bg-white/5"
                                            >
                                                {role.replace('_', ' ')}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )
                        }
                        ]}
                        data={filteredUsers}
                        searchKey="full_name"
                    />
                </div>
            </div>
        </div>
    );
}
