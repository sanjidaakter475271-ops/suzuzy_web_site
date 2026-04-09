export interface Product {
    id: string;
    sku: string;
    name: string;
    category: 'parts' | 'accessories' | 'oil-consumables' | string;
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
    specifications?: {
        warehouse_bin?: string;
        [key: string]: any;
    };
}

export interface StockAdjustment {
    id: string;
    productId: string;
    productName?: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number; // Changed from qty to match usage
    reason: string;
    date: string;
    performedBy?: string; // Added optional
}

export interface PartsIssueItem {
    productId: string;
    productName?: string;
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

export interface SyncPreviewRow {
    bike_model: string;
    category: string;
    sub_category: string;
    part_number: string;
    description: string;
    price: string;
    stock: string;
    action: 'CREATE' | 'UPDATE' | 'SKIP';
    existing_name?: string;
    changes?: string[];
    is_location_code?: boolean;
    detected_location?: string;
}

export interface SyncPreviewResult {
    summary: {
        total: number;
        new_products: number;
        updates: number;
        skipped: number;
        new_categories: number;
        new_bike_models: number;
    };
    categories_to_create: string[];
    bike_models_to_create: string[];
    products: SyncPreviewRow[];
}

export interface SyncOptions {
    update_stock: boolean;
    update_prices: boolean;
    create_bike_model_links: boolean;
}
