'use client';

import React, { useState } from 'react';
import POSLayout from '@/components/pos/POSLayout'; // Correct import path
import ProductGrid from '@/components/pos/ProductGrid';
import Cart from '@/components/pos/Cart'; // Ensure this path is correct
import { Search, Grid, List, Barcode, User, Filter } from 'lucide-react';
import { usePOSStore } from '@/stores/posStore';
import { Product } from '@/types/inventory';
import { cn } from '@/lib/utils';

const POSTerminalPage = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const { products, addToCart, cart, checkout } = usePOSStore();

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
            // Find exact SKU/Barcode match first
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

    React.useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'F10') {
                e.preventDefault();
                checkout();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [checkout]);

    return (
        <POSLayout>
            <div className="flex h-full overflow-hidden">
                {/* Product Section */}
                <div className="flex-1 flex flex-col min-w-0 bg-surface-page dark:bg-dark-page">
                    {/* Search & Filters Bar */}
                    <div className="p-4 bg-surface-card dark:bg-dark-card border-b border-surface-border dark:border-dark-border flex items-center gap-4 z-10 shadow-sm">
                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search Product (F2) or Scan Barcode (F4)..."
                                className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl pl-10 pr-12 py-3 outline-none focus:border-brand transition-colors shadow-inner font-bold"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-brand transition-colors">
                                <Barcode size={20} />
                            </button>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl shadow-2xl z-[100] overflow-hidden animate-slide-up">
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

                        <div className="flex items-center gap-2 border-l border-surface-border dark:border-dark-border pl-4">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-surface-page dark:bg-dark-page text-ink-muted hover:bg-surface-border'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-surface-page dark:bg-dark-page text-ink-muted hover:bg-surface-border'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                            <button className="flex items-center gap-2 bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border px-4 py-2.5 rounded-xl text-sm font-bold text-ink-muted hover:border-brand hover:text-brand transition-all">
                                <User size={16} />
                                Select Customer
                            </button>
                            <button className="flex items-center gap-2 bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border px-4 py-2.5 rounded-xl text-sm font-bold text-ink-muted hover:border-brand hover:text-brand transition-all">
                                <Filter size={16} />
                                Categories
                            </button>
                        </div>
                    </div>

                    {/* Products Area */}
                    <div className="flex-1 overflow-hidden p-4">
                        <ProductGrid searchQuery={searchQuery} />
                    </div>
                </div>

                {/* Cart Section */}
                <Cart />
            </div>
        </POSLayout>
    );
};

export default POSTerminalPage;
