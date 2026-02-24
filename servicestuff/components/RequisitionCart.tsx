import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductDetail } from '../types';

interface CartItem {
    product: ProductDetail;
    quantity: number;
    notes?: string;
}

interface RequisitionCartProps {
    items: CartItem[];
    onUpdateQuantity: (productId: string, delta: number) => void;
    onRemove: (productId: string) => void;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

export const RequisitionCart: React.FC<RequisitionCartProps> = ({
    items,
    onUpdateQuantity,
    onRemove,
    onSubmit,
    onBack,
    isSubmitting
}) => {
    const total = items.reduce((sum, item) => sum + (item.product.sale_price || item.product.base_price) * item.quantity, 0);

    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-800">
                <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <ShoppingCart className="text-blue-500" size={20} />
                    <h2 className="text-xl font-bold text-white">Review Request</h2>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                    {items.map((item) => (
                        <motion.div
                            key={item.product.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 overflow-hidden"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center">
                                        {item.product.image_url ? (
                                            <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <ShoppingCart className="text-slate-700" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-slate-100 font-bold leading-tight">{item.product.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{item.product.brand}</p>
                                        <p className="text-sm font-bold text-blue-400 mt-1">
                                            ৳{(item.product.sale_price || item.product.base_price).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemove(item.product.id)}
                                    className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between mt-4 pl-20">
                                <div className="flex items-center gap-4 bg-slate-950 rounded-2xl border border-slate-800 p-1">
                                    <button
                                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                                        disabled={item.quantity <= 1}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-500 uppercase font-black">Subtotal</span>
                                    <p className="text-sm font-black text-slate-300">
                                        ৳{((item.product.sale_price || item.product.base_price) * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <ShoppingCart className="text-slate-800 mb-4" size={48} />
                        <h3 className="text-slate-400 font-bold">Your cart is empty</h3>
                        <p className="text-slate-600 text-sm mt-1">Go back and select some parts</p>
                    </div>
                )}
            </div>

            {/* Footer Summary */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 rounded-t-[40px] shadow-2xl">
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-slate-400">
                        <span className="text-sm">Items Selected</span>
                        <span className="font-bold text-slate-200">{items.length}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                        <span className="text-base font-bold text-white">Estimated Total</span>
                        <span className="text-xl font-black text-blue-500">৳{total.toLocaleString()}</span>
                    </div>
                </div>

                <button
                    onClick={onSubmit}
                    disabled={items.length === 0 || isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 py-4 rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            Send Requisition
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
