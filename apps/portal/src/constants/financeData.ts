import { CashBookEntry, DailySalesEntry, ExpenseEntry, DepositWithdrawEntry, FinanceReportSummary } from '../types/finance';

export const FINANCE_SUMMARY: FinanceReportSummary = {
    dateFrom: '09/02/2026',
    dateTo: '09/02/2026',
    openingBalance: 2521409,
    totalIn: 36065,
    totalOut: 274275,
    cashInHand: 2345199,
};

export const CASHBOOK_DATA: CashBookEntry[] = [
    { id: '1', cashInType: 'Sales', cashInAmount: 0, cashOutType: 'Total Purchase', cashOutAmount: 0 },
    { id: '2', cashInType: 'Discount', cashInAmount: 0, cashOutType: 'Total Purchase Due', cashOutAmount: 0 },
    { id: '3', cashInType: 'Sales Due', cashInAmount: 0, cashOutType: 'Total Purchase Payment', cashOutAmount: 0 },
    { id: '4', cashInType: 'Sales Cash', cashInAmount: 36065, cashOutType: 'Collections/Deposit/Advance Return', cashOutAmount: 0 },
    { id: '5', cashInType: 'Collections', cashInAmount: 0, cashOutType: 'Expense', cashOutAmount: 4850 },
    { id: '6', cashInType: 'Cash Deposit/Transfer In', cashInAmount: 0, cashOutType: 'Cash Withdraw/Transfer From', cashOutAmount: 269425 },
];

export const DAILY_SALES_DATA: DailySalesEntry[] = [
    // Image shows 0 sales for this date
];

export const EXPENSE_DATA: ExpenseEntry[] = [
    { id: 'e1', date: '09/02/2026', time: '06:22:50 pm', category: 'Courier Cost', description: 'JANANI KURIAR BILL FOR GIANT TRADING ACCESSORIES BILL PAY', totalAmount: 650 },
    { id: 'e2', date: '09/02/2026', time: '06:27:10 pm', category: 'Maintenance', description: 'NOZZEL FOR WATER LINE GUN', totalAmount: 290 },
    { id: 'e3', date: '09/02/2026', time: '06:31:53 pm', category: 'Donation', description: 'PROPRIETOR DONATION', totalAmount: 1000 },
    { id: 'e4', date: '09/02/2026', time: '07:56:18 pm', category: 'RAZER (BASA)', description: 'DIM KROY BILL PAY', totalAmount: 500 },
    { id: 'e5', date: '09/02/2026', time: '08:07:06 pm', category: 'Maintenance', description: 'DUP KROY BILL PAY', totalAmount: 100 },
    { id: 'e6', date: '09/02/2026', time: '08:07:40 pm', category: 'Maintenance', description: 'FOAM CYLINDER MAINTANANCE COST', totalAmount: 240 },
    { id: 'e7', date: '09/02/2026', time: '08:08:40 pm', category: 'Donation', description: 'DONATION.', totalAmount: 160 },
    { id: 'e8', date: '09/02/2026', time: '08:12:02 pm', category: 'Maintenance', description: 'ENGINE COLOR BILL PAY FOR CUSTOMER CLAIM.', totalAmount: 1500 },
    { id: 'e9', date: '09/02/2026', time: '08:13:13 pm', category: 'APPAION', description: 'FOR SHAH ENTERPRISE STAFF.', totalAmount: 150 },
];

export const DEPOSIT_WITHDRAW_DATA: DepositWithdrawEntry[] = [
    { id: 'dw1', date: '09/02/2026', note: 'SERVICE CASH TO SEBANGO JOMA', cashIn: 2000, cashOut: 0 },
    { id: 'dw2', date: '09/02/2026', note: 'SHOWROOM TO BANK ASIA', cashIn: 0, cashOut: 254000 },
    { id: 'dw3', date: '09/02/2026', note: 'SHOWROOM TO GEORGE CONSTRUCTION', cashIn: 0, cashOut: 10000 },
    { id: 'dw4', date: '09/02/2026', note: 'BKASH MERCHANT/PAYMENT ACCOUNT FOR ROYAL CONSORTIUM SERVICE CENTER', cashIn: 0, cashOut: 5425 },
];
