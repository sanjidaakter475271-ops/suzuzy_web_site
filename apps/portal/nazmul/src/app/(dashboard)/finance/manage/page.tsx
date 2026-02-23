'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Filter } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui';
import AddEntryModal from '@/components/finance/AddEntryModal';
import {
    CASHBOOK_DATA,
    DAILY_SALES_DATA,
    EXPENSE_DATA,
    DEPOSIT_WITHDRAW_DATA
} from '@/constants/financeData';
import {
    CashBookEntry,
    DailySalesEntry,
    ExpenseEntry,
    DepositWithdrawEntry
} from '@/types/finance';
import { cn } from '@/lib/utils';

type FinanceTab = 'cashbook' | 'sales' | 'expenses' | 'deposits';

const FinanceManagementPage = () => {
    const [activeTab, setActiveTab] = useState<FinanceTab>('cashbook');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    // State for all data types
    const [cashbook, setCashbook] = useState<CashBookEntry[]>(CASHBOOK_DATA);
    const [sales, setSales] = useState<DailySalesEntry[]>(DAILY_SALES_DATA);
    const [expenses, setExpenses] = useState<ExpenseEntry[]>(EXPENSE_DATA);
    const [deposits, setDeposits] = useState<DepositWithdrawEntry[]>(DEPOSIT_WITHDRAW_DATA);

    const handleAddOrUpdate = (entry: any) => {
        if (activeTab === 'cashbook') {
            if (editData) setCashbook(cashbook.map(i => i.id === entry.id ? entry : i));
            else setCashbook([entry, ...cashbook]);
        } else if (activeTab === 'sales') {
            if (editData) setSales(sales.map(i => i.id === entry.id ? entry : i));
            else setSales([entry, ...sales]);
        } else if (activeTab === 'expenses') {
            if (editData) setExpenses(expenses.map(i => i.id === entry.id ? entry : i));
            else setExpenses([entry, ...expenses]);
        } else if (activeTab === 'deposits') {
            if (editData) setDeposits(deposits.map(i => i.id === entry.id ? entry : i));
            else setDeposits([entry, ...deposits]);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            if (activeTab === 'cashbook') setCashbook(cashbook.filter(i => i.id !== id));
            else if (activeTab === 'sales') setSales(sales.filter(i => i.id !== id));
            else if (activeTab === 'expenses') setExpenses(expenses.filter(i => i.id !== id));
            else if (activeTab === 'deposits') setDeposits(deposits.filter(i => i.id !== id));
        }
    };

    const handleEdit = (entry: any) => {
        setEditData(entry);
        setIsModalOpen(true);
    };

    const TABS: { id: FinanceTab; label: string }[] = [
        { id: 'cashbook', label: 'CashBook' },
        { id: 'sales', label: 'Daily Sales' },
        { id: 'expenses', label: 'Expenses' },
        { id: 'deposits', label: 'Deposits/Withdraw' }
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade min-h-screen bg-surface-page dark:bg-dark-page">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Breadcrumb
                        items={[
                            { label: 'Finance', href: '/finance' },
                            { label: 'Manage Finance' }
                        ]}
                    />
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white uppercase tracking-tight mt-2">
                        Finance Management
                    </h1>
                </div>
                <Button
                    className="bg-brand hover:bg-brand-hover text-white rounded-xl shadow-lg shadow-brand/20 gap-2 h-12 px-6"
                    onClick={() => { setEditData(null); setIsModalOpen(true); }}
                >
                    <Plus size={20} /> Add New Entry
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-surface-card dark:bg-dark-card rounded-2xl border border-surface-border dark:border-dark-border w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                            activeTab === tab.id
                                ? "bg-brand text-white shadow-lg shadow-brand/20"
                                : "text-ink-muted hover:text-ink-body dark:hover:text-white hover:bg-surface-hover dark:hover:bg-dark-sidebar"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Data Table Container */}
            <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-2xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-surface-border dark:border-dark-border bg-surface-page/50 dark:bg-dark-page/50">
                                {activeTab === 'cashbook' && (
                                    <>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Cash In Type</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">In Amount</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Cash Out Type</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Out Amount</th>
                                    </>
                                )}
                                {activeTab === 'sales' && (
                                    <>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Invoice</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Qty</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Total</th>
                                    </>
                                )}
                                {activeTab === 'expenses' && (
                                    <>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Date/Time</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Description</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Amount</th>
                                    </>
                                )}
                                {activeTab === 'deposits' && (
                                    <>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Note</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Cash In</th>
                                        <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest">Cash Out</th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-xs font-black text-ink-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                            {activeTab === 'cashbook' && cashbook.map((entry) => (
                                <tr key={entry.id} className="hover:bg-surface-hover/50 dark:hover:bg-dark-sidebar/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-bold text-ink-heading dark:text-white">{entry.cashInType}</td>
                                    <td className="px-6 py-4 text-sm font-mono font-bold text-success">Tk {entry.cashInAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-ink-heading dark:text-white">{entry.cashOutType}</td>
                                    <td className="px-6 py-4 text-sm font-mono font-bold text-danger">Tk {entry.cashOutAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(entry)} className="p-2 text-ink-muted hover:text-brand bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-brand/20">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(entry.id)} className="p-2 text-ink-muted hover:text-danger bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg transition-all duration-200">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'sales' && sales.map((entry) => (
                                <tr key={entry.id} className="hover:bg-surface-hover/50 dark:hover:bg-dark-sidebar/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-bold text-ink-heading dark:text-white">{entry.date}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-ink-body dark:text-gray-300">#{entry.invoice}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-ink-heading dark:text-white">{entry.qty}</td>
                                    <td className="px-6 py-4 text-sm font-mono font-bold text-brand">Tk {entry.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(entry)} className="p-2 text-ink-muted hover:text-brand bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg transition-all">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(entry.id)} className="p-2 text-ink-muted hover:text-danger bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'expenses' && expenses.map((entry) => (
                                <tr key={entry.id} className="hover:bg-surface-hover/50 dark:hover:bg-dark-sidebar/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-bold text-ink-heading dark:text-white">{entry.date}<br /><span className="text-[10px] text-ink-muted">{entry.time}</span></td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-danger/10 text-danger text-[10px] font-black uppercase rounded-md">{entry.category}</span></td>
                                    <td className="px-6 py-4 text-sm text-ink-body dark:text-gray-300">{entry.description}</td>
                                    <td className="px-6 py-4 text-sm font-mono font-bold text-danger">Tk {entry.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(entry)} className="p-2 text-ink-muted hover:text-brand bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg transition-all">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(entry.id)} className="p-2 text-ink-muted hover:text-danger bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'deposits' && deposits.map((entry) => (
                                <tr key={entry.id} className="hover:bg-surface-hover/50 dark:hover:bg-dark-sidebar/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-bold text-ink-heading dark:text-white">{entry.date}</td>
                                    <td className="px-6 py-4 text-sm text-ink-body dark:text-gray-300">{entry.note}</td>
                                    <td className="px-6 py-4 text-sm font-mono font-bold text-success">Tk {entry.cashIn.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm font-mono font-bold text-danger">Tk {entry.cashOut.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(entry)} className="p-2 text-ink-muted hover:text-brand bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg transition-all">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(entry.id)} className="p-2 text-ink-muted hover:text-danger bg-surface-page dark:bg-dark-page border border-surface-border dark:border-dark-border rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={activeTab}
                initialData={editData}
                onAdd={handleAddOrUpdate}
            />
        </div>
    );
};

export default FinanceManagementPage;
