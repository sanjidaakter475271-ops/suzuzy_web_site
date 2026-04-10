'use client';

import React, { useState, useEffect, useRef } from 'react';
import POSLayout from '@/components/service-admin/pos/POSLayout';
import ProductGrid from '@/components/service-admin/pos/ProductGrid';
import Cart from '@/components/service-admin/pos/Cart';
import CustomerSearchModal from '@/components/service-admin/pos/CustomerSearchModal';
import { Search, Grid, List, Barcode, User, Filter, X, ChevronDown, Check, Bike, Loader2, Phone, Mail } from 'lucide-react';
import { usePOSStore } from '@/stores/service-admin/posStore';
import { useInventoryStore } from '@/stores/service-admin/inventoryStore';
import { Product } from '@/types/service-admin/inventory';
import { cn } from '@/lib/utils';

const POSTerminalPage = () => {
    const [activeTab, setActiveTab] = useState<'products' | 'customer'>('products');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchInput, setSearchInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const {
        products,
        cart,
        addToCart,
        checkout,
        fetchProducts,
        setFilters,
        filters,
        isLoading,
        selectedCustomer,
        selectedVehicle,
        setSelectedCustomer,
        setSelectedVehicle
    } = usePOSStore();

    const {
        categories,
        fetchCategories
    } = useInventoryStore();

    const handleClearCustomer = () => {
        setSelectedCustomer(null);
        setSelectedVehicle(null);
        setActiveTab('products');
    };

    // Initial Fetch
    useEffect(() => {
        fetchProducts(true);
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    const handleSearchChange = (query: string) => {
        setSearchInput(query);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            setFilters({ search: query });
        }, 500);

        if (query.length > 1) {
            setShowSuggestions(true);
            setActiveTab('products');
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

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                setActiveTab('products');
                searchInputRef.current?.focus();
            }
            if (e.key === 'F4') {
                e.preventDefault();
                setActiveTab('products');
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
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-dark-page">
                    {/* Top Control Bar */}
                    <div className="p-4 bg-dark-card border-b border-white/5 flex items-center gap-4 z-20 shadow-lg shrink-0">
                        {/* Tab Switcher */}
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mr-2">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                                    activeTab === 'products' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-500 hover:text-white"
                                )}
                            >
                                <Grid size={14} />
                                Products
                            </button>
                            <button
                                onClick={() => setActiveTab('customer')}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 relative",
                                    activeTab === 'customer' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-500 hover:text-white"
                                )}
                            >
                                <User size={14} />
                                Customer
                                {selectedCustomer && activeTab !== 'customer' && <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border border-dark-card animate-pulse" />}
                            </button>
                        </div>

                        {/* Universal Search Bar */}
                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={18} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search Product (F2) or Scan Barcode (F4)..."
                                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-12 py-3.5 outline-none focus:border-orange-500/50 transition-all shadow-inner font-bold text-white placeholder:text-slate-600"
                                value={searchInput}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onFocus={() => searchInput.length > 1 && setShowSuggestions(true)}
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-500 transition-colors">
                                <Barcode size={20} />
                            </button>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && products.length > 0 && searchInput.length > 1 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card border-2 border-orange-500/20 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="p-3 border-b border-white/5 bg-black/40">
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Quick Results</p>
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
                                                        "w-full flex items-center gap-4 p-4 hover:bg-orange-500/5 transition-colors border-b border-white/5 last:border-0 text-left group",
                                                        remaining <= 0 && "opacity-50 grayscale cursor-not-allowed"
                                                    )}
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center font-black text-orange-500 text-xs border border-white/5 group-hover:border-orange-500/30 transition-colors">
                                                        {p.brand?.substring(0, 2).toUpperCase() || 'SU'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-white truncate group-hover:text-orange-500 transition-colors uppercase tracking-tight">{p.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.sku}</p>
                                                            <span className="text-[10px] text-slate-700">•</span>
                                                            <p className={cn(
                                                                "text-[10px] font-black uppercase tracking-wider",
                                                                remaining > 10 ? "text-emerald-500" : remaining > 0 ? "text-orange-500" : "text-red-500"
                                                            )}>
                                                                {remaining} {p.unit || 'pcs'} left
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-orange-500 tracking-tight">৳{p.price}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Grid/List Toggle */}
                        <div className="flex items-center gap-2 border-l border-white/5 pl-4">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-300",
                                    viewMode === 'grid' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-black/40 text-slate-500 hover:text-white border border-white/5"
                                )}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-300",
                                    viewMode === 'list' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-black/40 text-slate-500 hover:text-white border border-white/5"
                                )}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="ml-auto flex items-center gap-3">
                            <button
                                onClick={() => setIsCustomerModalOpen(true)}
                                className={cn(
                                    "flex items-center gap-2 bg-black/40 border-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                                    selectedCustomer ? "border-orange-500/50 text-orange-500 shadow-lg shadow-orange-500/10" : "border-white/5 text-slate-400 hover:border-orange-500/30 hover:text-white"
                                )}
                            >
                                <User size={16} />
                                {selectedCustomer ? "Change Customer" : "Select Customer"}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                    className={cn(
                                        "flex items-center gap-2 bg-black/40 border-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                                        filters.categoryId && filters.categoryId !== 'All' ? "border-orange-500/50 text-orange-500 shadow-lg shadow-orange-500/10" : "border-white/5 text-slate-400 hover:border-orange-500/30 hover:text-white"
                                    )}
                                >
                                    <Filter size={16} />
                                    {filters.categoryId && filters.categoryId !== 'All' ? categories.find(c => c.id === filters.categoryId)?.name || 'Category' : 'Categories'}
                                    <ChevronDown size={14} className={cn("transition-transform duration-300", isCategoryDropdownOpen && "rotate-180")} />
                                </button>

                                {isCategoryDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)} />
                                        <div className="absolute top-full right-0 mt-2 w-64 bg-dark-card border-2 border-white/5 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-2 space-y-1">
                                                <button
                                                    onClick={() => {
                                                        setFilters({ categoryId: 'All' });
                                                        setIsCategoryDropdownOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
                                                        !filters.categoryId || filters.categoryId === 'All' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white"
                                                    )}
                                                >
                                                    All Categories
                                                    {(!filters.categoryId || filters.categoryId === 'All') && <Check size={14} />}
                                                </button>
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setFilters({ categoryId: cat.id });
                                                            setIsCategoryDropdownOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center justify-between p-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
                                                            filters.categoryId === cat.id ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white"
                                                        )}
                                                    >
                                                        {cat.name}
                                                        {filters.categoryId === cat.id && <Check size={14} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Section (Tabbed) */}
                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'products' ? (
                            <div className="h-full flex flex-col">
                                {selectedCustomer && (
                                    <div className="px-4 py-2 bg-orange-500/5 border-b border-orange-500/10 flex items-center justify-between animate-in slide-in-from-top-1">
                                        <div className="flex items-center gap-4">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Session:</p>
                                            <p className="text-[11px] font-black text-orange-500 uppercase">{selectedCustomer.name}</p>
                                            {selectedVehicle && <p className="text-[11px] font-bold text-slate-400">| {selectedVehicle.regNo}</p>}
                                        </div>
                                        <button onClick={() => setActiveTab('customer')} className="text-[9px] font-black text-orange-500 hover:underline uppercase tracking-widest">View Profile</button>
                                    </div>
                                )}
                                <div className="flex-1 overflow-hidden">
                                    {isLoading && products.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                                            <Loader2 className="animate-spin text-orange-500" size={40} />
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Catalog...</p>
                                        </div>
                                    ) : products.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                                            <Search size={64} className="text-slate-800" strokeWidth={1} />
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No products found</p>
                                        </div>
                                    ) : (
                                        <ProductGrid />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full p-8 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-300">
                                {selectedCustomer ? (
                                    <div className="max-w-4xl mx-auto space-y-8 pb-12">
                                        {/* Profile Card */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-dark-card border-2 border-orange-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                            <div className="flex items-center gap-6 relative z-10">
                                                <div className="w-24 h-24 rounded-[2rem] bg-orange-500 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-orange-500/30 group-hover:scale-105 transition-transform duration-500">
                                                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">{selectedCustomer.name}</h2>
                                                    <div className="flex flex-wrap gap-4 mt-2">
                                                        <span className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5 uppercase tracking-widest"><Phone size={14} className="text-orange-500" /> {selectedCustomer.phone}</span>
                                                        {selectedCustomer.email && <span className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5 uppercase tracking-widest"><Mail size={14} className="text-orange-500" /> {selectedCustomer.email}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 relative z-10">
                                                <button onClick={() => setIsCustomerModalOpen(true)} className="px-6 py-3 rounded-2xl bg-black/40 border border-white/5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-orange-500/30 transition-all">Switch</button>
                                                <button onClick={handleClearCustomer} className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                                            </div>
                                        </div>

                                        {/* Vehicle Card */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {selectedVehicle ? (
                                                <div className="p-8 bg-dark-card border-2 border-orange-500/20 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                                        <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3"><div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><Bike size={20} /></div>Vehicle Details</h3>
                                                        <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-orange-500/20">Active</span>
                                                    </div>
                                                    <div className="space-y-4 relative z-10">
                                                        <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Registration</p><p className="text-2xl font-black text-white uppercase tracking-tighter">{selectedVehicle.regNo}</p></div>
                                                        <div className="h-px bg-white/5" /><div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Model</p><p className="text-lg font-black text-orange-500 uppercase tracking-tight">{selectedVehicle.model || 'Unknown'}</p></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-8 bg-dark-card border-2 border-white/5 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center text-center space-y-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                                    <Bike size={48} className="text-slate-700" />
                                                    <p className="font-black text-white uppercase tracking-tight text-xs">No Vehicle Linked</p>
                                                </div>
                                            )}

                                            <div className="p-8 bg-dark-card border-2 border-white/5 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center text-center space-y-4 opacity-30 grayscale">
                                                <List size={48} className="text-slate-700" />
                                                <p className="font-black text-white uppercase tracking-tight text-xs">History Unavailable</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="relative"><div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full animate-pulse" /><div className="relative w-32 h-32 rounded-[2.5rem] bg-dark-card border-2 border-white/5 flex items-center justify-center text-slate-700 shadow-2xl"><User size={64} strokeWidth={1} /></div></div>
                                        <div className="text-center space-y-3"><h3 className="text-2xl font-black text-white uppercase tracking-tighter">No Active Customer</h3><p className="text-sm font-bold text-slate-500 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">Please select a customer to view their details.</p></div>
                                        <button onClick={() => setIsCustomerModalOpen(true)} className="px-12 py-5 rounded-[2rem] bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl shadow-orange-500/20 active:scale-95">Find Customer</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <Cart />
            </div>

            <CustomerSearchModal
                isOpen={isCustomerModalOpen}
                onClose={() => {
                    setIsCustomerModalOpen(false);
                    if (usePOSStore.getState().selectedCustomer) setActiveTab('customer');
                }}
            />
        </POSLayout>
    );
};

export default POSTerminalPage;
