import { Product, StockAdjustment, PartsIssue } from '../types/inventory';
import { MOCK_POS_PRODUCTS } from './posData'; // Reuse product data

export const MOCK_INVENTORY_PRODUCTS: Product[] = MOCK_POS_PRODUCTS;

export const MOCK_STOCK_ADJUSTMENTS: StockAdjustment[] = [
    {
        id: 'ADJ001',
        productId: 'P1',
        type: 'in',
        quantity: 10,
        reason: 'Restock via PO-1025',
        date: '2024-04-20',
        performedBy: 'U1'
    },
    {
        id: 'ADJ002',
        productId: 'P4',
        type: 'out',
        quantity: 1,
        reason: 'Damaged item',
        date: '2024-04-21',
        performedBy: 'U1'
    }
];

export const MOCK_PARTS_ISSUES: PartsIssue[] = [
    {
        id: 'ISS001',
        jobCardId: 'JC002',
        items: [
            { productId: 'P5', qty: 2 }, // Oil
            { productId: 'P3', qty: 1 }  // Brake Pad
        ],
        issuedBy: 'U1',
        issuedAt: '2024-04-24T11:00:00Z',
        status: 'approved'
    }
];
