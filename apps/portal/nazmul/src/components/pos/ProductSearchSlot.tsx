'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { usePOSStore } from '@/stores/posStore';
import { Product } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface ProductSearchSlotProps {
    onSelect: (product: Product) => void;
}

const ProductSearchSlot: React.FC<ProductSearchSlotProps> = ({ onSelect }) => {
    const { products } = usePOSStore();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length > 1) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.sku.toLowerCase().includes(query.toLowerCase()) ||
                (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 5);
            setSuggestions(filtered);
            setIsOpen(true);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [query, products]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (product: Product) => {
        onSelect(product);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-lg mx-auto">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-brand transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search & Add Product (Name, SKU, Brand)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                    className="w-full bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-brand transition-all text-sm font-bold shadow-soft"
                />
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-dark-card border-2 border-surface-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1">
                        {suggestions.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => handleSelect(product)}
                                className="w-full flex items-center justify-between p-3 hover:bg-brand/5 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-surface-page dark:bg-black/20 flex items-center justify-center text-ink-muted group-hover:text-brand transition-colors">
                                        <Package size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black text-ink-heading dark:text-white uppercase tracking-tight">{product.name}</p>
                                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{product.brand} | {product.sku}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <p className="text-sm font-black text-brand">৳{product.price}</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[8px] font-black uppercase text-ink-muted">{product.stock} {product.unit || 'pcs'} IN STOCK</span>
                                        <div className="bg-brand text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus size={12} />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSearchSlot;
