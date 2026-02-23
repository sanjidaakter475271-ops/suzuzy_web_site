'use client';

import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import FinanceReportHeader from '@/components/finance/FinanceReportHeader';
import DailySalesTable from '@/components/finance/DailySalesTable';
import { DAILY_SALES_DATA, FINANCE_SUMMARY } from '@/constants/financeData';

const DailySalesPage = () => {
    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade">
            <Breadcrumb
                items={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Daily Sales' }
                ]}
            />

            <FinanceReportHeader
                title="Daily Sales Summary"
                dateFrom={FINANCE_SUMMARY.dateFrom}
                dateTo={FINANCE_SUMMARY.dateTo}
            />

            <DailySalesTable data={DAILY_SALES_DATA} />

            <div className="flex justify-center pt-10">
                <div className="bg-surface-card dark:bg-dark-card border border-surface-border dark:border-dark-border px-8 py-6 rounded-2xl text-center shadow-sm">
                    <h4 className="text-xl font-bold text-brand mb-1">Tk 0</h4>
                    <p className="text-xs text-ink-muted uppercase font-black tracking-widest">Grand Total Sales (Cash + Due)</p>
                </div>
            </div>
        </div>
    );
};

export default DailySalesPage;
