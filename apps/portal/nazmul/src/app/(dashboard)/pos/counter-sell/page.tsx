'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import Breadcrumb from '@/components/Breadcrumb';
import { Search, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { usePOSStore } from '@/stores/posStore';
import { Product } from '@/types/inventory';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const CounterSellPage = () => {
    const { products, cart, addToCart, removeFromCart, updateQty, checkout } = usePOSStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        if (query.length > 1) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.sku.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery) {
            const exactMatch = products.find(p => p.sku.toLowerCase() === searchQuery.toLowerCase());
            const match = exactMatch || (suggestions.length === 1 ? suggestions[0] : null);

            if (match) {
                const remaining = match.stock - (cart.find(i => i.productId === match.id)?.qty || 0);
                if (remaining > 0) {
                    addToCart(match);
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            }
        }
    };

    const filteredAndSortedProducts = products
        .filter(p =>
            (selectedCategory === 'All' || p.category === selectedCategory) &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    const cartTotal = cart.reduce((acc, item) => acc + item.amount, 0);

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade h-[calc(100vh-80px)] flex flex-col">
            <Breadcrumb items={[{ label: 'POS' }, { label: 'Counter Sales' }]} />

            <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                {/* Left: Product Catalog */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Scan barcode or search products..."
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl focus:border-brand outline-none transition-all font-medium"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                            />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl shadow-2xl z-[100] overflow-hidden">
                                    <div className="p-2 border-b border-surface-border dark:border-dark-border bg-surface-page/50 dark:bg-black/20">
                                        <p className="text-[10px] font-black uppercase text-ink-muted tracking-widest pl-2">Quick Results</p>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {suggestions.map((p) => {
                                            const remaining = p.stock - (cart.find(i => i.productId === p.id)?.qty || 0);
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        if (remaining > 0) {
                                                            addToCart(p);
                                                            setSearchQuery('');
                                                            setSuggestions([]);
                                                            setShowSuggestions(false);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-4 p-3 hover:bg-surface-page dark:hover:bg-black/40 transition-colors border-b border-surface-border/50 last:border-0 text-left group",
                                                        remaining <= 0 && "opacity-50 grayscale cursor-not-allowed"
                                                    )}
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-surface-page dark:bg-dark-page flex items-center justify-center font-black text-brand text-xs">
                                                        {p.brand.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-ink-heading dark:text-white truncate group-hover:text-brand transition-colors">{p.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[10px] font-medium text-ink-muted">{p.sku}</p>
                                                            <span className="text-[10px] text-ink-muted">•</span>
                                                            <p className={cn(
                                                                "text-[10px] font-black uppercase",
                                                                remaining > 10 ? "text-emerald-500" : remaining > 0 ? "text-amber-500" : "text-danger"
                                                            )}>
                                                                {remaining} {p.unit || 'pcs'} left
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-brand">৳{p.price}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                                        selectedCategory === cat
                                            ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
                                            : "bg-white dark:bg-dark-card text-ink-muted border-surface-border dark:border-dark-border hover:bg-surface-hover hover:border-brand/30"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredAndSortedProducts.map(product => {
                                const cartItem = cart.find(i => i.productId === product.id);
                                const remaining = product.stock - (cartItem?.qty || 0);

                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => remaining > 0 && addToCart(product)}
                                        className={cn(
                                            "bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl p-4 transition-all group flex flex-col h-32 relative overflow-hidden",
                                            remaining <= 0 ? "opacity-60 grayscale cursor-not-allowed border-dashed" : "cursor-pointer hover:border-brand hover:shadow-lg"
                                        )}
                                    >
                                        <div className="flex flex-col h-full justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <span className="text-[10px] font-black uppercase text-ink-muted tracking-widest truncate max-w-[60px]">{product.brand}</span>
                                                    {(product.popularity || 0) > 0 && (
                                                        <span className={cn(
                                                            "text-[8px] font-black uppercase px-1 py-0.5 rounded flex items-center gap-1",
                                                            (product.popularity || 0) > 20
                                                                ? "bg-amber-100 text-amber-600 animate-pulse"
                                                                : "bg-surface-page dark:bg-dark-page text-ink-muted border border-surface-border dark:border-dark-border"
                                                        )}>
                                                            <ShoppingCart size={8} />
                                                            {product.popularity} used
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xs font-bold text-ink-heading dark:text-white line-clamp-1 group-hover:text-brand transition-colors">{product.name}</h3>
                                                <p className="text-[10px] text-ink-muted">{product.sku}</p>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-sm font-black text-ink-heading dark:text-white leading-tight">৳{product.price}</p>
                                                    <p className={cn(
                                                        "text-[8px] font-black uppercase",
                                                        remaining > 10 ? "text-emerald-500" : remaining > 0 ? "text-amber-500" : "text-danger"
                                                    )}>
                                                        {remaining} {product.unit || 'pcs'} avail
                                                    </p>
                                                </div>
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm",
                                                    cartItem ? "bg-brand text-white" : "bg-surface-page dark:bg-dark-page text-brand opacity-0 group-hover:opacity-100"
                                                )}>
                                                    <Plus size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Cart Panel */}
                <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden h-full">
                    {/* Cart Header */}
                    <div className="p-6 border-b border-surface-border dark:border-dark-border bg-surface-page/50 dark:bg-black/20 backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-1">
                            <h2 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <ShoppingCart className="text-brand" size={24} /> Current Sale
                            </h2>
                            <span className="bg-brand/10 text-brand px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                                {cart.length} Items
                            </span>
                        </div>
                        <p className="text-xs text-ink-muted font-medium">Walk-in Customer • RETAIL</p>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 p-8">
                                <ShoppingCart size={48} className="text-slate-300" />
                                <p className="text-sm font-bold text-ink-muted">Cart is empty. Scan products to start sale.</p>
                            </div>
                        ) : (
                            cart.map(item => {
                                const product = products.find(p => p.id === item.productId);
                                if (!product) return null;
                                return (
                                    <div key={item.productId} className="flex gap-4 p-3 bg-surface-page dark:bg-dark-page rounded-2xl border border-surface-border dark:border-dark-border group">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-xs font-bold text-ink-heading dark:text-white truncate pr-2">{item.name}</h4>
                                                <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-ink-muted mb-2">৳{item.price} x {item.qty}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 bg-white dark:bg-dark-card rounded-lg border border-surface-border dark:border-dark-border px-1 py-0.5">
                                                    <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-6 h-6 flex items-center justify-center text-ink-muted hover:text-brand transition-colors"><Minus size={12} /></button>
                                                    <span className="text-xs font-black w-4 text-center">{item.qty}</span>
                                                    <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-6 h-6 flex items-center justify-center text-ink-muted hover:text-brand transition-colors"><Plus size={12} /></button>
                                                </div>
                                                <span className="text-sm font-black text-ink-heading dark:text-white">৳{item.amount}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Checkout Footer */}
                    <div className="p-6 bg-surface-page/50 dark:bg-black/20 border-t border-surface-border dark:border-dark-border space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-ink-muted font-medium">
                                <span>Subtotal</span>
                                <span>৳{cartTotal}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-ink-heading dark:text-white pt-2 border-t border-surface-border dark:border-dark-border/50">
                                <span>Total</span>
                                <span>৳{cartTotal}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-2">
                            <Button onClick={checkout} className="h-12 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-brand/20">
                                Complete Sale (Cash)
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CounterSellPage;
