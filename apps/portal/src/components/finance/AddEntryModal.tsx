'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';
import { CashBookEntry, DailySalesEntry, ExpenseEntry, DepositWithdrawEntry } from '@/types/finance';

interface AddEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (entry: any) => void;
    type: 'cashbook' | 'sales' | 'expenses' | 'deposits';
    initialData?: any;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onAdd, type, initialData }) => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Default values
            if (type === 'cashbook') {
                setFormData({ cashInType: 'Sales', cashInAmount: 0, cashOutType: 'Expense', cashOutAmount: 0 });
            } else if (type === 'sales') {
                setFormData({ date: new Date().toISOString().split('T')[0], invoice: '', qty: 0, subtotal: 0, discount: 0, total: 0 });
            } else if (type === 'expenses') {
                setFormData({ date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString(), category: 'Courier Cost', description: '', totalAmount: 0 });
            } else if (type === 'deposits') {
                setFormData({ date: new Date().toISOString().split('T')[0], note: '', cashIn: 0, cashOut: 0 });
            }
        }
    }, [type, initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ ...formData, id: formData.id || Math.random().toString(36).substr(2, 9) });
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numValue = e.target.type === 'number' ? parseFloat(value) : value;
        setFormData((prev: any) => ({ ...prev, [name]: numValue }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade">
            <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-ink-heading dark:text-white uppercase tracking-tight">
                        {initialData ? 'Edit' : 'Add New'} {type.charAt(0).toUpperCase() + type.slice(1)} Entry
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-surface-hover dark:hover:bg-dark-sidebar rounded-full transition-colors">
                        <X size={20} className="text-ink-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {type === 'cashbook' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-ink-muted mb-1">Cash In Type</label>
                                <select name="cashInType" value={formData.cashInType} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white focus:ring-2 focus:ring-brand outline-none">
                                    <option value="Sales">Sales</option>
                                    <option value="Discount">Discount</option>
                                    <option value="Sales Due">Sales Due</option>
                                    <option value="Sales Cash">Sales Cash</option>
                                    <option value="Collections">Collections</option>
                                    <option value="Cash Deposit/Transfer In">Cash Deposit/Transfer In</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-ink-muted mb-1">Cash In Amount</label>
                                <input type="number" name="cashInAmount" value={formData.cashInAmount} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-ink-muted mb-1">Cash Out Type</label>
                                <select name="cashOutType" value={formData.cashOutType} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white focus:ring-2 focus:ring-brand outline-none">
                                    <option value="Total Purchase">Total Purchase</option>
                                    <option value="Total Purchase Due">Total Purchase Due</option>
                                    <option value="Total Purchase Payment">Total Purchase Payment</option>
                                    <option value="Collections/Deposit/Advance Return">Collections/Deposit/Advance Return</option>
                                    <option value="Expense">Expense</option>
                                    <option value="Cash Withdraw/Transfer From">Cash Withdraw/Transfer From</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-ink-muted mb-1">Cash Out Amount</label>
                                <input type="number" name="cashOutAmount" value={formData.cashOutAmount} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                            </div>
                        </>
                    )}

                    {type === 'sales' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-ink-muted mb-1">Invoice</label>
                                <input type="text" name="invoice" value={formData.invoice} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-ink-muted mb-1">Qty</label>
                                    <input type="number" name="qty" value={formData.qty} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-ink-muted mb-1">Subtotal</label>
                                    <input type="number" name="subtotal" value={formData.subtotal} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-ink-muted mb-1">Discount</label>
                                    <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-ink-muted mb-1">Total</label>
                                    <input type="number" name="total" value={formData.total} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                                </div>
                            </div>
                        </>
                    )}

                    {type === 'expenses' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-ink-muted mb-1">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white outline-none">
                                    <option value="Courier Cost">Courier Cost</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Donation">Donation</option>
                                    <option value="Bazar/Bhata">Bazar/Bhata</option>
                                    <option value="Advance">Advance</option>
                                    <option value="APPAION">APPAION</option>
                                    <option value="RAZER (BASA)">RAZER (BASA)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-ink-muted mb-1">Description</label>
                                <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-ink-muted mb-1">Amount</label>
                                <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                            </div>
                        </>
                    )}

                    {type === 'deposits' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-ink-muted mb-1">Note</label>
                                <input type="text" name="note" value={formData.note} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-ink-muted mb-1">Cash In</label>
                                    <input type="number" name="cashIn" value={formData.cashIn} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-ink-muted mb-1">Cash Out</label>
                                    <input type="number" name="cashOut" value={formData.cashOut} onChange={handleChange} className="w-full bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg p-2 text-ink-body dark:text-white" />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-brand hover:bg-brand-hover text-white rounded-xl shadow-lg shadow-brand/20">
                            {initialData ? 'Save Changes' : 'Add Entry'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEntryModal;
