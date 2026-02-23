'use client';

import React from 'react';
import { Plus, Check, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { usePOSStore } from '@/stores/posStore';
import { cn } from '@/lib/utils';

interface ProductGridProps {
    searchQuery?: string;
    onSelect?: (product: any) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ searchQuery = '', onSelect }) => {
    const { products, addToCart, cart } = usePOSStore();

    const isInCart = (id: string) => cart.some(item => item.productId === id);

    const filteredAndSortedProducts = products
        .filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4 overflow-y-auto custom-scrollbar h-full content-start">
            {filteredAndSortedProducts.map((product) => (
                <Card
                    key={product.id}
                    onClick={() => {
                        const remaining = product.stock - (cart.find(i => i.productId === product.id)?.qty || 0);
                        if (remaining > 0) {
                            if (onSelect) {
                                onSelect(product);
                            } else {
                                addToCart(product);
                            }
                        }
                    }}
                    className={cn(
                        "transition-all group relative overflow-hidden h-32 flex flex-col justify-between",
                        (product.stock - (cart.find(i => i.productId === product.id)?.qty || 0)) <= 0
                            ? "opacity-60 grayscale cursor-not-allowed border-dashed border-2"
                            : "cursor-pointer hover:scale-105 active:scale-95",
                        isInCart(product.id) ? "border-brand bg-brand-soft/10" : "hover:border-brand/40"
                    )}
                >
                    <div className="absolute top-2 right-2 z-10">
                        {isInCart(product.id) ? (
                            <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shadow-lg animate-bounce-in">
                                <Check size={14} strokeWidth={3} />
                            </div>
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border text-ink-muted group-hover:bg-brand group-hover:text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                                <Plus size={14} />
                            </div>
                        )}
                    </div>

                    <CardContent className="p-4 h-full flex flex-col">
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-black uppercase text-ink-muted tracking-widest">{product.brand}</span>
                                <div className="flex flex-col items-end gap-1">
                                    {(product.popularity || 0) > 0 && (
                                        <span className={cn(
                                            "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border flex items-center gap-1 shadow-sm",
                                            (product.popularity || 0) > 20
                                                ? "bg-amber-100 text-amber-600 border-amber-200 animate-pulse"
                                                : "bg-surface-page dark:bg-dark-page text-ink-muted border-white/5"
                                        )}>
                                            <ShoppingCart size={10} />
                                            {product.popularity} {product.unit || 'pcs'} used
                                        </span>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-ink-heading dark:text-white line-clamp-2 leading-tight group-hover:text-brand transition-colors">
                                {product.name}
                            </h3>
                        </div>

                        <div className="mt-2 pt-2 border-t border-surface-border dark:border-dark-border/50 flex items-end justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-ink-muted uppercase">Price</p>
                                <p className="text-lg font-black text-brand">৳{product.price}</p>
                            </div>
                            <div className={cn(
                                "flex flex-col items-end gap-1"
                            )}>
                                <p className="text-[10px] font-bold text-ink-muted uppercase">Inventory</p>
                                <div className={cn(
                                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-inner",
                                    (product.stock - (cart.find(i => i.productId === product.id)?.qty || 0)) > 10
                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                        : (product.stock - (cart.find(i => i.productId === product.id)?.qty || 0)) > 0
                                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                            : "bg-danger/10 text-danger border border-danger/20"
                                )}>
                                    {Math.max(0, product.stock - (cart.find(i => i.productId === product.id)?.qty || 0))} {product.unit || 'pcs'} Available
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ProductGrid;
