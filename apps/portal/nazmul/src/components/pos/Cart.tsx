'use client';

import React from 'react';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { usePOSStore } from '@/stores/posStore';
import { cn } from '@/lib/utils';

const Cart = () => {
    const { cart, updateQty, removeFromCart, clearCart, discount, transport, checkout } = usePOSStore();

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal - discount + transport;

    return (
        <div className="flex flex-col h-full bg-surface-card dark:bg-dark-card border-l border-surface-border dark:border-dark-border shadow-2xl z-10 w-96 shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-surface-border dark:border-dark-border flex items-center justify-between bg-surface-page dark:bg-dark-page">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20">
                        <ShoppingCart size={20} />
                    </div>
                    <div>
                        <h2 className="font-black text-lg text-ink-heading dark:text-white uppercase tracking-tight">Current Order</h2>
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">{cart.length} Items</p>
                    </div>
                </div>
                <button
                    onClick={clearCart}
                    className="text-xs font-bold text-danger hover:bg-danger-bg px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
                >
                    Clear
                </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <ShoppingCart size={48} className="text-ink-muted" strokeWidth={1} />
                        <p className="text-sm font-bold text-ink-muted uppercase">Cart is Empty</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.productId} className="bg-surface-page dark:bg-dark-page p-3 rounded-xl border border-surface-border dark:border-dark-border flex gap-3 group hover:border-brand/30 transition-colors">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-ink-heading dark:text-white truncate">{item.name}</h4>
                                <p className="text-xs text-brand font-black">৳{item.price}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-surface-card dark:bg-dark-card rounded-lg p-1 border border-surface-border dark:border-dark-border">
                                    <button
                                        onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1))}
                                        className="p-1 hover:text-danger transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-6 text-center text-sm font-black">{item.qty}</span>
                                    <button
                                        onClick={() => updateQty(item.productId, item.qty + 1)}
                                        className="p-1 hover:text-success transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.productId)}
                                    className="text-ink-muted hover:text-danger transition-colors p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Calculations & Checkout */}
            <div className="p-4 bg-surface-page dark:bg-dark-page border-t border-surface-border dark:border-dark-border space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-ink-muted">
                        <span>Subtotal</span>
                        <span className="font-bold text-ink-heading dark:text-white">৳{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-ink-muted">
                        <span>Discount</span>
                        <span className="font-bold text-ink-heading dark:text-white">- ৳{discount}</span>
                    </div>
                    <div className="flex justify-between text-brand text-base pt-2 border-t border-dashed border-surface-border dark:border-dark-border">
                        <span className="font-black uppercase tracking-wider">Total</span>
                        <span className="font-black text-xl">৳{total}</span>
                    </div>
                </div>

                <button
                    onClick={checkout}
                    className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-black uppercase tracking-widest text-lg shadow-xl shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    Checkout
                    <div className="bg-white/20 px-2 py-0.5 rounded text-sm">F10</div>
                </button>
            </div>
        </div>
    );
};

export default Cart;
