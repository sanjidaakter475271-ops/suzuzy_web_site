'use client';

import React, { useState } from 'react';
import {
    Wrench,
    CheckCircle2,
    XCircle,
    ClipboardList,
    Clock,
    User,
    PackagePlus,
    Search,
    PackageMinus,
    Calendar as CalendarIcon,
    ArrowRight,
    History
} from 'lucide-react';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Card, CardContent, Button, SidePanel, DatePicker } from '@/components/service-admin/ui';
import { useInventoryStore } from '@/stores/service-admin/inventoryStore';
import { cn } from '@/lib/utils';

export default function StockOperationsPage() {
    const {
        partsIssues,
        adjustments,
        products,
        updateStock,
        fetchProducts,
        fetchAdjustments,
        fetchRequisitions,
        approveRequisition,
        rejectRequisition,
        isLoading
    } = useInventoryStore();

    const [activeTab, setActiveTab] = useState<'requests' | 'adjustments'>('requests');
    const [filterType, setFilterType] = useState('all');
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');

    React.useEffect(() => {
        fetchProducts();
        fetchAdjustments();
        fetchRequisitions();
    }, [fetchProducts, fetchAdjustments, fetchRequisitions]);

    // Form State for Manual Adjustments
    const [formData, setFormData] = useState({
        productId: '',
        quantity: 0,
        reason: '',
        date: new Date()
    });

    const filteredAdjustments = adjustments.filter(adj =>
        filterType === 'all' || adj.type === filterType
    );

    const handleOpenPanel = (type: 'in' | 'out') => {
        setAdjustmentType(type);
        setFormData({
            productId: '',
            quantity: 0,
            reason: '',
            date: new Date()
        });
        setIsPanelOpen(true);
    };

    const handleAdjustmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId || formData.quantity <= 0) return;

        updateStock(
            formData.productId,
            formData.quantity,
            adjustmentType,
            formData.reason || (adjustmentType === 'in' ? 'Stock Replenishment' : 'Usage/Damage')
        );
        setIsPanelOpen(false);
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade max-w-[1200px] mx-auto">
            <Breadcrumb items={[{ label: 'Inventory', href: '/service-admin/inventory' }, { label: 'Stock Operations' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Stock Operations</h1>
                    <p className="text-ink-muted mt-2 font-medium">Manage workshop requests and manual stock adjustments.</p>
                </div>
                {activeTab === 'adjustments' && (
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => handleOpenPanel('in')}
                            className="flex items-center gap-2 bg-success text-white px-6 py-3 rounded-2xl font-black hover:bg-success-hover shadow-lg shadow-success/20 active:scale-95 transition-all text-sm uppercase tracking-wider"
                        >
                            <PackagePlus size={18} />
                            Stock In
                        </Button>
                        <Button
                            onClick={() => handleOpenPanel('out')}
                            className="flex items-center gap-2 bg-danger text-white px-6 py-3 rounded-2xl font-black hover:bg-danger-hover shadow-lg shadow-danger/20 active:scale-95 transition-all text-sm uppercase tracking-wider"
                        >
                            <PackageMinus size={18} />
                            Stock Out
                        </Button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-surface-border dark:border-dark-border">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={cn(
                        "px-6 py-3 font-black uppercase tracking-wider text-sm border-b-2 transition-all",
                        activeTab === 'requests'
                            ? "border-brand text-brand"
                            : "border-transparent text-ink-muted hover:text-ink-heading dark:hover:text-white"
                    )}
                >
                    Workshop Requests ({partsIssues.length})
                </button>
                <button
                    onClick={() => setActiveTab('adjustments')}
                    className={cn(
                        "px-6 py-3 font-black uppercase tracking-wider text-sm border-b-2 transition-all",
                        activeTab === 'adjustments'
                            ? "border-brand text-brand"
                            : "border-transparent text-ink-muted hover:text-ink-heading dark:hover:text-white"
                    )}
                >
                    Manual Adjustments
                </button>
            </div>

            {/* Content - Workshop Requests */}
            {activeTab === 'requests' && (
                <div className="space-y-6">
                    {isLoading && partsIssues.length === 0 ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                            <Card key={`req-skel-${idx}`} className="rounded-2xl border-surface-border dark:border-dark-border shadow-sm animate-pulse">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                                            <div className="space-y-2">
                                                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-64"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 min-w-[250px] space-y-3">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                        </div>
                                        <div className="flex flex-col gap-3 min-w-[150px] justify-center pl-6">
                                            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
                                            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : partsIssues.length === 0 ? (
                        <div className="py-20 text-center space-y-4 bg-surface-card dark:bg-dark-card rounded-2xl border-2 border-dashed border-surface-border dark:border-dark-border">
                            <CheckCircle2 size={48} className="mx-auto text-success/40" />
                            <p className="text-ink-muted font-bold text-lg">No pending requisitions from workshop.</p>
                            <p className="text-xs text-ink-muted/70 uppercase tracking-widest">You're all caught up!</p>
                        </div>
                    ) : (
                        partsIssues.map((issue) => (
                            <Card key={issue.id} className="hover:border-brand transition-all group rounded-2xl shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                                <Wrench size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg text-ink-heading dark:text-white">Job Card: {issue.jobCardId}</h3>
                                                    <span className="bg-warning/10 text-warning px-2 py-0.5 rounded text-[10px] font-black uppercase border border-warning/20">
                                                        {issue.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted font-bold mt-2">
                                                    <span className="flex items-center gap-1.5"><ClipboardList size={14} /> Req #{issue.id.slice(0, 8)}...</span>
                                                    <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(issue.issuedAt).toLocaleString()}</span>
                                                    <span className="flex items-center gap-1.5"><User size={14} /> {issue.issuedBy}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-surface-page dark:bg-dark-page rounded-xl p-4 border border-surface-border dark:border-dark-border min-w-[250px]">
                                            <h4 className="text-[10px] font-black uppercase text-ink-muted tracking-wider mb-3 border-b border-surface-border dark:border-dark-border pb-2">Requested Parts</h4>
                                            <div className="space-y-3">
                                                {issue.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <span className="font-bold text-ink-heading dark:text-white truncate pr-4">{item.productName || item.productId}</span>
                                                        <span className="font-black text-brand bg-brand/10 px-2 py-1 rounded">Qty: {item.qty}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 min-w-[150px] justify-center border-l border-surface-border dark:border-dark-border pl-6">
                                            <button
                                                onClick={() => approveRequisition(issue.id)}
                                                className="w-full bg-success text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-success-hover shadow-lg shadow-success/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={16} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const reason = prompt("Reason for rejection:");
                                                    if (reason) rejectRequisition(issue.id, reason);
                                                }}
                                                className="w-full py-3 bg-white dark:bg-dark-card text-danger font-bold rounded-xl hover:bg-danger/5 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider border border-danger/30 hover:border-danger"
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Content - Manual Adjustments */}
            {activeTab === 'adjustments' && (
                <Card className="rounded-2xl overflow-hidden border-surface-border dark:border-dark-border shadow-sm">
                    <div className="p-6 border-b border-surface-border dark:border-dark-border flex items-center justify-between bg-surface-page/30 dark:bg-dark-page/30">
                        <h3 className="font-black text-ink-heading dark:text-white uppercase text-sm tracking-widest flex items-center gap-2">
                            <History size={16} /> Adjustment History
                        </h3>
                        <div className="flex gap-2">
                            {['all', 'in', 'out'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                                        filterType === type
                                            ? (type === 'in' ? "bg-success text-white border-success shadow-md shadow-success/20" : type === 'out' ? "bg-danger text-white border-danger shadow-md shadow-danger/20" : "bg-brand text-white border-brand shadow-md shadow-brand/20")
                                            : "bg-white dark:bg-dark-card border-surface-border dark:border-dark-border text-ink-muted hover:border-brand hover:text-brand"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="divide-y divide-surface-border dark:divide-dark-border/50">
                        {isLoading && filteredAdjustments.length === 0 ? (
                            Array.from({ length: 3 }).map((_, idx) => (
                                <div key={`adj-skel-${idx}`} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
                                    <div className="flex items-center gap-5 w-full">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                                        <div className="space-y-2 w-full max-w-md">
                                            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 w-full md:w-auto">
                                        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
                                        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                                    </div>
                                </div>
                            ))
                        ) : filteredAdjustments.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-ink-muted font-bold">No adjustments found.</p>
                            </div>
                        ) : (
                            filteredAdjustments.map((adj) => (
                                <div key={adj.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-page dark:hover:bg-dark-page/50 transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md",
                                            adj.type === 'in' ? "bg-success shadow-success/20" : "bg-danger shadow-danger/20"
                                        )}>
                                            {adj.type === 'in' ? <PackagePlus size={24} /> : <PackageMinus size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-black text-ink-heading dark:text-white text-lg tracking-tight">
                                                    {adj.productName || `Unknown Product (${adj.productId})`}
                                                </p>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase px-2 py-0.5 rounded border",
                                                    adj.type === 'in' ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
                                                )}>
                                                    {adj.type === 'in' ? "+ Added" : "- Removed"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-ink-muted mt-1 font-bold flex items-center gap-2">
                                                <User size={12} className="opacity-50" /> {adj.performedBy}
                                                <span className="opacity-30">|</span>
                                                <span className="opacity-50">Reason:</span> {adj.reason}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-8 text-xs text-ink-muted">
                                        <div className="text-right">
                                            <p className="uppercase tracking-wider font-bold mb-1 opacity-50">Quantity</p>
                                            <p className={cn("font-black text-2xl", adj.type === 'in' ? "text-success" : "text-danger")}>
                                                {adj.type === 'in' ? '+' : '-'}{adj.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right border-l border-surface-border dark:border-dark-border pl-6">
                                            <p className="uppercase tracking-wider font-bold mb-1 opacity-50">Date</p>
                                            <div className="flex items-center gap-1.5 justify-end font-bold text-ink-heading dark:text-white text-sm">
                                                <CalendarIcon size={14} className="text-ink-muted" />
                                                {adj.date}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            )}

            {/* Manual Adjustment Side Panel */}
            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title={adjustmentType === 'in' ? "Stock In (Replenish)" : "Stock Out (Usage)"}
                width="max-w-md"
            >
                <form onSubmit={handleAdjustmentSubmit} className="space-y-6 pb-20">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Select Product <span className="text-danger">*</span></label>
                        <select
                            required
                            value={formData.productId}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                            className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">-- Choose Product --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Cur. {p.stock})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Quantity <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Date</label>
                            <DatePicker
                                value={formData.date}
                                align="right"
                                onChange={(date) => setFormData({ ...formData, date: date || new Date() })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Reason (Optional)</label>
                        <textarea
                            rows={3}
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder={adjustmentType === 'in' ? "e.g. Purchase Order #123" : "e.g. Damaged in transport"}
                            className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all resize-none placeholder:text-ink-muted/40"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setIsPanelOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className={cn(
                            "flex-1 rounded-xl h-12 font-bold shadow-lg text-white",
                            adjustmentType === 'in' ? "bg-success hover:bg-success-hover shadow-success/20" : "bg-danger hover:bg-danger-hover shadow-danger/20"
                        )}>
                            {adjustmentType === 'in' ? "Confirm Stock In" : "Confirm Stock Out"}
                        </Button>
                    </div>
                </form>
            </SidePanel>
        </div>
    );
}
