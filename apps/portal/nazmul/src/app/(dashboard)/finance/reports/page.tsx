'use client';

import React from 'react';
import { Bird } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import FinanceReportHeader from '@/components/finance/FinanceReportHeader';
import CashBookTable from '@/components/finance/CashBookTable';
import DailySalesTable from '@/components/finance/DailySalesTable';
import ExpenseTable from '@/components/finance/ExpenseTable';
import DepositWithdrawTable from '@/components/finance/DepositWithdrawTable';
import {
    CASHBOOK_DATA,
    DAILY_SALES_DATA,
    EXPENSE_DATA,
    DEPOSIT_WITHDRAW_DATA,
    FINANCE_SUMMARY
} from '@/constants/financeData';

const CombinedReportsPage = () => {
    return (
        <div className="p-6 lg:p-8 space-y-12 animate-fade bg-white dark:bg-dark-page print:p-0 print:m-0 print:bg-white text-black min-h-screen">
            <div className="print:hidden">
                <Breadcrumb
                    items={[
                        { label: 'Finance', href: '/finance' },
                        { label: 'Combined Reports' }
                    ]}
                />
            </div>

            <div className="space-y-10 max-w-5xl mx-auto print:max-w-none print:w-full print:space-y-6 print:px-4">
                {/* PDF Header Logo Area */}
                <div className="flex flex-col items-center justify-center text-center space-y-2 border-b-2 border-surface-border dark:border-white/10 pb-8 print:pb-4 print:border-black">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand rounded-lg text-white print:bg-black">
                            <Bird size={28} fill="currentColor" />
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter uppercase print:text-4xl text-ink-heading dark:text-white">Royal Consortium</h2>
                    </div>
                    <p className="text-sm font-black text-ink-body dark:text-gray-300 uppercase tracking-[0.3em] print:text-xs print:text-black">Daily Financial Distribution Report</p>
                    <div className="text-[10px] font-mono text-ink-muted dark:text-gray-400 uppercase flex gap-4 print:text-black">
                        <span>EST. 2020</span>
                        <span>•</span>
                        <span>Report ID: RC-{new Date().getFullYear()}-001</span>
                    </div>
                </div>

                <FinanceReportHeader
                    title="Consolidated Finance Report"
                    dateFrom={FINANCE_SUMMARY.dateFrom}
                    dateTo={FINANCE_SUMMARY.dateTo}
                    openingBalance={FINANCE_SUMMARY.openingBalance}
                />

                <div className="grid grid-cols-1 gap-12 print:gap-8">
                    <CashBookTable
                        data={CASHBOOK_DATA}
                        totalIn={FINANCE_SUMMARY.totalIn}
                        totalOut={FINANCE_SUMMARY.totalOut}
                        cashInHand={FINANCE_SUMMARY.cashInHand}
                    />

                    <DailySalesTable data={DAILY_SALES_DATA} />

                    <ExpenseTable data={EXPENSE_DATA} />

                    <DepositWithdrawTable data={DEPOSIT_WITHDRAW_DATA} />
                </div>

                {/* Footer Area for Signatures in Print */}
                <div className="hidden print:grid grid-cols-2 gap-40 pt-24 pb-12">
                    <div className="border-t border-black text-center pt-3">
                        <p className="text-sm font-black uppercase tracking-widest text-black">Prepared By</p>
                        <p className="text-[10px] text-gray-500 mt-1">Accounts Department</p>
                    </div>
                    <div className="border-t border-black text-center pt-3">
                        <p className="text-sm font-black uppercase tracking-widest text-black">Approved By</p>
                        <p className="text-[10px] text-gray-500 mt-1">Proprietor / CEO Signature</p>
                    </div>
                </div>

                {/* Office Copy / Stamp Placeholder */}
                <div className="hidden print:flex justify-end pt-10">
                    <div className="w-32 h-32 border-4 border-black/10 rounded-full flex items-center justify-center border-dashed">
                        <span className="text-[8px] font-black text-black/20 uppercase text-center rotate-[-15deg]">Official Seal<br />& Stamp</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CombinedReportsPage;
