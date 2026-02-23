export interface Product {
    id: string;
    sku: string;
    name: string;
    category: 'parts' | 'accessories' | 'oil-consumables';
    brand: string;
    price: number;
    costPrice: number;
    stock: number;
    minStock: number;
    image?: string;
    popularity?: number; // Usage frequency
    unit?: string; // e.g., 'pair', 'ea', 'pcs'
    code?: string;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface StockAdjustment {
    id: string;
    productId: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number; // Changed from qty to match usage
    reason: string;
    date: string;
    performedBy: string; // Added
}

export interface PartsIssueItem {
    productId: string;
    qty: number;
}

export interface PartsIssue {
    id: string;
    jobCardId: string;
    items: PartsIssueItem[]; // Changed to array of items
    issuedBy: string;
    issuedAt: string; // Changed from date to match usage
    status: 'pending' | 'approved' | 'rejected'; // Added
}
