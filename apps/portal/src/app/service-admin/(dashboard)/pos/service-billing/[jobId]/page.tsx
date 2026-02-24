'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePOSStore } from '@/stores/service-admin/posStore';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Button } from '@/components/service-admin/ui';
import InvoicePreview from '@/components/service-admin/pos/InvoicePreview';
import ProductSearchSlot from '@/components/service-admin/pos/ProductSearchSlot';
import BillingSidebar from '@/components/service-admin/pos/BillingSidebar';
import ProductGrid from '@/components/service-admin/pos/ProductGrid';
import {
    ArrowLeft, Save, CreditCard,
    Banknote, QrCode, Smartphone,
    Tag, Plus, CheckCircle, Printer, Edit3
} from 'lucide-react';
import { Product } from '@/types/service-admin/inventory';
import { cn } from '@/lib/utils';
import { POSItem } from '@/types/service-admin/pos';

const InvoiceGeneratorPage = () => {
    const { jobId } = useParams();
    const router = useRouter();
    const {
        cart,
        customer,
        activeJob,
        isLoading,
        loadJobBilling,
        addToCart: storeAddToCart,
        removeFromCart,
        updateQty,
        discount,
        checkout
    } = usePOSStore();

    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [isFinalized, setIsFinalized] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mfs'>('cash');
    const [saleData, setSaleData] = useState<any>(null);

    React.useEffect(() => {
        if (jobId) {
            loadJobBilling(jobId as string);
        }
    }, [jobId, loadJobBilling]);

    if (isLoading && !activeJob) return <div className="p-8 text-center font-black uppercase text-ink-muted animate-pulse">Loading Job Details...</div>;
    if (!activeJob) return <div className="p-8 text-center font-black uppercase text-ink-muted">Job not found</div>;

    const partsCost = cart.reduce((sum: number, item: POSItem) => sum + (item.amount || (item.qty * item.price)), 0);
    const laborCost = activeJob.laborCost || 0;
    const subtotal = partsCost + laborCost;
    const total = subtotal - (subtotal * (discount || 0) / 100);

    // Mock a Job-like object for Sidebar/Preview compatibility
    const jobMock = {
        id: activeJob.id,
        jobNo: activeJob.jobNo,
        customerName: customer || 'Unknown',
        vehicleRegNo: activeJob.vehicleRegNo,
        items: cart.map(item => ({
            description: item.name,
            cost: item.price,
            qty: item.qty,
            productId: item.productId,
            requisitionId: item.requisitionId
        })),
        partsCost,
        laborCost,
        discount,
        total
    } as any;

    const handleFinalize = async () => {
        const result = await checkout(activeJob.id, paymentMethod);
        if (result) {
            setSaleData(result);
            setIsFinalized(true);
            setViewMode('preview');
        }
    };

    const handleAddProduct = (product: Product) => {
        storeAddToCart(product);
    };

    const handleUpdateQty = (idx: number, newQty: number) => {
        const item = cart[idx];
        if (item) {
            updateQty(item.productId, newQty);
        }
    };

    const handleRemoveItem = async (idx: number) => {
        const item = cart[idx];
        if (item) {
            await removeFromCart(item.productId);
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden animate-fade">
            {/* Top Navigation & View Toggle */}
            <div className="bg-surface-card dark:bg-dark-card border-b border-surface-border dark:border-dark-border px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-xl text-ink-muted hover:text-brand transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-sm font-black text-ink-heading dark:text-white uppercase tracking-tighter">
                            {viewMode === 'edit' ? 'Billing Editor' : `Invoice #${jobMock.jobNo}`}
                        </h1>
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest leading-none mt-1">
                            {jobMock.customerName} | {jobMock.vehicleRegNo}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-surface-page dark:bg-black/20 p-1 rounded-xl border border-surface-border dark:border-dark-border">
                    <button
                        onClick={() => setViewMode('edit')}
                        className={cn(
                            "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                            viewMode === 'edit' ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-ink-muted hover:text-brand"
                        )}
                    >
                        Editor
                    </button>
                    <button
                        onClick={() => setViewMode('preview')}
                        className={cn(
                            "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                            viewMode === 'preview' ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-ink-muted hover:text-brand"
                        )}
                    >
                        Preview
                    </button>
                </div>

                {viewMode === 'preview' && (
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-10 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest" onClick={() => window.print()}>
                            <Printer size={16} /> Print
                        </Button>
                        <Button className="h-10 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest" onClick={() => router.push('/service-admin/pos/service-billing')}>
                            New Job
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Area: Editor or Preview */}
                <div className="flex-1 flex flex-col min-w-0 bg-surface-page dark:bg-dark-page relative overflow-hidden">
                    {viewMode === 'edit' ? (
                        <>
                            {/* Product Search & Grid Area */}
                            <div className="p-6 bg-surface-card dark:bg-dark-card border-b border-surface-border dark:border-dark-border shadow-sm">
                                <ProductSearchSlot onSelect={handleAddProduct} />
                            </div>
                            <div className="flex-1 overflow-hidden p-6">
                                <h3 className="text-[10px] font-black uppercase text-ink-muted tracking-[0.2em] mb-4 pl-4">Fast Add Products</h3>
                                <ProductGrid onSelect={handleAddProduct} />

                                <div className="mt-8 px-4 pb-12">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/service-admin/pos/service-billing')}
                                        className="w-full h-16 rounded-[2rem] border-2 border-dashed border-surface-border dark:border-dark-border hover:border-brand/40 hover:bg-brand/5 text-ink-muted hover:text-brand font-black uppercase text-xs tracking-[0.2em] transition-all gap-3"
                                    >
                                        <Plus size={20} /> Add More Jobs to Invoice
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-slate-50 dark:bg-black/20">
                                <div className="max-w-4xl mx-auto pb-24">
                                    <InvoicePreview
                                        job={jobMock}
                                        editable={false}
                                    />

                                    <div className="mt-8 flex justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => setViewMode('edit')}
                                            className="h-14 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand/40 text-slate-400 hover:text-brand font-black uppercase text-xs tracking-widest px-12 transition-all gap-3"
                                        >
                                            <Edit3 size={18} /> Back to Editor (Add More)
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Sidebar for Preview */}
                            <div className="w-[400px] shrink-0 border-l border-surface-border dark:border-dark-border bg-surface-card dark:bg-dark-card overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                <div>
                                    <h3 className="text-xl font-black text-ink-heading dark:text-white uppercase tracking-tight flex items-center gap-3">
                                        <div className="p-2 bg-brand/10 rounded-xl text-brand"><CreditCard size={24} /></div>
                                        Final Payment
                                    </h3>
                                    <p className="text-[10px] font-black uppercase text-ink-muted tracking-widest mt-2">{isFinalized ? 'Payment Collected' : 'Select Method'}</p>
                                </div>

                                {!isFinalized && (
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setPaymentMethod('cash')}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group h-24 justify-center",
                                                paymentMethod === 'cash' ? "bg-brand border-brand text-white shadow-xl shadow-brand/20" : "bg-white dark:bg-dark-card border-surface-border dark:border-dark-border text-ink-muted hover:border-brand/30 hover:bg-brand/5"
                                            )}
                                        >
                                            <Banknote size={24} className={cn(paymentMethod === 'cash' ? "text-white" : "group-hover:text-brand transition-colors")} />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Cash</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group h-24 justify-center",
                                                paymentMethod === 'card' ? "bg-brand border-brand text-white shadow-xl shadow-brand/20" : "bg-white dark:bg-dark-card border-surface-border dark:border-dark-border text-ink-muted hover:border-brand/30 hover:bg-brand/5"
                                            )}
                                        >
                                            <QrCode size={24} className={cn(paymentMethod === 'card' ? "text-white" : "group-hover:text-brand transition-colors")} />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Card</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('mfs')}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group h-24 justify-center",
                                                paymentMethod === 'mfs' ? "bg-brand border-brand text-white shadow-xl shadow-brand/20" : "bg-white dark:bg-dark-card border-surface-border dark:border-dark-border text-ink-muted hover:border-brand/30 hover:bg-brand/5"
                                            )}
                                        >
                                            <Smartphone size={24} className={cn(paymentMethod === 'mfs' ? "text-white" : "group-hover:text-brand transition-colors")} />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">MFS</span>
                                        </button>
                                    </div>
                                )}

                                <div className="p-8 bg-surface-page dark:bg-black/30 rounded-[2rem] border border-surface-border dark:border-white/5 space-y-6 shadow-inner transition-all">
                                    <div className="flex justify-between items-center text-xs font-black text-ink-muted uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="text-sm text-ink-heading dark:text-white">৳{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-black text-brand uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Tag size={16} /> Discount ({discount}%)</div>
                                        <span>-৳{(subtotal * (discount || 0) / 100).toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-surface-border dark:border-white/5" />
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black uppercase text-ink-muted tracking-[0.2em] leading-none mb-1">Total Receivable</p>
                                        <p className="text-4xl font-black text-ink-heading dark:text-white tracking-tighter leading-none">৳{total.toLocaleString()}</p>
                                    </div>
                                </div>

                                {!isFinalized ? (
                                    <Button
                                        onClick={handleFinalize}
                                        className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-500/30 gap-3 active:scale-95 transition-all"
                                    >
                                        Finalize & Collect <Save size={20} />
                                    </Button>
                                ) : (
                                    <div className="space-y-4 animate-in zoom-in-95 duration-500">
                                        <div className="p-6 bg-emerald-500/10 text-emerald-600 rounded-[1.5rem] border-2 border-emerald-500/20 text-center font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <CheckCircle size={24} />
                                            </div>
                                            <span>Invoice Finalized & Paid</span>
                                        </div>
                                        <Button
                                            className="w-full h-16 rounded-2xl bg-brand text-white font-black uppercase text-xs tracking-[0.2em] gap-3 shadow-xl shadow-brand/30"
                                            onClick={() => window.print()}
                                        >
                                            <Printer size={20} /> Print Invoice (F10)
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] gap-2 border-2"
                                            onClick={() => router.push('/service-admin/pos/service-billing')}
                                        >
                                            Return to Billing List
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Only in Edit Mode */}
                {viewMode === 'edit' && (
                    <BillingSidebar
                        job={jobMock}
                        onUpdateQty={handleUpdateQty}
                        onRemoveItem={handleRemoveItem}
                        onGenerate={handleFinalize}
                    />
                )}
            </div>
        </div>
    );
};

export default InvoiceGeneratorPage;
