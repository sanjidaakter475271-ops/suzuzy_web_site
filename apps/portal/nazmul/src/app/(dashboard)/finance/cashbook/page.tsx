'use client';

import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import FinanceReportHeader from '@/components/finance/FinanceReportHeader';
import CashBookTable from '@/components/finance/CashBookTable';
import { CASHBOOK_DATA, FINANCE_SUMMARY } from '@/constants/financeData';

const CashBookPage = () => {
    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb
                items={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'CashBook Report' }
                ]}
            />

            <FinanceReportHeader
                title="CashBook Statement"
                dateFrom={FINANCE_SUMMARY.dateFrom}
                dateTo={FINANCE_SUMMARY.dateTo}
                openingBalance={FINANCE_SUMMARY.openingBalance}
            />

            <CashBookTable
                data={CASHBOOK_DATA}
                totalIn={FINANCE_SUMMARY.totalIn}
                totalOut={FINANCE_SUMMARY.totalOut}
                cashInHand={FINANCE_SUMMARY.cashInHand}
            />

            <div className="bg-surface-page dark:bg-dark-page/30 p-4 rounded-lg border border-surface-border dark:border-dark-border">
                <p className="text-xs text-ink-muted italic">
                    * This report shows all cash movements including sales cash, purchases, expenses, and bank transfers relative to the chosen date range.
                </p>
            </div>
        </div>
    );
};

export default CashBookPage;
