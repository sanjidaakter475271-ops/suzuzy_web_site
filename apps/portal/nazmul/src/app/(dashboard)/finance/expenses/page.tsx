'use client';

import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import FinanceReportHeader from '@/components/finance/FinanceReportHeader';
import ExpenseTable from '@/components/finance/ExpenseTable';
import { EXPENSE_DATA, FINANCE_SUMMARY } from '@/constants/financeData';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';

const ExpensesPage = () => {
    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <div className="flex items-center justify-between">
                <Breadcrumb
                    items={[
                        { label: 'Finance', href: '/finance' },
                        { label: 'Expenses' }
                    ]}
                />
                <Button className="gap-2">
                    <Plus size={18} /> Add New Expense
                </Button>
            </div>

            <FinanceReportHeader
                title="Expense Distribution"
                dateFrom={FINANCE_SUMMARY.dateFrom}
                dateTo={FINANCE_SUMMARY.dateTo}
            />

            <ExpenseTable data={EXPENSE_DATA} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Courier/Delivery", amount: 650, color: "bg-orange-500" },
                    { label: "Maintenance", amount: 2130, color: "bg-blue-500" },
                    { label: "Donations/Bazar", amount: 1870, color: "bg-purple-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border p-4 rounded-xl flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${stat.color}`}></div>
                        <div>
                            <p className="text-[10px] font-bold text-ink-muted uppercase">{stat.label}</p>
                            <p className="text-lg font-black text-ink-heading dark:text-white">Tk {stat.amount.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpensesPage;
