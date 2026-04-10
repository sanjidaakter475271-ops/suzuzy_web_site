'use client';

import React from 'react';
import { Trash2, Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { usePOSStore } from '@/stores/service-admin/posStore';
import { cn } from '@/lib/utils';

const Cart = () => {
    const { cart, updateQty, removeFromCart, clearCart, discount, transport, checkout, isLoading } = usePOSStore();

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = (subtotal * (discount || 0)) / 100;
    const total = (subtotal - discountAmount) + transport;

    return (
        <div className="flex flex-col h-full bg-dark-card border-l border-white/5 shadow-2xl z-10 w-96 shrink-0 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h2 className="font-black text-xl text-white uppercase tracking-tight leading-none mb-1">Current Order</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cart.length} Items Selected</p>
                    </div>
                </div>
                <button
                    onClick={clearCart}
                    className="text-[10px] font-black text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-all uppercase tracking-widest border border-red-500/20"
                >
                    Clear
                </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/20">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <ShoppingCart size={64} className="text-slate-800" strokeWidth={1} />
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Your cart is empty</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.productId} className="bg-dark-page/50 p-4 rounded-[1.5rem] border-2 border-white/5 flex flex-col gap-4 group hover:border-orange-500/30 transition-all duration-300 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-black text-white truncate uppercase tracking-tight">{item.name}</h4>
                                    <p className="text-lg font-black text-orange-500 mt-1">৳{item.price.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.productId)}
                                    className="text-slate-600 hover:text-red-500 transition-colors p-2 hover:bg-red-500/5 rounded-xl"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5">
                                    <button
                                        onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1))}
                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-10 text-center text-sm font-black text-white">{item.qty}</span>
                                    <button
                                        onClick={() => updateQty(item.productId, item.qty + 1)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Subtotal</p>
                                    <p className="text-sm font-black text-white">৳{(item.price * item.qty).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Calculations & Checkout */}
            <div className="p-6 bg-black/40 border-t border-white/5 space-y-6 shadow-2xl">
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Subtotal</span>
                        <span className="text-sm text-white">৳{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Discount ({discount}%)</span>
                        <span className="text-sm text-red-500">- ৳{discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-white/5 border-t border-dashed border-white/10 pt-4" />
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Total Payable</p>
                            <p className="text-3xl font-black text-orange-500 tracking-tighter">৳{total.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => checkout()}
                    disabled={isLoading || cart.length === 0}
                    className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Processing...
                        </>
                    ) : (
                        <>
                            Checkout Order
                            <div className="bg-black/20 px-3 py-1 rounded-lg text-[10px] font-black group-hover:bg-black/30 transition-colors">F10</div>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Cart;
