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
    ArrowDownRight,
    RefreshCw,
    Database,
    MapPin
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { useInventoryStore } from "@/stores/service-admin/inventoryStore";
import { cn } from "@/lib/utils";
import { Product } from "@/types/service-admin/inventory";
import Image from "next/image";
import { ProductSyncWizard } from "@/components/service-admin/inventory/ProductSyncWizard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function InventoryProductsPage() {
    const {
        products,
        bikeModels,
        categories,
        pagination,
        summary,
        fetchProducts,
        fetchBikeModels,
        fetchCategories,
        addProduct,
        updateProduct,
        isLoading
    } = useInventoryStore();

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebouncedValue(searchQuery, 400);

    const [categoryFilter, setCategoryFilter] = useState('all');
    const [bikeModelFilter, setBikeModelFilter] = useState('all');
    const [showLowStock, setShowLowStock] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<'form' | 'import' | 'sync'>('form');

    // Load metadata once
    React.useEffect(() => {
        fetchBikeModels();
        fetchCategories();
    }, [fetchBikeModels, fetchCategories]);

    // Reset to page 1 if any filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, categoryFilter, bikeModelFilter, showLowStock]);

    // Fetch products based on filters and page
    React.useEffect(() => {
        fetchProducts({
            search: debouncedSearch,
            categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
            bikeModelId: bikeModelFilter === 'all' ? undefined : bikeModelFilter,
            stockStatus: showLowStock ? 'low' : undefined,
            page: currentPage,
            limit: 50
        });
    }, [fetchProducts, debouncedSearch, categoryFilter, bikeModelFilter, showLowStock, currentPage]);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState<Product>({
        id: '',
        name: '',
        sku: '',
        category: '', // will be set dynamically or left empty for prompt
        brand: '',
        price: 0,
        costPrice: 0,
        stock: 0,
        minStock: 5,
        status: 'in-stock',
        image: '',
        specifications: { warehouse_bin: '' }
    });

    const handleOpenPanel = (product?: Product) => {
        setPanelMode('form');
        if (product) {
            setEditingProduct(product);
            setFormData({
                ...product,
                specifications: product.specifications || { warehouse_bin: '' }
            });
        } else {
            setEditingProduct(null);
            setFormData({
                id: '',
                name: '',
                sku: '',
                category: categories.length > 0 ? categories[0].id : '',
                brand: '',
                price: 0,
                costPrice: 0,
                stock: 0,
                minStock: 5,
                status: 'in-stock',
                image: '',
                specifications: { warehouse_bin: '' }
            });
        }
        setIsPanelOpen(true);
    };

    const handleOpenImport = () => {
        setPanelMode('import');
        setIsPanelOpen(true);
    };

    const handleOpenSync = () => {
        setPanelMode('sync');
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
            <Breadcrumb items={[{ label: 'Inventory', href: '/service-admin/inventory' }, { label: 'Products' }]} />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-brand to-brand-dark p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Package size={100} />
                    </div>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Total Items</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black">{summary?.totalItems || 0}</h2>
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
                        <h2 className="text-4xl font-black text-ink-heading dark:text-white">{summary?.lowStockCount || 0}</h2>
                        {(summary?.lowStockCount || 0) > 0 && (
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
                        <h2 className="text-4xl font-black text-ink-heading dark:text-white">৳{((summary?.totalValue || 0) / 1000).toFixed(1)}k</h2>
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
                    <Button variant="outline" onClick={handleOpenSync} className="gap-2 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shadow-sm hover:bg-indigo-100 transition-colors">
                        <Database size={18} /> Advanced Sync
                    </Button>
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
                        placeholder="Search by Part Number, Name, SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-brand transition-all text-sm font-bold shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowLowStock(!showLowStock)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase transition-all shadow-sm border",
                            showLowStock
                                ? "bg-danger text-white border-danger shadow-danger/20"
                                : "bg-white dark:bg-dark-card border-surface-border dark:border-dark-border text-ink-muted hover:border-danger hover:text-danger"
                        )}
                    >
                        <AlertTriangle size={14} />
                        Critical Stock
                    </button>
                    <select
                        value={bikeModelFilter}
                        onChange={(e) => setBikeModelFilter(e.target.value)}
                        className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 text-xs font-black uppercase focus:outline-none focus:border-brand shadow-sm min-w-[150px]"
                    >
                        <option value="all">All Models</option>
                        {bikeModels.map(bm => (
                            <option key={bm.id} value={bm.id}>{bm.name}</option>
                        ))}
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl px-4 py-3 text-xs font-black uppercase focus:outline-none focus:border-brand shadow-sm min-w-[150px]"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.level === 1 ? '— ' : ''}{cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading && products.length === 0 ? (
                    // Inventory Skeletons
                    Array.from({ length: 6 }).map((_, idx) => (
                        <Card key={`skeleton-${idx}`} className="rounded-[2.5rem] overflow-hidden border-surface-border dark:border-white/5 shadow-card animate-pulse bg-white dark:bg-white/5 h-[350px]">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                        <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 py-6 border-y border-surface-border dark:border-white/5">
                                    <div className="space-y-2">
                                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                                    </div>
                                    <div className="space-y-2 text-right flex flex-col items-end">
                                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1" />
                                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : !isLoading && products.length === 0 ? (
                    // Empty State
                    <div className="col-span-full py-20 text-center space-y-4 bg-white dark:bg-dark-card rounded-3xl border-2 border-dashed border-surface-border dark:border-dark-border flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-brand/5 rounded-full flex items-center justify-center mb-2">
                            <Search size={40} className="text-brand/40" />
                        </div>
                        <h3 className="text-xl font-black text-ink-heading dark:text-white">No products found</h3>
                        <p className="text-ink-muted max-w-md font-medium">We couldn't find any products matching your current filters or search query. Try adjusting your search or add a new product.</p>
                        <Button onClick={() => handleOpenPanel()} className="mt-4 gap-2 shadow-lg shadow-brand/20">
                            <Plus size={18} /> Add New Product
                        </Button>
                    </div>
                ) : (
                    products.map((product) => (
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
                                        {product.specifications?.warehouse_bin && (
                                            <span className="text-[10px] font-black uppercase text-brand tracking-widest bg-brand/5 px-2 py-0.5 rounded border border-brand/20 flex items-center gap-1">
                                                <MapPin size={10} /> Bin: {product.specifications.warehouse_bin}
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
                )))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 p-4 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-ink-muted">
                        Showing page <span className="text-brand">{pagination.page}</span> of {pagination.totalPages} ({summary?.totalItems || 0} total items)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={pagination.page <= 1 || isLoading}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="bg-surface-page dark:bg-dark-page text-xs font-bold px-4 py-2"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            disabled={pagination.page >= pagination.totalPages || isLoading}
                            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                            className="bg-surface-page dark:bg-dark-page text-xs font-bold px-4 py-2"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Side Panel */}
            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title={panelMode === 'sync' ? "Advanced Parts Sync" : (panelMode === 'import' ? "Import Inventory" : (editingProduct ? "Edit Product" : "New Product"))}
                width={panelMode === 'sync' ? "max-w-4xl" : "max-w-xl"}
            >
                {panelMode === 'sync' ? (
                    <ProductSyncWizard onClose={() => setIsPanelOpen(false)} />
                ) : panelMode === 'import' ? (
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
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>
                                            {cat.level === 1 ? '— ' : ''}{cat.name}
                                        </option>
                                    ))}
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1 flex items-center gap-1">
                                <MapPin size={12} className="text-brand" /> Warehouse Bin / Location
                            </label>
                            <input
                                type="text"
                                value={formData.specifications?.warehouse_bin || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    specifications: { ...formData.specifications, warehouse_bin: e.target.value }
                                })}
                                placeholder="e.g. C-5-12"
                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                            />
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
