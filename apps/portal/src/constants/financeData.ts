import { CashBookEntry, DailySalesEntry, ExpenseEntry, DepositWithdrawEntry, FinanceReportSummary } from '../types/finance';

export const FINANCE_SUMMARY: FinanceReportSummary = {
    dateFrom: '',
    dateTo: '',
    openingBalance: 0,
    totalIn: 0,
    totalOut: 0,
    cashInHand: 0,
};

export const CASHBOOK_DATA: CashBookEntry[] = [];
export const DAILY_SALES_DATA: DailySalesEntry[] = [];
export const EXPENSE_DATA: ExpenseEntry[] = [];
export const DEPOSIT_WITHDRAW_DATA: DepositWithdrawEntry[] = [];
