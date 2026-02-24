'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/service-admin/Breadcrumb';
import { Button } from '@/components/service-admin/ui';
import InvoicePreview from '@/components/service-admin/pos/InvoicePreview';
import { ArrowLeft, Printer, Mail, Download } from 'lucide-react';

const InvoiceDetailViewPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/v1/workshop/sales/${id}`);
                const data = await res.json();
                if (data.success) {
                    setInvoice(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch invoice:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchInvoice();
    }, [id]);

    if (isLoading) return <div className="p-8 text-center font-black uppercase text-ink-muted animate-pulse">Loading Invoice...</div>;
    if (!invoice) return <div className="p-8 text-center font-black uppercase text-ink-muted">Invoice not found</div>;

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[
                { label: 'POS', href: '/service-admin/pos' },
                { label: 'Invoices', href: '/service-admin/pos/invoices' },
                { label: `Invoice #${invoice.invoiceNo}` }
            ]} />

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl text-ink-muted hover:text-brand transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-ink-heading dark:text-white uppercase tracking-tight">Invoice Details</h1>
                        <p className="text-sm text-ink-muted mt-1 font-bold">Generated on {new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 rounded-2xl gap-2 font-black uppercase text-[10px] tracking-widest px-6" onClick={() => window.print()}>
                        <Printer size={18} /> Print Invoice
                    </Button>
                    <Button className="h-12 rounded-2xl gap-2 font-black uppercase text-[10px] tracking-widest px-6">
                        <Download size={18} /> Download
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto pb-24">
                <InvoicePreview
                    job={invoice}
                    editable={false}
                />
            </div>
        </div>
    );
};

export default InvoiceDetailViewPage;
