'use client';

import React from 'react';
import { Calendar, Printer, FileDown } from 'lucide-react';
import { Button } from '@/components/ui';

interface FinanceReportHeaderProps {
    title: string;
    dateFrom: string;
    dateTo: string;
    openingBalance?: number;
}

const FinanceReportHeader: React.FC<FinanceReportHeaderProps> = ({ title, dateFrom, dateTo, openingBalance }) => {
    return (
        <div className="space-y-6 print:space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="print:text-center print:w-full">
                    <p className="hidden print:block text-xs font-bold font-mono text-black mb-1">
                        From: {dateFrom} To: {dateTo}
                    </p>
                    <h1 className="text-3xl font-black text-ink-heading dark:text-white print:text-black print:text-2xl print:uppercase print:tracking-widest">
                        {title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-ink-muted print:hidden">
                        <Calendar size={16} />
                        <span className="text-sm font-medium">From: <span className="text-ink-body dark:text-gray-300">{dateFrom}</span> To: <span className="text-ink-body dark:text-gray-300">{dateTo}</span></span>
                    </div>
                </div>
                <div className="flex gap-3 print:hidden">
                    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                        <Printer size={18} /> Print
                    </Button>
                    <Button className="gap-2">
                        <FileDown size={18} /> Export PDF
                    </Button>
                </div>
            </div>

            {openingBalance !== undefined && (
                <div className="bg-brand/5 border border-brand/10 rounded-xl p-4 flex items-center justify-between print:rounded-none print:bg-white print:border-black print:border-t-2 print:border-b-2 print:py-2">
                    <span className="text-sm font-bold text-brand uppercase tracking-wider print:text-black print:text-xs">Opening Balance</span>
                    <span className="text-2xl font-black text-brand print:text-black print:text-xl">Tk {openingBalance.toLocaleString()}</span>
                </div>
            )}
        </div>
    );
};

export default FinanceReportHeader;
