'use client';

import React from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/service-admin/ui';
import { usePOSStore } from '@/stores/service-admin/posStore';
import { cn } from '@/lib/utils';

interface ProductGridProps {
    onSelect?: (product: any) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onSelect }) => {
    const { products, addToCart, cart, pagination, isLoading, nextPage } = usePOSStore();

    const isInCart = (id: string) => cart.some(item => item.productId === id);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4 overflow-y-auto custom-scrollbar flex-1 content-start">
                {products.map((product) => {
                    const remaining = product.stock - (cart.find(i => i.productId === product.id)?.qty || 0);
                    const outOfStock = remaining <= 0;

                    return (
                        <div
                            key={product.id}
                            onClick={() => {
                                if (remaining > 0) {
                                    if (onSelect) {
                                        onSelect(product);
                                    } else {
                                        addToCart(product);
                                    }
                                }
                            }}
                            className={cn(
                                "flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 text-left min-h-[140px]",
                                outOfStock
                                    ? "border-dashed border-white/5 opacity-50 grayscale cursor-not-allowed bg-[#0D0D0F]"
                                    : "border-white/5 hover:border-orange-500/50 bg-[#111113] hover:bg-[#161619] cursor-pointer hover:shadow-lg hover:shadow-orange-500/5",
                                isInCart(product.id) && "border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.08)] bg-[#181411]"
                            )}
                        >
                            <div>
                                <p className="text-[10px] font-semibold text-zinc-500 mb-1 tracking-wider">{product.brand || 'Suzuki'}</p>
                                <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors">
                                    {product.name}
                                </h3>
                            </div>

                            <div className="flex justify-between items-end mt-4">
                                <div>
                                    <p className="text-[10px] font-semibold text-zinc-500 mb-0.5 tracking-wider">Price</p>
                                    <p className={cn("text-lg font-bold tracking-tight", outOfStock ? "text-zinc-500" : "text-orange-500")}>
                                        ৳{product.price}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold text-zinc-500 mb-0.5 tracking-wider">Stock</p>
                                    <div className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider border",
                                        outOfStock
                                            ? "bg-white/5 text-zinc-500 border-white/5"
                                            : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                    )}>
                                        {Math.max(0, remaining)} {product.unit || 'pcs'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {pagination.hasMore && (
                <div className="p-4 flex justify-center mt-auto">
                    <button
                        onClick={() => nextPage()}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-full border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 text-xs font-bold tracking-widest flex items-center justify-center gap-2 w-max mx-auto shadow-sm"
                    >
                        {isLoading ? (
                            <><Loader2 className="animate-spin" size={14} /> Loading...</>
                        ) : (
                            'Load More Products'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
