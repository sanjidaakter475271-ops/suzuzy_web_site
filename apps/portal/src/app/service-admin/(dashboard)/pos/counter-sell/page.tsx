'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/service-admin/ui';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Search, ShoppingCart, Trash2, Plus, Minus, Loader2, Filter, Bike } from 'lucide-react';
import { usePOSStore } from '@/stores/service-admin/posStore';
import { useInventoryStore } from '@/stores/service-admin/inventoryStore';
import ProductGrid from '@/components/service-admin/pos/ProductGrid';
import { Product } from '@/types/service-admin/inventory';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const CounterSellPage = () => {
    const {
        products,
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        checkout,
        fetchProducts,
        setFilters,
        nextPage,
        pagination,
        filters,
        isLoading
    } = usePOSStore();

    const {
        categories,
        bikeModels,
        fetchCategories,
        fetchBikeModels
    } = useInventoryStore();

    const [searchInput, setSearchInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchProducts(true);
        fetchCategories();
        fetchBikeModels();
    }, [fetchProducts, fetchCategories, fetchBikeModels]);

    const handleSearchChange = (query: string) => {
        setSearchInput(query);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            setFilters({ search: query });
        }, 500);

        if (query.length > 1) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchInput) {
            const exactMatch = products.find(p => p.sku.toLowerCase() === searchInput.toLowerCase());
            if (exactMatch) {
                const remaining = exactMatch.stock - (cart.find(i => i.productId === exactMatch.id)?.qty || 0);
                if (remaining > 0) {
                    addToCart(exactMatch);
                    setSearchInput('');
                    setFilters({ search: '' });
                    setShowSuggestions(false);
                }
            }
        }
    };

    const cartTotal = cart.reduce((acc, item) => acc + item.amount, 0);

    return (
        <div className="p-4 lg:p-8 space-y-4 lg:space-y-6 animate-fade min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col">
            <Breadcrumb items={[{ label: 'POS' }, { label: 'Counter Sales' }]} />

            <div className="flex flex-col lg:flex-row gap-6 lg:h-full lg:overflow-hidden">
                {/* Left: Product Catalog */}
                <div className="flex-1 flex flex-col gap-4 lg:gap-6 lg:overflow-hidden">
                    {/* Search & Filter */}
                    <div className="flex flex-col gap-4 shrink-0">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Scan barcode or search products..."
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl focus:border-orange-500 outline-none transition-all font-medium text-sm"
                                    value={searchInput}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    onFocus={() => searchInput.length > 1 && setShowSuggestions(true)}
                                />

                                {/* Suggestions Dropdown */}
                                {showSuggestions && products.length > 0 && searchInput.length > 1 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="p-3 border-b border-surface-border dark:border-dark-border bg-surface-page/50 dark:bg-black/20">
                                            <p className="text-xs font-semibold text-ink-muted tracking-wider">Quick Results</p>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {products.slice(0, 8).map((p) => {
                                                const remaining = p.stock - (cart.find(i => i.productId === p.id)?.qty || 0);
                                                return (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => {
                                                            if (remaining > 0) {
                                                                addToCart(p);
                                                                setSearchInput('');
                                                                setFilters({ search: '' });
                                                                setShowSuggestions(false);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center gap-4 p-3 hover:bg-orange-500/5 transition-colors border-b border-surface-border/50 last:border-0 text-left group",
                                                            remaining <= 0 && "opacity-50 grayscale cursor-not-allowed"
                                                        )}
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-surface-page dark:bg-dark-page flex items-center justify-center font-bold text-orange-500 text-xs">
                                                            {p.brand.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold font-sans text-ink-heading dark:text-white truncate group-hover:text-orange-600 transition-colors">{p.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <p className="text-xs font-medium text-ink-muted">{p.sku}</p>
                                                                <span className="text-[10px] text-ink-muted">•</span>
                                                                <p className={cn(
                                                                    "text-[10px] font-semibold tracking-wider",
                                                                    remaining > 10 ? "text-emerald-500" : remaining > 0 ? "text-amber-500" : "text-danger"
                                                                )}>
                                                                    {remaining} {p.unit || 'pcs'} left
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold font-sans text-orange-600">৳{p.price}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex items-center gap-2 w-full md:w-auto overflow-hidden">
                                <Filter size={16} className="text-ink-muted hidden md:block shrink-0" />
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
                                    <button
                                        onClick={() => setFilters({ categoryId: 'All' })}
                                        className={cn(
                                            "px-4 py-2.5 rounded-lg text-[11px] font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ease-out border",
                                            filters.categoryId === 'All' || !filters.categoryId
                                                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                                                : "bg-white dark:bg-dark-card text-ink-muted border-surface-border dark:border-dark-border hover:bg-orange-500/5 hover:border-orange-500/50 hover:text-orange-600"
                                        )}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFilters({ categoryId: cat.id })}
                                            className={cn(
                                                "px-4 py-2.5 rounded-lg text-[11px] font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ease-out border",
                                                filters.categoryId === cat.id
                                                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                                                    : "bg-white dark:bg-dark-card text-ink-muted border-surface-border dark:border-dark-border hover:bg-orange-500/5 hover:border-orange-500/50 hover:text-orange-600"
                                            )}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto md:border-l md:border-surface-border dark:md:border-dark-border md:pl-4 shrink-0">
                                <Bike size={16} className="text-ink-muted hidden md:block" />
                                <select
                                    value={filters.bikeModelId || 'All'}
                                    onChange={(e) => setFilters({ bikeModelId: e.target.value })}
                                    className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wider outline-none focus:border-orange-500 transition-all cursor-pointer w-full"
                                >
                                    <option value="All">All Bike Models</option>
                                    {bikeModels.map(model => (
                                        <option key={model.id} value={model.id}>{model.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 lg:overflow-hidden min-h-[400px]">
                        {isLoading && products.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="animate-spin text-orange-500" size={40} />
                                <p className="text-sm font-semibold text-ink-muted">Loading product catalog...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                                <Search size={48} className="text-slate-300" />
                                <p className="text-sm font-semibold text-ink-muted">No products found matching your search.</p>
                            </div>
                        ) : (
                            <ProductGrid />
                        )}
                    </div>
                </div>

                {/* Right: Cart Panel */}
                <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-[2rem] shadow-lg overflow-hidden h-[500px] lg:h-full shrink-0">
                    {/* Cart Header */}
                    <div className="p-6 border-b border-surface-border dark:border-dark-border bg-surface-page/50 dark:bg-black/20 backdrop-blur-xl shrink-0">
                        <div className="flex justify-between items-center mb-1">
                            <h2 className="text-xl font-bold font-sans text-ink-heading dark:text-white tracking-tight flex items-center gap-2">
                                <ShoppingCart className="text-orange-500" size={24} /> Current Sale
                            </h2>
                            <span className="bg-orange-500/10 text-orange-600 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider">
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
                                <p className="text-sm font-semibold text-ink-muted">Cart is empty. Scan products to start sale.</p>
                            </div>
                        ) : (
                            cart.map(item => {
                                return (
                                    <div key={item.productId} className="flex gap-4 p-3 bg-surface-page dark:bg-dark-page rounded-2xl border border-surface-border dark:border-dark-border group hover:border-orange-500/30 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-semibold font-sans text-ink-heading dark:text-white truncate pr-2 group-hover:text-orange-600 transition-colors">{item.name}</h4>
                                                <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p className="text-xs font-medium text-ink-muted mb-2">৳{item.price} x {item.qty}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 bg-white dark:bg-dark-card rounded-lg border border-surface-border dark:border-dark-border px-1 py-0.5">
                                                    <button
                                                        onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1))}
                                                        className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-orange-500 transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                                                    <button
                                                        onClick={() => updateQty(item.productId, item.qty + 1)}
                                                        className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-orange-500 transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <span className="text-base font-bold font-sans text-orange-600 dark:text-orange-500">৳{item.amount}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Checkout Footer */}
                    <div className="p-6 bg-surface-page/50 dark:bg-black/20 border-t border-surface-border dark:border-dark-border space-y-4 shrink-0">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-ink-muted font-medium">
                                <span>Subtotal</span>
                                <span className="font-semibold">৳{cartTotal}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold font-sans text-ink-heading dark:text-white pt-3 border-t border-surface-border dark:border-dark-border/50">
                                <span>Total</span>
                                <span className="text-orange-600">৳{cartTotal}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-2">
                            <Button onClick={() => checkout()} className="h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all duration-300 hover:shadow-orange-500/40 hover:-translate-y-0.5">
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
