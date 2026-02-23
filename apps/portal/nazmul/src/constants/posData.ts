import { POSInvoice, DailyClosing } from '../types/pos';
import { Product } from '../types/inventory';

export const MOCK_POS_PRODUCTS: Product[] = [
    { id: 'P1', sku: 'SP-001', name: 'Sprocket, Camshaft (NT:34)', category: 'parts', brand: 'Suzuki', price: 1770, costPrice: 1500, stock: 15, minStock: 5, status: 'in-stock', popularity: 10, unit: 'pcs' },
    { id: 'P2', sku: 'SP-002', name: 'Cable Assy Speedometer', category: 'parts', brand: 'Suzuki', price: 480, costPrice: 400, stock: 8, minStock: 3, status: 'in-stock', popularity: 5, unit: 'pcs' },
    { id: 'P3', sku: 'SP-003', name: 'Brake Pad Set, Front', category: 'parts', brand: 'Suzuki', price: 320, costPrice: 250, stock: 25, minStock: 10, status: 'in-stock', popularity: 15, unit: 'pair' },
    { id: 'P4', sku: 'SP-004', name: 'Headlamp Bulb', category: 'parts', brand: 'Generic', price: 300, costPrice: 200, stock: 50, minStock: 10, status: 'in-stock', popularity: 8, unit: 'pcs' },
    { id: 'P5', sku: 'OIL-001', name: 'Engine Oil 10W-40 (1L)', category: 'oil-consumables', brand: 'Suzuki Ecstar', price: 680, costPrice: 550, stock: 100, minStock: 20, status: 'in-stock', popularity: 25, unit: 'btl' },
    { id: 'A1', sku: 'ACC-001', name: 'Helmet Lock', category: 'accessories', brand: 'Generic', price: 450, costPrice: 300, stock: 12, minStock: 5, status: 'in-stock', popularity: 2, unit: 'pcs' },
];

export const MOCK_INVOICES: POSInvoice[] = [
    {
        id: 'INV167',
        invoiceNo: '167',
        customerId: 'C1',
        items: [
            { productId: 'P1', name: 'Sprocket, Camshaft (NT:34)', qty: 1, price: 1770, amount: 1770 },
            { productId: 'P2', name: 'Cable Assy Speedometer', qty: 1, price: 480, amount: 480 },
            { productId: 'P3', name: 'Brake Pad Set, Front', qty: 1, price: 320, amount: 320 },
            { productId: 'P4', name: 'Headlamp Bulb', qty: 2, price: 300, amount: 600 },
            { productId: 'P5', name: 'Engine Oil 10W-40 (1L)', qty: 2, price: 680, amount: 1360 },
        ],
        subtotal: 4530,
        vat: 0,
        discount: 0,
        transportFare: 100,
        total: 4630,
        paidAmount: 4630,
        change: 0,
        paymentMethod: 'cash',
        status: 'paid',
        salesRepId: 'U1',
        createdAt: '2024-04-24T10:30:00Z',
    }
];

export const MOCK_DAILY_CLOSING: DailyClosing[] = [
    {
        id: 'CLOSE-2024-04-23',
        date: '2024-04-23',
        totalSales: 25000,
        totalReturns: 500,
        cashInHand: 24500,
        breakdown: { cash: 20000, card: 3000, mfs: 1500 }
    }
];
