'use client';

import React, { useState } from 'react';
import {
    PackagePlus,
    Search,
    PackageMinus,
    Calendar as CalendarIcon,
    User,
    CheckCircle2,
    ArrowRight,
    History
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent, Button, SidePanel, DatePicker } from '@/components/ui';
import { useInventoryStore } from '@/stores/inventoryStore';
import { cn } from '@/lib/utils';

export default function StockAdjustmentPage() {
    const { adjustments, products, updateStock } = useInventoryStore();
    const [filterType, setFilterType] = useState('all');
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');

    // Form State
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

    const handleSubmit = (e: React.FormEvent) => {
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
        <div className="p-6 lg:p-8 space-y-8 animate-fade max-w-5xl mx-auto">
            <Breadcrumb items={[{ label: 'Inventory', href: '/inventory' }, { label: 'Stock Adjustment' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Stock Movements</h1>
                    <p className="text-ink-muted mt-2 font-medium">Manually adjust inventory levels (In/Out).</p>
                </div>
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
            </div>

            <Card className="rounded-[2rem] overflow-hidden border-surface-border dark:border-dark-border shadow-card">
                <div className="p-6 border-b border-surface-border dark:border-dark-border flex items-center justify-between bg-surface-page/30 dark:bg-dark-page/30">
                    <h3 className="font-black text-ink-heading dark:text-white uppercase text-sm tracking-widest flex items-center gap-2">
                        <History size={16} /> Recent Adjustments
                    </h3>
                    <div className="flex gap-2">
                        {['all', 'in', 'out'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                                    filterType === type
                                        ? (type === 'in' ? "bg-success text-white border-success" : type === 'out' ? "bg-danger text-white border-danger" : "bg-brand text-white border-brand")
                                        : "bg-white dark:bg-dark-card border-surface-border dark:border-dark-border text-ink-muted hover:border-brand hover:text-brand"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-surface-border dark:divide-dark-border/50">
                    {filteredAdjustments.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-ink-muted font-bold">No adjustments found.</p>
                        </div>
                    ) : (
                        filteredAdjustments.map((adj) => {
                            const product = products.find(p => p.id === adj.productId);
                            return (
                                <div key={adj.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-page dark:hover:bg-dark-page/50 transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg",
                                            adj.type === 'in' ? "bg-success shadow-success/20" : "bg-danger shadow-danger/20"
                                        )}>
                                            {adj.type === 'in' ? <PackagePlus size={24} /> : <PackageMinus size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-black text-ink-heading dark:text-white text-lg tracking-tight">
                                                    {product ? product.name : `Unknown Product (${adj.productId})`}
                                                </p>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase px-2 py-0.5 rounded border",
                                                    adj.type === 'in' ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
                                                )}>
                                                    {adj.type === 'in' ? "+ Added" : "- Removed"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-ink-muted mt-1 font-bold flex items-center gap-2">
                                                <span className="opacity-50">Reason:</span> {adj.reason}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-8 text-xs text-ink-muted">
                                        <div className="text-right">
                                            <p className="uppercase tracking-wider font-bold mb-1 opacity-50">Quantity</p>
                                            <p className={cn("font-black text-xl", adj.type === 'in' ? "text-success" : "text-danger")}>
                                                {adj.type === 'in' ? '+' : '-'}{adj.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="uppercase tracking-wider font-bold mb-1 opacity-50">Date</p>
                                            <div className="flex items-center gap-1.5 justify-end font-bold text-ink-heading dark:text-white">
                                                <CalendarIcon size={14} className="text-ink-muted" />
                                                {adj.date}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </Card>

            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title={adjustmentType === 'in' ? "Stock In (Replenish)" : "Stock Out (Usage)"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
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
