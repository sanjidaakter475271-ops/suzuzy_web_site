'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, SidePanel } from "@/components/ui";
import { UserPlus, Search, Filter, MoreVertical, ShieldCheck, Mail, Edit2, Trash2, Users, UserCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import { cn } from "@/lib/utils";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive';
    avatar: string;
}

const INITIAL_USERS: User[] = [
    { id: 1, name: "Nazmul Hassan", email: "nazmul@example.com", role: "Administrator", status: "Active", avatar: "https://picsum.photos/100/100?random=1" },
    { id: 2, name: "Farhana Ahmed", email: "farhana@example.com", role: "Editor", status: "Active", avatar: "https://picsum.photos/100/100?random=2" },
    { id: 3, name: "Tanvir Rahman", email: "tanvir@example.com", role: "Viewer", status: "Inactive", avatar: "https://picsum.photos/100/100?random=3" },
    { id: 4, name: "Sumi Akter", email: "sumi@example.com", role: "Manager", status: "Active", avatar: "https://picsum.photos/100/100?random=4" },
];

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>(INITIAL_USERS);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Viewer',
        status: 'Active' as 'Active' | 'Inactive'
    });

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'Active').length;
    const activePercentage = Math.round((activeUsers / totalUsers) * 100);

    const handleOpenPanel = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'Viewer', status: 'Active' });
        }
        setIsPanelOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            // Update
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        } else {
            // Create
            const newUser: User = {
                id: Date.now(),
                ...formData,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
            };
            setUsers([...users, newUser]);
        }
        setIsPanelOpen(false);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade max-w-[1600px] mx-auto">
            <Breadcrumb items={[{ label: 'User Management' }]} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand to-brand-dark p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Users size={100} />
                    </div>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Total Users</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black">{totalUsers}</h2>
                        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-bold">+12%</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border p-6 rounded-3xl shadow-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-brand opacity-5 group-hover:scale-110 transition-transform">
                        <UserCheck size={100} />
                    </div>
                    <p className="text-sm font-bold text-ink-muted uppercase tracking-widest mb-1">Active Users</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black text-ink-heading dark:text-white">{activeUsers}</h2>
                        <span className="bg-success/10 text-success px-2 py-0.5 rounded-lg text-xs font-bold">{activePercentage}% Active</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Team Management</h1>
                    <p className="text-ink-muted mt-2 font-medium">Manage your team members and their access levels.</p>
                </div>
                <Button onClick={() => handleOpenPanel()} className="gap-2 shadow-lg shadow-brand/20">
                    <UserPlus size={18} /> Invite Member
                </Button>
            </div>

            <Card className="rounded-[2rem] overflow-hidden border-surface-border dark:border-dark-border shadow-card">
                <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-surface-border dark:border-dark-border py-4 px-6 bg-surface-page/30 dark:bg-dark-page/30">
                    <div className="flex items-center bg-white dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-2xl px-4 py-2.5 w-full max-w-sm focus-within:border-brand transition-colors shadow-sm">
                        <Search size={18} className="text-ink-muted mr-3" />
                        <input type="text" placeholder="Search members..." className="bg-transparent border-none outline-none text-sm font-bold w-full text-ink-body dark:text-white placeholder:text-ink-muted/50" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 px-4 py-2.5 h-auto text-xs uppercase tracking-wider font-bold rounded-xl bg-white dark:bg-dark-card hover:bg-surface-page dark:hover:bg-dark-border">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-page dark:bg-dark-page/50 border-b border-surface-border dark:border-dark-border">
                                <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest">Member</th>
                                <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-surface-hover/50 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => handleOpenPanel(user)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Image src={user.avatar} width={48} height={48} className="rounded-2xl shadow-sm bg-surface-border object-cover" alt={user.name} />
                                                <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-dark-card", user.status === 'Active' ? 'bg-success' : 'bg-ink-muted')}></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-ink-heading dark:text-white group-hover:text-brand transition-colors">{user.name}</p>
                                                <p className="text-xs text-ink-muted font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-ink-body dark:text-gray-300 bg-surface-page dark:bg-dark-page w-fit px-3 py-1.5 rounded-lg border border-surface-border dark:border-dark-border">
                                            <ShieldCheck size={14} className="text-brand" />
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                            user.status === 'Active' ? 'bg-success/10 text-success' : 'bg-surface-border text-ink-muted'
                                        )}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="outline" className="p-2 h-auto w-8 rounded-lg hover:text-brand hover:border-brand" onClick={() => handleOpenPanel(user)}>
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button variant="outline" className="p-2 h-auto w-8 rounded-lg hover:text-danger hover:border-danger hover:bg-danger/10" onClick={() => handleDelete(user.id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Side Panel Form */}
            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title={editingUser ? "Edit Profile" : "Invite New Member"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image Placeholer */}
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-surface-border dark:border-dark-border rounded-3xl bg-surface-page/50 dark:bg-dark-page/50 hover:border-brand transition-colors group cursor-pointer mb-6">
                        <div className="w-20 h-20 rounded-full bg-surface-border dark:bg-dark-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            {editingUser ?
                                <Image src={editingUser.avatar} width={80} height={80} alt="Profile" className="rounded-full w-full h-full object-cover" />
                                : <UserPlus size={32} className="text-ink-muted group-hover:text-brand" />
                            }
                        </div>
                        <p className="text-xs font-bold text-brand uppercase tracking-widest">Click to upload photo</p>
                        <p className="text-[10px] text-ink-muted mt-1">PNG, JPG up to 5MB</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Full Name <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. John Doe"
                            className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Email Actions <span className="text-danger">*</span></label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="Administrator">Administrator</option>
                                <option value="Manager">Manager</option>
                                <option value="Editor">Editor</option>
                                <option value="Viewer">Viewer</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setIsPanelOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-brand/20">
                            {editingUser ? "Save Changes" : "Send Invitation"}
                        </Button>
                    </div>
                </form>
            </SidePanel>
        </div>
    )
}
