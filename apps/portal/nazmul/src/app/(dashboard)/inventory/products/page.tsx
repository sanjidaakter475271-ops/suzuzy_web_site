'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button, SidePanel, CSVImportPanel } from "@/components/ui";
import {
    Plus,
    Search,
    Filter,
    Edit2,
    History,
    Package,
    AlertTriangle,
    CheckCircle2,
    Import,
    Trash2,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { useInventoryStore } from "@/stores/inventoryStore";
import { cn } from "@/lib/utils";
import { Product } from "@/types/inventory";
import Image from "next/image";

export default function InventoryProductsPage() {
    const { products, addProduct, updateProduct } = useInventoryStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<'form' | 'import'>('form');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState<Product>({
        id: '',
        name: '',
        sku: '',
        category: 'parts',
        brand: '',
        price: 0,
        costPrice: 0,
        stock: 0,
        minStock: 5,
        status: 'in-stock',
        image: ''
    });

    const filteredProducts = products.filter(p =>
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (categoryFilter === 'all' || p.category === categoryFilter)
    );

    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockCount = products.filter(p => p.status === 'low-stock').length;

    const handleOpenPanel = (product?: Product) => {
        setPanelMode('form');
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                id: '',
                name: '',
                sku: '',
                category: 'parts',
                brand: '',
                price: 0,
                costPrice: 0,
                stock: 0,
                minStock: 5,
                status: 'in-stock',
                image: ''
            });
        }
        setIsPanelOpen(true);
    };

    const handleOpenImport = () => {
        setPanelMode('import');
        setIsPanelOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const productData: Product = {
            ...formData,
            id: editingProduct ? editingProduct.id : `PROD-${Date.now()}`,
            status: formData.stock <= 0 ? 'out-of-stock' : formData.stock <= formData.minStock ? 'low-stock' : 'in-stock',
            image: formData.image || `https://picsum.photos/200/200?random=${Date.now()}`
        };

        if (editingProduct) {
            updateProduct(productData);
        } else {
            addProduct(productData);
        }
        setIsPanelOpen(false);
    };

    const handleImport = (data: any[]) => {
        data.forEach((item, index) => {
            const newProduct: Product = {
                id: `IMP-${Date.now()}-${index}`,
                name: item.name || "Imported Item",
                sku: item.sku || `SKU-${Date.now()}-${index}`,
                category: (item.category as any) || 'parts',
                brand: item.brand || 'Generic',
                price: Number(item.price) || 0,
                costPrice: Number(item.costPrice) || 0,
                stock: Number(item.stock) || 0,
                minStock: Number(item.minStock) || 5,
                status: 'in-stock', // logic will set correct status
                image: `https://picsum.photos/200/200?random=${Date.now() + index}`
            };
            // Recalculate status
            newProduct.status = newProduct.stock <= 0 ? 'out-of-stock' : newProduct.stock <= newProduct.minStock ? 'low-stock' : 'in-stock';
            addProduct(newProduct);
        });
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade max-w-[1600px] mx-auto">
            <Breadcrumb items={[{ label: 'Inventory', href: '/inventory' }, { label: 'Products' }]} />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-brand to-brand-dark p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Package size={100} />
                    </div>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Total Items</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black">{products.length}</h2>
                        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                            <ArrowUpRight size={12} /> +5%
                        </span>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border p-6 rounded-3xl shadow-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-warning opacity-10 group-hover:scale-110 transition-transform">
                        <AlertTriangle size={100} />
                    </div>
                    <p className="text-sm font-bold text-ink-muted uppercase tracking-widest mb-1">Low Stock Alerts</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black text-ink-heading dark:text-white">{lowStockCount}</h2>
                        {lowStockCount > 0 && (
                            <span className="bg-warning/10 text-warning px-2 py-0.5 rounded-lg text-xs font-bold">Needs Action</span>
                        )}
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border p-6 rounded-3xl shadow-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-success opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={100} />
                    </div>
                    <p className="text-sm font-bold text-ink-muted uppercase tracking-widest mb-1">Inventory Value</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black text-ink-heading dark:text-white">৳{(totalValue / 1000).toFixed(1)}k</h2>
                        <span className="bg-success/10 text-success px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                            <ArrowUpRight size={12} /> Stable
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Spare Parts Catalog</h1>
                    <p className="text-ink-muted mt-2 font-medium">Manage spare parts, lubricants, and accessories.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleOpenImport} className="gap-2 bg-white dark:bg-dark-card shadow-sm hover:border-brand hover:text-brand">
                        <Import size={18} /> Import CSV
                    </Button>
                    <Button onClick={() => handleOpenPanel()} className="gap-2 shadow-lg shadow-brand/20">
                        <Plus size={18} /> Add New Product
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 sticky top-4 z-10">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name, SKU, Brand..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-brand transition-all text-sm font-bold shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {['all', 'parts', 'oil-consumables', 'accessories'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={cn(
                                "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border",
                                categoryFilter === cat
                                    ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
                                    : "bg-white dark:bg-dark-card border-surface-border dark:border-dark-border text-ink-muted hover:border-brand hover:text-brand"
                            )}
                        >
                            {cat.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <Card key={product.id} className="hover:border-brand transition-all group rounded-[2rem] overflow-hidden border-surface-border dark:border-dark-border shadow-card hover:shadow-xl hover:shadow-brand/5 dark:hover:shadow-none duration-300">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black uppercase text-ink-muted tracking-widest bg-surface-page dark:bg-dark-page px-2 py-0.5 rounded border border-surface-border dark:border-dark-border">
                                            {product.sku}
                                        </span>
                                        {product.stock <= product.minStock && (
                                            <span className="text-[10px] font-black uppercase text-danger tracking-widest bg-danger/5 px-2 py-0.5 rounded border border-danger/20 flex items-center gap-1">
                                                <AlertTriangle size={10} /> Low Stock
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-black text-ink-heading dark:text-white line-clamp-2 group-hover:text-brand transition-colors leading-tight mr-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-ink-muted mt-1 font-bold">{product.brand}</p>
                                </div>
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                    product.stock <= product.minStock ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                                )}>
                                    <Package size={24} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-surface-border dark:border-dark-border/50">
                                <div>
                                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Stock Level</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn(
                                            "text-2xl font-black",
                                            product.stock <= product.minStock ? "text-danger" : "text-ink-heading dark:text-white"
                                        )}>
                                            {product.stock}
                                        </span>
                                        <span className="text-xs font-bold text-ink-muted">units</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Retail Price</p>
                                    <p className="text-2xl font-black text-brand mt-1">৳{product.price}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-2">
                                <button className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-ink-muted hover:text-brand hover:bg-surface-page dark:hover:bg-dark-page rounded-xl transition-colors border border-transparent hover:border-surface-border dark:hover:border-dark-border flex items-center justify-center gap-2">
                                    <History size={14} />
                                    History
                                </button>
                                <button
                                    onClick={() => handleOpenPanel(product)}
                                    className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-ink-muted hover:text-brand hover:bg-surface-page dark:hover:bg-dark-page rounded-xl transition-colors border border-transparent hover:border-surface-border dark:hover:border-dark-border flex items-center justify-center gap-2"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Side Panel */}
            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title={panelMode === 'import' ? "Import Inventory" : (editingProduct ? "Edit Product" : "New Product")}
                width="max-w-xl"
            >
                {panelMode === 'import' ? (
                    <div className="h-full">
                        <CSVImportPanel
                            onImport={handleImport}
                            onClose={() => setIsPanelOpen(false)}
                            templateFields={['name', 'sku', 'price', 'stock', 'category', 'brand', 'costPrice']}
                        />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Product Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Brake Pad (Yamaha FZ)"
                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">SKU / Code <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="BRK-001"
                                    className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Brand</label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="e.g. Brembo"
                                    className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="parts">Spare Parts</option>
                                    <option value="accessories">Accessories</option>
                                    <option value="oil-consumables">Oil & Consumables</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Min. Stock Alert</label>
                                <input
                                    type="number"
                                    value={formData.minStock}
                                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                                    placeholder="5"
                                    className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface-page/50 dark:bg-dark-page/50 border border-surface-border dark:border-dark-border space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-ink-heading dark:text-white flex items-center gap-2">
                                <TrendingUp size={14} /> Pricing & Inventory
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Cost Price</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.costPrice}
                                        onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                                        placeholder="0.00"
                                        className="w-full bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Retail Price <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        placeholder="0.00"
                                        className="w-full bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all text-brand"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Current Stock <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    required
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                    className="w-full bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setIsPanelOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-brand/20">
                                {editingProduct ? "Save Changes" : "Add to Inventory"}
                            </Button>
                        </div>
                    </form>
                )}
            </SidePanel>
        </div>
    );
}
