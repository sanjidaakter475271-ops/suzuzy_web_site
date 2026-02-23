'use client';

import React, { useState, useRef } from 'react';
import {
    User,
    Mail,
    Shield,
    MapPin,
    Camera,
    Edit2,
    Globe,
    Phone,
    Check,
    X,
    Monitor,
    Smartphone,
    LogOut,
    Download,
    FileText,
    TrendingUp,
    ShoppingBag,
    History
} from 'lucide-react';
import { Button } from '@/components/ui';
import Breadcrumb from '@/components/Breadcrumb';
import StatCounter from '@/components/ui/StatCounter';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileData, setProfileData] = useState({
        name: 'Nazmul Islam',
        username: 'nazmul_rc',
        email: 'nazmul@royalconsortium.com',
        phone: '+880 1700-000000',
        location: 'Dhaka, Bangladesh',
        bio: "Managing Royal Consortium's operations and financial distribution. Responsible for overseeing the ERP modules, warehouse management, and strategic financial planning across all outlets.",
        warehouse: 'Main Outlet - Dhaka'
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        // In a real app, API call would happen here
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Breadcrumb items={[{ label: 'Account' }, { label: 'My Profile' }]} />
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight mt-2">
                        My Profile
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl gap-2 font-black uppercase text-xs">
                        <Download size={18} /> Activity Log
                    </Button>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button onClick={() => setIsEditing(false)} variant="outline" className="h-12 px-6 rounded-2xl gap-2 font-black uppercase text-xs border-danger text-danger hover:bg-danger/5">
                                <X size={18} /> Cancel
                            </Button>
                            <Button onClick={handleSave} className="h-12 px-6 rounded-2xl gap-2 bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 font-black uppercase text-xs">
                                <Check size={18} /> Save
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} className="h-12 px-6 rounded-2xl gap-2 bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 font-black uppercase text-xs">
                            <Edit2 size={18} /> Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCounter label="Total Sales Managed" value={1420} prefix="৳" className="border-l-4 border-l-brand" />
                <StatCounter label="Expenses Approved" value={850} prefix="৳" className="border-l-4 border-l-brand-light" />
                <StatCounter label="Reports Generated" value={124} suffix=" Files" className="border-l-4 border-l-success" />
                <StatCounter label="Active Projects" value={12} className="border-l-4 border-l-brand" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-3xl overflow-hidden shadow-card relative group">
                        <div className="h-32 bg-gradient-to-r from-brand to-brand-hover opacity-20 group-hover:opacity-30 transition-opacity"></div>

                        <div className="px-6 pb-8 -mt-12 flex flex-col items-center text-center relative z-10">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-surface-card dark:border-dark-card overflow-hidden shadow-xl bg-surface-page dark:bg-dark-page">
                                    <div className="w-full h-full flex items-center justify-center bg-brand/10 text-brand">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={64} />
                                        )}
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 p-2 bg-brand text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                >
                                    <Camera size={14} />
                                </button>
                            </div>

                            <h2 className="mt-4 text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">
                                {profileData.name}
                            </h2>
                            <p className="text-brand font-bold text-sm uppercase tracking-widest">Administrator</p>

                            <div className="mt-6 w-full grid grid-cols-2 gap-4 border-t border-surface-border dark:border-dark-border pt-6">
                                <div>
                                    <p className="text-xs font-bold text-ink-muted uppercase">Joined</p>
                                    <p className="text-sm font-black text-ink-heading dark:text-white">Jan 2024</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-ink-muted uppercase">Status</p>
                                    <div className="flex items-center justify-center gap-1.5 text-sm font-black text-success mt-1">
                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                                        Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-3xl p-6 shadow-card space-y-6">
                        <h3 className="text-sm font-black text-ink-heading dark:text-white uppercase tracking-widest border-b border-surface-border dark:border-dark-border pb-4">
                            Active Sessions
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-brand/10 text-brand rounded-lg">
                                        <Monitor size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-ink-heading dark:text-white">Windows PC - Chrome</p>
                                        <p className="text-[10px] text-brand font-bold">Current Session</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-surface-border dark:bg-dark-border text-ink-muted rounded-lg">
                                        <Smartphone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-ink-heading dark:text-white">iPhone 15 Pro</p>
                                        <p className="text-[10px] text-ink-muted font-bold">Yesterday, 14:20 • 103.44.12.11</p>
                                    </div>
                                </div>
                                <button className="p-1 px-2 text-[10px] font-black text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 uppercase tracking-widest">
                                    Revoke
                                </button>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-10 border-dashed border-2">
                            Logout from all devices
                        </Button>
                    </div>

                    {/* Assigned Warehouses */}
                    <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-3xl p-6 shadow-card">
                        <h3 className="text-sm font-black text-ink-heading dark:text-white uppercase tracking-widest border-b border-surface-border dark:border-dark-border pb-4 mb-4">
                            Assigned Warehouses
                        </h3>
                        <div className="space-y-3">
                            {['Main Outlet - Dhaka', 'Chattogram Branch'].map((wh, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-surface-page dark:bg-dark-page rounded-xl border border-surface-border dark:border-dark-border">
                                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                                        <TrendingUp size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-ink-heading dark:text-white">{wh}</span>
                                    <div className="ml-auto px-2 py-0.5 bg-success/10 text-success text-[8px] font-black uppercase rounded">Primary</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info & Activities */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-[32px] p-8 shadow-card">
                        <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                            <FileText className="text-brand" /> Account Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            {[
                                { label: 'Full Name', key: 'name', icon: User },
                                { label: 'Username', key: 'username', icon: Globe },
                                { label: 'Email Address', key: 'email', icon: Mail },
                                { label: 'Phone Number', key: 'phone', icon: Phone },
                                { label: 'Location', key: 'location', icon: MapPin },
                                { label: 'Primary Warehouse', key: 'warehouse', icon: ShoppingBag },
                            ].map((field) => (
                                <div key={field.key} className="space-y-2 group">
                                    <label className="text-[10px] font-black text-ink-muted uppercase tracking-widest flex items-center gap-2">
                                        <field.icon size={12} className="text-brand" />
                                        {field.label}
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData[field.key as keyof typeof profileData]}
                                            onChange={(e) => setProfileData({ ...profileData, [field.key]: e.target.value })}
                                            className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-xl px-4 py-2.5 text-sm font-bold focus:border-brand outline-none dark:text-white transition-all"
                                        />
                                    ) : (
                                        <p className="text-base font-bold text-ink-heading dark:text-white pb-2 border-b-2 border-surface-border dark:border-dark-border group-hover:border-brand/40 transition-colors">
                                            {profileData[field.key as keyof typeof profileData]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-ink-muted uppercase tracking-widest pl-1">About Me / Bio</h4>
                            </div>
                            {isEditing ? (
                                <textarea
                                    rows={4}
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl p-4 text-sm font-bold focus:border-brand outline-none dark:text-white transition-all resize-none"
                                />
                            ) : (
                                <p className="text-ink-body dark:text-gray-300 leading-relaxed font-medium bg-surface-page/50 dark:bg-dark-page/30 p-4 rounded-2xl border border-surface-border dark:border-dark-border">
                                    {profileData.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-[32px] p-8 shadow-card">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <History className="text-brand" /> Activity Feed
                            </h3>
                            <select className="bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none dark:text-white">
                                <option>All Activity</option>
                                <option>Finance</option>
                                <option>Security</option>
                                <option>Inventory</option>
                            </select>
                        </div>

                        <div className="space-y-0 relative">
                            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-surface-border dark:border-dark-border"></div>
                            {[
                                { title: 'Approved Purchase Order #1240', time: 'Today, 2:45 PM', icon: Check, color: 'text-success bg-success/10', category: 'Inventory' },
                                { title: 'Modified Expense Entry - Office Supplies', time: 'Today, 11:30 AM', icon: Edit2, color: 'text-brand bg-brand/10', category: 'Finance' },
                                { title: 'Login from New IP: 103.44.12.11', time: 'Yesterday, 10:24 AM', icon: Globe, color: 'text-brand-light bg-brand-light/10', category: 'Security' },
                                { title: 'Changed Default Currency to BDT', time: 'Feb 5, 2024', icon: TrendingUp, color: 'text-brand bg-brand/10', category: 'System' },
                                { title: 'Generated Monthly Sales Report', time: 'Feb 1, 2024', icon: Download, color: 'text-brand-light bg-brand-light/10', category: 'Finance' },
                            ].map((act, i) => (
                                <div key={i} className="flex gap-6 pb-10 last:pb-0 relative group">
                                    <div className={cn(
                                        "p-2.5 rounded-xl h-10 w-10 flex items-center justify-center flex-shrink-0 z-10 transition-transform group-hover:scale-110",
                                        act.color
                                    )}>
                                        <act.icon size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-black text-ink-heading dark:text-white uppercase tracking-tight group-hover:text-brand transition-colors">
                                                {act.title}
                                            </p>
                                            <span className="text-[8px] font-black px-2 py-0.5 bg-surface-border dark:bg-dark-border text-ink-muted uppercase rounded">
                                                {act.category}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-ink-muted font-bold">{act.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
