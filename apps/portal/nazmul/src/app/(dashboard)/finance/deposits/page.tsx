'use client';

import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import FinanceReportHeader from '@/components/finance/FinanceReportHeader';
import DepositWithdrawTable from '@/components/finance/DepositWithdrawTable';
import { DEPOSIT_WITHDRAW_DATA, FINANCE_SUMMARY } from '@/constants/financeData';

const DepositsPage = () => {
    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb
                items={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Deposits/Withdraw' }
                ]}
            />

            <FinanceReportHeader
                title="Cash Deposit & Withdrawal"
                dateFrom={FINANCE_SUMMARY.dateFrom}
                dateTo={FINANCE_SUMMARY.dateTo}
            />

            <DepositWithdrawTable data={DEPOSIT_WITHDRAW_DATA} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-success/5 border border-success/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-success uppercase tracking-widest mb-1">Total Bank In</span>
                    <span className="text-3xl font-black text-success">Tk 2,000</span>
                </div>
                <div className="bg-danger/5 border border-danger/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-danger uppercase tracking-widest mb-1">Total Side Out</span>
                    <span className="text-3xl font-black text-danger">Tk 269,425</span>
                </div>
            </div>
        </div>
    );
};

export default DepositsPage;
