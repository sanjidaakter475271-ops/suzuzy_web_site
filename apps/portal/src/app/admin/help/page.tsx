'use client';

import React, { useState, useMemo } from 'react';
import {
    HelpCircle,
    Search,
    BookOpen,
    MessageCircle,
    Zap,
    ChevronDown,
    ChevronUp,
    PlayCircle,
    FileText,
    ExternalLink,
    Send,
    Keyboard,
    History,
    Activity,
    Database,
    Cloud,
    AlertCircle,
    CheckCircle2,
    Paperclip,
    Monitor,
    Shield
} from 'lucide-react';
import { Button } from '@/components/ui';
import Breadcrumb from '@/components/Breadcrumb';
import { cn } from '@/lib/utils';

const HelpPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const FAQS = [
        {
            q: "How do I update my profile information?",
            a: "Go to Account > My Profile and click on the 'Edit Profile' button. You can update your name, contact details, and upload a new profile picture. Make sure to click 'Save' to apply changes."
        },
        {
            q: "How to export the consolidated financial report?",
            a: "Navigate to Finance > Combined Reports. Select your desired date range and click on the 'Export PDF' button. You can choose different templates in the Settings > Finance tab."
        },
        {
            q: "Can I manage multiple warehouse stocks?",
            a: "Yes, use the Warehouse module to add multiple hubs. You can track individual stock levels, perform transfers between hubs, and set location-specific low stock alerts."
        },
        {
            q: "How to recover my password?",
            a: "On the login page, click 'Forgot Password'. Enter your registered email to receive a secure recovery link. Note: Links expire after 30 minutes."
        },
        {
            q: "How to use the POS System Manager?",
            a: "Navigate to POS System > POS Manager. Here you can configure active terminals, view real-time sales per outlet, and manage terminal operators.",
            category: "POS"
        },
        {
            q: "How do I reconcile cashbook entries?",
            a: "Go to Finance > Manage Finance > CashBook tab. Compare your physical cash with the 'System Balance'. If there's a discrepancy, add a 'Correction' entry.",
            category: "Finance"
        },
        {
            q: "Can I assign specific roles to users?",
            a: "Yes, go to User Management > Roles & Permissions. You can create custom roles (e.g., Warehouse Manager) and toggling specific module access.",
            category: "User Management"
        }
    ];

    const GUIDE_CATEGORIES = [
        { title: 'Getting Started', icon: Zap, count: 5, color: 'bg-brand/10 text-brand', description: 'Basics of RC Autocore' },
        { title: 'Finance Module', icon: FileText, count: 12, color: 'bg-brand-light/10 text-brand', description: 'Reports & Transactions' },
        { title: 'Warehouse Logan', icon: BookOpen, count: 8, color: 'bg-success/10 text-success', description: 'Stock & Logistics' },
        { title: 'POS System', icon: Monitor, count: 6, color: 'bg-brand-light/10 text-brand-light', description: 'Terminal Management' },
    ];

    const SHORTCUTS = [
        { key: 'Ctrl + S', description: 'Save current record / changes' },
        { key: 'Ctrl + P', description: 'Print active report or invoice' },
        { key: 'Ctrl + F', description: 'Global search focus' },
        { key: 'Alt + N', description: 'Create new entry (Any Module)' },
        { key: 'Esc', description: 'Close modal or cancel action' },
    ];

    const CHANGELOG = [
        { version: 'v2.4.0', date: 'Feb 10, 2024', changes: ['Improved Finance tab in settings', 'Added stat counters to profile', 'Real-time FAQ filtering'] },
        { version: 'v2.3.5', date: 'Jan 28, 2024', changes: ['Enhanced dark mode contrast', 'New POS Manager dashboard', 'Security performance fixes'] },
    ];

    const filteredFaqs = useMemo(() => {
        if (!searchQuery) return FAQS;
        return FAQS.filter(faq =>
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="p-6 lg:p-8 space-y-16 animate-fade max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <div className="flex justify-center">
                    <div className="p-6 bg-brand/10 text-brand rounded-[32px] animate-fade-in shadow-inner">
                        <HelpCircle size={64} strokeWidth={1.5} />
                    </div>
                </div>
                <h1 className="text-5xl font-black text-ink-heading dark:text-white uppercase tracking-tighter mt-6">
                    Help Center
                </h1>
                <p className="text-lg font-bold text-ink-muted uppercase tracking-[0.2em] mb-10">Search documentation & support</p>
                <div className="relative group max-w-2xl mx-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Type your question (e.g. 'how to print report')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-20 pl-16 pr-8 bg-surface-card dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-[40px] text-lg font-black shadow-card focus:border-brand dark:focus:border-brand outline-none transition-all dark:text-white placeholder:text-ink-muted/50"
                    />
                </div>
            </div>

            {/* Quick Stats / System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'API Status', value: 'Operational', icon: Activity, color: 'text-success' },
                    { label: 'Cloud Sync', value: '1.2s Latency', icon: Cloud, color: 'text-brand' },
                    { label: 'Database', value: 'Last Backup: 2h ago', icon: Database, color: 'text-brand-light' },
                ].map((status, i) => (
                    <div key={i} className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border p-6 rounded-[32px] flex items-center gap-5">
                        <div className={cn("p-3 rounded-2xl bg-surface-page dark:bg-dark-page shadow-inner", status.color)}>
                            <status.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">{status.label}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-ink-heading dark:text-white uppercase tracking-tight">{status.value}</span>
                                {i === 0 && <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Guide Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {GUIDE_CATEGORIES.map((cat, i) => (
                    <div key={i} className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border p-8 rounded-[40px] shadow-card hover:shadow-hover hover:-translate-y-2 transition-all cursor-pointer group flex flex-col items-center text-center">
                        <div className={cn("p-5 rounded-[24px] mb-6 group-hover:scale-110 transition-transform shadow-lg", cat.color)}>
                            <cat.icon size={32} />
                        </div>
                        <h3 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight">{cat.title}</h3>
                        <p className="text-[10px] text-ink-muted font-bold mt-2 uppercase tracking-[0.1em]">{cat.description}</p>
                        <div className="mt-6 px-4 py-1.5 bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-full text-[10px] font-black text-brand uppercase">
                            {cat.count} Articles
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* FAQ Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight flex items-center gap-4">
                            <MessageCircle className="text-brand" size={28} /> FAQs & Solutions
                        </h2>
                        {searchQuery && (
                            <span className="text-[10px] font-black bg-brand text-white px-3 py-1 rounded-full uppercase tracking-widest">
                                {filteredFaqs.length} Results
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, i) => (
                                <div key={i} className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-[32px] overflow-hidden shadow-soft group hover:border-brand/30 transition-all">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-7 text-left hover:bg-surface-hover/50 dark:hover:bg-dark-sidebar/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                                            <span className="text-sm font-black text-ink-heading dark:text-white uppercase tracking-tight group-hover:text-brand transition-colors">{faq.q}</span>
                                        </div>
                                        {openFaq === i ? <ChevronUp className="text-brand" /> : <ChevronDown className="text-ink-muted" />}
                                    </button>
                                    <div className={cn(
                                        "transition-all duration-300 ease-in-out",
                                        openFaq === i ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                                    )}>
                                        <div className="p-8 pt-0 text-base text-ink-body dark:text-gray-300 font-medium leading-relaxed border-t border-surface-border dark:border-dark-border mx-7 mt-2 mb-6">
                                            {faq.a}
                                            <div className="mt-8 flex gap-3">
                                                <Button variant="outline" className="text-[10px] h-8 px-4 rounded-xl font-black uppercase tracking-widest gap-2">
                                                    <FileText size={12} /> View Full Guide
                                                </Button>
                                                <Button variant="outline" className="text-[10px] h-8 px-4 rounded-xl font-black uppercase tracking-widest gap-2">
                                                    Was this helpful?
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-[40px] p-16 text-center animate-fade-in group">
                                <div className="p-6 bg-brand/5 border-2 border-dashed border-brand/20 rounded-full w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <AlertCircle className="text-brand/40" size={48} />
                                </div>
                                <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tight">No results for "{searchQuery}"</h3>
                                <p className="text-xs text-ink-muted font-bold mt-2 uppercase tracking-widest">Try searching for keywords like 'report', 'password', or 'pos'</p>
                                <Button
                                    onClick={() => setSearchQuery('')}
                                    variant="outline"
                                    className="mt-8 h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest border-brand text-brand hover:bg-brand hover:text-white transition-all shadow-lg shadow-brand/10"
                                >
                                    Clear Search
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-12">
                    {/* Keyboard Shortcuts */}
                    <div className="bg-surface-card dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-[40px] p-8 shadow-card">
                        <h3 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                            <Keyboard className="text-brand" size={24} /> Shortcuts
                        </h3>
                        <div className="space-y-4">
                            {SHORTCUTS.map((sc, i) => (
                                <div key={i} className="flex items-center justify-between pb-4 border-b border-surface-border dark:border-dark-border last:border-0 last:pb-0">
                                    <span className="text-[10px] font-black text-ink-muted uppercase tracking-widest">{sc.description}</span>
                                    <code className="px-3 py-1 bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg text-xs font-black text-brand shadow-sm">{sc.key}</code>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Changelog Section */}
                    <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-[40px] p-8 shadow-card overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <History size={100} />
                        </div>
                        <h3 className="text-lg font-black text-ink-heading dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                            <History className="text-brand" size={24} /> What's New
                        </h3>
                        <div className="space-y-8">
                            {CHANGELOG.map((log, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black bg-brand/10 text-brand px-2 py-0.5 rounded uppercase">{log.version}</span>
                                        <span className="text-[10px] font-bold text-ink-muted">{log.date}</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {log.changes.map((change, j) => (
                                            <li key={j} className="flex gap-2 text-xs font-bold text-ink-body dark:text-gray-300">
                                                <div className="w-1 h-1 rounded-full bg-brand mt-1.5 shrink-0"></div>
                                                {change}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-8 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest">Full Changelog</Button>
                    </div>

                    {/* Support Block */}
                    <div className="bg-brand rounded-[40px] p-8 text-white shadow-xl shadow-brand/20 relative overflow-hidden group">
                        <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover:scale-110 transition-transform">
                            <AlertCircle size={150} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4 relative z-10">Direct Support</h3>
                        <p className="text-sm font-bold opacity-80 mb-8 relative z-10">Cannot find the answer? Create a specialized ticket for our engineers.</p>
                        <div className="space-y-4 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black opacity-60 uppercase tracking-widest pl-1">Priority Level</label>
                                <select className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs font-black uppercase tracking-widest outline-none text-white appearance-none">
                                    <option className="bg-dark-card">Standard (Low)</option>
                                    <option className="bg-dark-card">High Importance</option>
                                    <option className="bg-dark-card">Critical Action</option>
                                </select>
                            </div>
                            <Button className="w-full h-14 bg-white text-brand hover:bg-surface-hover rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg transition-transform active:scale-95">Open Support Ticket</Button>
                        </div>
                        <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[8px] font-black uppercase tracking-widest opacity-60">
                            <span>Last Response: 4m ago</span>
                            <div className="flex items-center gap-1"><CheckCircle2 size={10} /> Online</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documentation Links Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-6">
                {[
                    { label: 'Cloud API', icon: Cloud },
                    { label: 'POS Hardware', icon: Monitor },
                    { label: 'Developer SDK', icon: Database },
                    { label: 'Security Policy', icon: Shield },
                ].map((link, i) => (
                    <button key={i} className="flex items-center justify-between p-6 bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-3xl shadow-soft hover:border-brand/40 group transition-all text-left">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-brand/5 text-brand rounded-xl group-hover:bg-brand group-hover:text-white transition-all">
                                <link.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-ink-heading dark:text-white uppercase tracking-widest">{link.label}</span>
                        </div>
                        <ExternalLink size={14} className="text-ink-muted group-hover:text-brand transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HelpPage;
