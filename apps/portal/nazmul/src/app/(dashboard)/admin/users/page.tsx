'use client';

import React, { useState } from 'react';
import {
    UserPlus,
    Search,
    Trash2,
    Edit2,
    ShieldCheck,
    Mail
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const UserManagementPage = () => {
    const { users, deleteUser } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'Admin', href: '/admin/users' }, { label: 'User Management' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">System Users</h1>
                    <p className="text-sm text-ink-muted">Create accounts and manage access permissions.</p>
                </div>
                <button className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand/20 active:scale-95">
                    <UserPlus size={20} />
                    Create New User
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand transition-colors text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="group hover:border-brand transition-all">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="relative">
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                        alt={user.name}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-surface-page dark:border-dark-page shadow-lg"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-success w-5 h-5 rounded-full border-2 border-white dark:border-dark-card" title="Active" />
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-ink-heading dark:text-white">{user.name}</h3>
                                    <div className="flex items-center justify-center gap-1.5 text-xs text-ink-muted mt-1">
                                        <Mail size={12} />
                                        {user.email}
                                    </div>
                                </div>

                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5",
                                    user.role === 'admin' ? "bg-purple-100 text-purple-700" :
                                        user.role === 'manager' ? "bg-blue-100 text-blue-700" :
                                            "bg-slate-100 text-slate-600"
                                )}>
                                    <ShieldCheck size={12} />
                                    {user.role}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-surface-border dark:border-dark-border/50">
                                <button className="flex-1 py-2 bg-surface-page dark:bg-dark-page hover:bg-brand hover:text-white text-ink-muted rounded-xl transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteUser(user.id)}
                                    className="p-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default UserManagementPage;
