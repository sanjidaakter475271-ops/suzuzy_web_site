export interface POSInvoice {
    id: string;
    invoiceNo: string;
    customerId?: string;
    jobCardId?: string;
    items: POSItem[];
    subtotal: number;
    vat: number;
    discount: number;
    transportFare: number;
    total: number;
    paidAmount: number;
    change: number;
    paymentMethod: 'cash' | 'card' | 'mfs' | 'credit';
    status: 'draft' | 'quotation' | 'invoiced' | 'paid' | 'returned';
    salesRepId: string;
    createdAt: string;
}

export interface POSItem {
    productId: string;
    name: string;
    qty: number;
    price: number;
    amount: number;
}

export interface DailyClosing {
    id: string;
    date: string;
    totalSales: number;
    totalReturns: number;
    cashInHand: number;
    breakdown: {
        cash: number;
        card: number;
        mfs: number;
    };
}
