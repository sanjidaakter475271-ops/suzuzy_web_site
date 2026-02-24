import React, { useState, useEffect } from 'react';
import {
    X,
    ChevronRight,
    ArrowLeft,
    Search,
    ShoppingCart,
    Package,
    LayoutGrid,
    Layers,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TechnicianAPI } from '../services/api';
import { Category, ProductDetail } from '../types';
import { RequisitionCart } from './RequisitionCart';

interface PartsSelectionModalProps {
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'category' | 'products' | 'cart';

export const PartsSelectionModal: React.FC<PartsSelectionModalProps> = ({ jobId, onClose, onSuccess }) => {
    const [step, setStep] = useState<Step>('category');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<ProductDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<{ product: ProductDetail; quantity: number }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await TechnicianAPI.getCategories();
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (catId: string) => {
        setLoading(true);
        try {
            const res = await TechnicianAPI.getProductsByCategory(catId);
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        fetchProducts(category.id);
        setStep('products');
    };

    const handleAddToCart = (product: ProductDetail) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateCartQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item =>
            item.product.id === productId
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const items = cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                notes: "" // Optional notes could be added to UI later
            }));
            const res = await TechnicianAPI.requestParts(jobId, items);
            if (res.data.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error("Submission failed:", err);
            alert("Failed to submit requisition. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col"
        >
            {step !== 'cart' && (
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-950/50">
                        <div className="flex items-center gap-4">
                            {step === 'products' ? (
                                <button onClick={() => setStep('category')} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                                    <ArrowLeft size={24} />
                                </button>
                            ) : (
                                <div className="p-2 -ml-2 w-10" />
                            )}
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-wider">
                                    {step === 'category' ? 'Select category' : selectedCategory?.name}
                                </h2>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                                    Step {step === 'category' ? '1' : '2'} of 3
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {cart.length > 0 && (
                                <button
                                    onClick={() => setStep('cart')}
                                    className="relative p-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all"
                                >
                                    <ShoppingCart size={20} />
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950">
                                        {cart.length}
                                    </span>
                                </button>
                            )}
                            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Search (Only for products) */}
                    {step === 'products' && (
                        <div className="px-6 py-4 bg-slate-900/30 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by part name or SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-100"
                                />
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                        {loading && products.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                <p className="text-sm font-bold uppercase tracking-widest">Loading Catalog...</p>
                            </div>
                        ) : step === 'category' ? (
                            <div className="grid grid-cols-2 gap-4">
                                {categories.map((cat, idx) => (
                                    <motion.button
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleCategorySelect(cat)}
                                        className="aspect-square flex flex-col items-center justify-center bg-slate-900/40 border border-white/5 rounded-[32px] hover:bg-slate-900 hover:border-blue-500/50 transition-all group active:scale-95"
                                    >
                                        <div className="w-16 h-16 bg-slate-950 rounded-[24px] border border-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-600/10 transition-colors">
                                            <Layers className="text-slate-600 group-hover:text-blue-500 transition-colors" size={32} />
                                        </div>
                                        <span className="font-bold text-slate-300 group-hover:text-white transition-colors px-2">{cat.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredProducts.map((product, idx) => {
                                    const inCart = cart.find(item => item.product.id === product.id);
                                    return (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="bg-slate-900/40 border border-white/5 rounded-3xl p-4 flex gap-4 hover:border-white/10 transition-all group"
                                        >
                                            <div className="w-20 h-20 bg-slate-950 rounded-2xl border border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="text-slate-800" size={32} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-slate-100 uppercase text-xs tracking-wider line-clamp-1">{product.name}</h4>
                                                        <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-tighter uppercase">{product.brand || 'No Brand'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-blue-500 text-sm">৳{product.base_price.toLocaleString()}</p>
                                                        <p className={`text-[10px] font-bold mt-1 ${product.stock_quantity > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end mt-3">
                                                    {inCart ? (
                                                        <div className="flex items-center gap-3 bg-blue-600 rounded-xl px-2 py-1.5 shadow-lg shadow-blue-900/40">
                                                            <button
                                                                onClick={() => updateCartQuantity(product.id, -1)}
                                                                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                                                            >
                                                                <ArrowLeft size={14} className="rotate-90" />
                                                            </button>
                                                            <span className="text-sm font-black text-white">{inCart.quantity}</span>
                                                            <button
                                                                onClick={() => updateCartQuantity(product.id, 1)}
                                                                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                                                            >
                                                                <ChevronRight size={14} className="-rotate-90" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={product.stock_quantity <= 0}
                                                            className="bg-slate-950 border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/10 hover:text-blue-500 text-slate-400 py-1.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:hover:bg-transparent"
                                                        >
                                                            Add to request
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {step === 'cart' && (
                <RequisitionCart
                    items={cart}
                    onUpdateQuantity={updateCartQuantity}
                    onRemove={removeFromCart}
                    onSubmit={handleSubmit}
                    onBack={() => setStep('products')}
                    isSubmitting={isSubmitting}
                />
            )}
        </motion.div>
    );
};
