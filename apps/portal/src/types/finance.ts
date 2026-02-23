export interface CashBookEntry {
    id: string;
    cashInType: 'Sales' | 'Discount' | 'Sales Due' | 'Sales Cash' | 'Collections' | 'Cash Deposit/Transfer In';
    cashInAmount: number;
    cashOutType: 'Total Purchase' | 'Total Purchase Due' | 'Total Purchase Payment' | 'Collections/Deposit/Advance Return' | 'Expense' | 'Cash Withdraw/Transfer From';
    cashOutAmount: number;
}

export interface DailySalesEntry {
    id: string;
    date: string;
    invoice: string;
    qty: number;
    subtotal: number;
    discount: number;
    total: number;
    comment?: string;
}

export interface ExpenseEntry {
    id: string;
    date: string;
    time: string;
    category: 'Courier Cost' | 'Maintenance' | 'Donation' | 'Bazar/Bhata' | 'Advance' | 'APPAION' | 'RAZER (BASA)';
    description: string;
    totalAmount: number;
}

export interface DepositWithdrawEntry {
    id: string;
    date: string;
    note: string;
    cashIn: number;
    cashOut: number;
}

export interface FinanceReportSummary {
    dateFrom: string;
    dateTo: string;
    openingBalance: number;
    totalIn: number;
    totalOut: number;
    cashInHand: number;
}
