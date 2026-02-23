'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button, SidePanel, CSVImportPanel } from "@/components/ui";
import { Plus, Search, Filter, Edit, Trash2, Package, Tag, TrendingUp, Download, Import, Upload } from "lucide-react";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import { cn } from "@/lib/utils";

interface Product {
    id: number;
    name: string;
    category: string;
    price: string;
    stock: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    image: string;
    sku: string;
}

const INITIAL_PRODUCTS: Product[] = [
    { id: 1, name: "Premium Leather Watch", category: "Accessories", price: "299.00", stock: 45, status: "In Stock", image: "https://picsum.photos/200/200?random=11", sku: "ACC-001" },
    { id: 2, name: "Wireless Noise Cancelling Headphones", category: "Electronics", price: "199.00", stock: 12, status: "Low Stock", image: "https://picsum.photos/200/200?random=12", sku: "ELE-042" },
    { id: 3, name: "Minimalist Desk Lamp", category: "Home Decor", price: "59.00", stock: 0, status: "Out of Stock", image: "https://picsum.photos/200/200?random=13", sku: "HOM-103" },
    { id: 4, name: "Ergonomic Office Chair", category: "Furniture", price: "450.00", stock: 28, status: "In Stock", image: "https://picsum.photos/200/200?random=14", sku: "FUR-201" },
];

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<'form' | 'import'>('form');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'Accessories',
        price: '',
        stock: 0,
        status: 'In Stock' as 'In Stock' | 'Low Stock' | 'Out of Stock'
    });

    const handleOpenPanel = (product?: Product) => {
        setPanelMode('form');
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                sku: product.sku,
                category: product.category,
                price: product.price,
                stock: product.stock,
                status: product.status
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', sku: '', category: 'Accessories', price: '', stock: 0, status: 'In Stock' });
        }
        setIsPanelOpen(true);
    };

    const handleOpenImport = () => {
        setPanelMode('import');
        setIsPanelOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
        } else {
            const newProduct: Product = {
                id: Date.now(),
                ...formData,
                image: `https://picsum.photos/200/200?random=${Date.now()}`
            };
            setProducts([...products, newProduct]);
        }
        setIsPanelOpen(false);
    };

    const handleImport = (data: any[]) => {
        const newProducts = data.map((item, index) => ({
            id: Date.now() + index,
            name: item.name || "Imported Product",
            category: item.category || "Uncategorized",
            price: item.price || "0",
            stock: Number(item.stock) || 0,
            status: (Number(item.stock) > 10 ? 'In Stock' : Number(item.stock) > 0 ? 'Low Stock' : 'Out of Stock') as any,
            image: "https://picsum.photos/200/200?random=" + (Date.now() + index),
            sku: item.sku || `IMP-${Date.now()}`
        }));
        setProducts([...products, ...newProducts]);
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade max-w-[1600px] mx-auto">
            <Breadcrumb items={[{ label: 'Products' }]} />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-brand to-brand-dark p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Package size={100} />
                    </div>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Total Inventory</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black">{products.reduce((acc, p) => acc + p.stock, 0)}</h2>
                        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-bold">Items</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border p-6 rounded-3xl shadow-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-brand opacity-5 group-hover:scale-110 transition-transform">
                        <Tag size={100} />
                    </div>
                    <p className="text-sm font-bold text-ink-muted uppercase tracking-widest mb-1">Active Products</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black text-ink-heading dark:text-white">{products.length}</h2>
                        <span className="bg-success/10 text-success px-2 py-0.5 rounded-lg text-xs font-bold">+2 New</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border p-6 rounded-3xl shadow-card relative overflow-hidden group hidden lg:block">
                    <div className="absolute top-0 right-0 p-4 text-brand opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp size={100} />
                    </div>
                    <p className="text-sm font-bold text-ink-muted uppercase tracking-widest mb-1">Total Value</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black text-ink-heading dark:text-white">
                            ৳{products.reduce((acc, p) => acc + (parseFloat(p.price) * p.stock), 0).toLocaleString()}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Product Catalog</h1>
                    <p className="text-ink-muted mt-2 font-medium">Manage your inventory, pricing, and product details.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleOpenImport} className="gap-2 bg-white dark:bg-dark-card shadow-sm hover:border-brand hover:text-brand">
                        <Import size={18} /> Import CSV
                    </Button>
                    <Button onClick={() => handleOpenPanel()} className="gap-2 shadow-lg shadow-brand/20">
                        <Plus size={18} /> Add Product
                    </Button>
                </div>
            </div>

            <Card className="rounded-[2rem] overflow-hidden border-surface-border dark:border-dark-border shadow-card">
                <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-surface-border dark:border-dark-border py-4 px-6 bg-surface-page/30 dark:bg-dark-page/30">
                    <div className="flex items-center bg-white dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-2xl px-4 py-2.5 w-full max-w-sm focus-within:border-brand transition-colors shadow-sm">
                        <Search size={18} className="text-ink-muted mr-3" />
                        <input type="text" placeholder="Search products..." className="bg-transparent border-none outline-none text-sm font-bold w-full text-ink-body dark:text-white placeholder:text-ink-muted/50" />
                    </div>
                    <Button variant="outline" className="gap-2 px-4 py-2.5 h-auto text-xs uppercase tracking-wider font-bold rounded-xl bg-white dark:bg-dark-card hover:bg-surface-page dark:hover:bg-dark-border">
                        <Filter size={16} /> Filters
                    </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-page dark:bg-dark-page/50 border-b border-surface-border dark:border-dark-border">
                                <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest">Stock</th>
                                <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-surface-hover/50 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => handleOpenPanel(product)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="border border-surface-border dark:border-dark-border rounded-xl p-1 bg-white dark:bg-dark-card">
                                                <Image src={product.image} width={48} height={48} className="rounded-lg object-cover w-12 h-12" alt={product.name} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-ink-heading dark:text-white group-hover:text-brand transition-colors block">{product.name}</span>
                                                <span className="text-[10px] font-mono text-ink-muted bg-surface-page dark:bg-dark-page px-1.5 py-0.5 rounded border border-surface-border dark:border-dark-border">{product.sku}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-ink-body dark:text-gray-300">{product.category}</td>
                                    <td className="px-6 py-4 text-sm font-black text-ink-heading dark:text-white">৳{product.price}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-ink-body dark:text-gray-300">{product.stock}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${product.status === 'In Stock' ? 'bg-success/10 text-success border-success/20' :
                                            product.status === 'Low Stock' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-danger/10 text-danger border-danger/20'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="outline" className="p-2 h-auto w-8 rounded-lg hover:text-brand hover:border-brand" onClick={() => handleOpenPanel(product)}>
                                                <Edit size={14} />
                                            </Button>
                                            <Button variant="outline" className="p-2 h-auto w-8 rounded-lg hover:text-danger hover:border-danger hover:bg-danger/10" onClick={() => handleDelete(product.id)}>
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

            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title={panelMode === 'import' ? "Bulk Import Products" : (editingProduct ? "Edit Product" : "Add New Product")}
                width="max-w-xl"
            >
                {panelMode === 'import' ? (
                    <div className="h-full">
                        <CSVImportPanel
                            onImport={handleImport}
                            onClose={() => setIsPanelOpen(false)}
                            templateFields={['name', 'sku', 'price', 'stock', 'category']}
                        />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Product Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Premium Cotton T-Shirt"
                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">SKU</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="TSH-001"
                                    className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Accessories">Accessories</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Home Decor">Home Decor</option>
                                    <option value="Furniture">Furniture</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Price <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Stock <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    required
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                    className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-muted ml-1">Description</label>
                            <textarea
                                rows={3}
                                placeholder="Product description..."
                                className="w-full bg-surface-page dark:bg-dark-page border-2 border-surface-border dark:border-dark-border rounded-2xl px-5 py-4 text-sm font-bold focus:border-brand outline-none transition-all placeholder:text-ink-muted/40 resize-none"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setIsPanelOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-brand/20">
                                {editingProduct ? "Save Changes" : "Create Product"}
                            </Button>
                        </div>
                    </form>
                )}
            </SidePanel>
        </div>
    );
}
