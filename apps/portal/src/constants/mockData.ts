import { KPI, ChartData, Transaction, FinancialAccount } from '../types';

export const KPIS: KPI[] = [
    { title: "Total Revenue", value: "145,230", change: "+12.5%", isPositive: true, prefix: "$" },
    { title: "Total Expenses", value: "89,450", change: "-5.2%", isPositive: false, prefix: "$" },
    { title: "Net Profit", value: "55,780", change: "+18.7%", isPositive: true, prefix: "$" },
    { title: "Active Users", value: "2,847", change: "+8.3%", isPositive: true },
];

export const REVENUE_DATA: ChartData[] = [
    { name: 'Jan', income: 12000, expense: 8000 },
    { name: 'Feb', income: 15000, expense: 9500 },
    { name: 'Mar', income: 13000, expense: 8500 },
    { name: 'Apr', income: 18000, expense: 11000 },
    { name: 'May', income: 22000, expense: 12000 },
    { name: 'Jun', income: 25000, expense: 15000 },
    { name: 'Jul', income: 28000, expense: 17000 },
    { name: 'Aug', income: 26000, expense: 16000 },
    { name: 'Sep', income: 30000, expense: 19000 },
    { name: 'Oct', income: 32000, expense: 21000 },
    { name: 'Nov', income: 35000, expense: 22000 },
    { name: 'Dec', income: 42000, expense: 25000 },
];

export const EXPENSE_BREAKDOWN_DATA: ChartData[] = [
    { name: 'Salaries', value: 45000 },
    { name: 'Marketing', value: 15000 },
    { name: 'Infrastructure', value: 12000 },
    { name: 'Services', value: 8000 },
    { name: 'Miscellaneous', value: 9450 },
];

export const TRANSACTION_VOLUME_DATA: ChartData[] = [
    { name: 'Services', income: 45000, expense: 20000 },
    { name: 'Products', income: 35000, expense: 25000 },
    { name: 'Subscrip.', income: 25000, expense: 5000 },
    { name: 'Consulting', income: 15000, expense: 8000 },
];

export const ACCOUNTS: FinancialAccount[] = [
    { id: '1', name: 'Main Savings', balance: '$24,500.00', number: '**** 4582', type: 'savings' },
    { id: '2', name: 'Checking Account', balance: '$8,250.50', number: '**** 9921', type: 'checking' },
    { id: '3', name: 'Investments', balance: '$12,400.00', number: 'Portfolio A', type: 'investment' },
    { id: '4', name: 'Credit Card', balance: '$1,200.00', number: '**** 8821', type: 'credit' },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
    { id: '1', title: 'Salary Deposit', category: 'Payroll', date: 'Feb 10, 2026', amount: '+$4,500.00', type: 'income' },
    { id: '2', title: 'Netflix Subscription', category: 'Entertainment', date: 'Feb 09, 2026', amount: '-$14.99', type: 'expense' },
    { id: '3', title: 'Supabase Pro', category: 'Software', date: 'Feb 08, 2026', amount: '-$25.00', type: 'expense' },
    { id: '4', title: 'Apple Store', category: 'Equipment', date: 'Feb 06, 2026', amount: '-$1,299.00', type: 'expense' },
    { id: '5', title: 'Freelance Work', category: 'Income', date: 'Feb 05, 2026', amount: '+$850.00', type: 'income' },
];

export const GOALS = [
    { title: "Emergency Fund", current: 8500, target: 15000, date: "Dec 2026", color: "bg-success" },
    { title: "Stock Portfolio", current: 12400, target: 50000, date: "Aug 2027", color: "bg-brand" },
    { title: "Debt Repayment", current: 3000, target: 5000, date: "Jun 2026", color: "bg-info" },
];
