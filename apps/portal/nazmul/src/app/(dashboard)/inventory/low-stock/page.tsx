'use client';

import React from 'react';
import {
    AlertTriangle,
    Package,
    Phone,
    ShoppingCart
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useInventoryStore } from '@/stores/inventoryStore';

const LowStockPage = () => {
    const { products } = useInventoryStore();

    const lowStockItems = products.filter(p => p.stock <= p.minStock);

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'Inventory', href: '/inventory' }, { label: 'Low Stock Alerts' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white flex items-center gap-3">
                        Low Stock Alerts
                        <span className="bg-danger text-white text-sm px-2 py-0.5 rounded-full animate-pulse">
                            {lowStockItems.length}
                        </span>
                    </h1>
                    <p className="text-sm text-ink-muted">Items below minimum threshold requiring reorder.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lowStockItems.map((product) => (
                    <Card key={product.id} className="border-l-4 border-l-danger hover:shadow-lg hover:shadow-danger/5 transition-all group">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-ink-heading dark:text-white group-hover:text-danger transition-colors">{product.name}</h3>
                                    <p className="text-xs text-ink-muted mt-1 font-bold uppercase tracking-wider">{product.sku}</p>
                                </div>
                                <AlertTriangle className="text-danger animate-pulse" size={24} />
                            </div>

                            <div className="bg-danger-bg p-4 rounded-xl border border-danger/20 flex items-center justify-between">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-danger/70">Current Stock</p>
                                    <p className="text-2xl font-black text-danger">{product.stock}</p>
                                </div>
                                <div className="h-8 w-px bg-danger/20" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-ink-muted">Min Limit</p>
                                    <p className="text-xl font-black text-ink-muted">{product.minStock}</p>
                                </div>
                            </div>

                            <button className="w-full bg-surface-page dark:bg-dark-page hover:bg-brand hover:text-white text-ink-muted font-bold py-3 rounded-xl border border-surface-border dark:border-dark-border transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-sm group-hover:border-brand">
                                <ShoppingCart size={16} />
                                Create Purchase Order
                            </button>
                        </CardContent>
                    </Card>
                ))}

                {lowStockItems.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4 bg-surface-card dark:bg-dark-card rounded-2xl border-2 border-dashed border-surface-border dark:border-dark-border">
                        <CheckCircle2 size={48} className="mx-auto text-success/40" />
                        <p className="text-ink-muted font-bold">All stock levels are healthy.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
import { CheckCircle2 } from 'lucide-react';

export default LowStockPage;
