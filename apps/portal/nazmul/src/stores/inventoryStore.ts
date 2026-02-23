import { create } from 'zustand';
import { Product, StockAdjustment, PartsIssue } from '../types/inventory';
import { MOCK_INVENTORY_PRODUCTS, MOCK_STOCK_ADJUSTMENTS, MOCK_PARTS_ISSUES } from '../constants/inventoryData';

interface InventoryState {
    products: Product[];
    adjustments: StockAdjustment[];
    partsIssues: PartsIssue[];

    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    updateStock: (productId: string, quantity: number, type: 'in' | 'out', reason: string) => void;
    issueParts: (jobCardId: string, items: { productId: string; qty: number }[]) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
    products: MOCK_INVENTORY_PRODUCTS,
    adjustments: MOCK_STOCK_ADJUSTMENTS,
    partsIssues: MOCK_PARTS_ISSUES,

    addProduct: (product) => set((state) => ({ products: [...state.products, product] })),

    updateProduct: (product) => set((state) => ({
        products: state.products.map(p => p.id === product.id ? product : p)
    })),

    updateStock: (productId, quantity, type, reason) => set((state) => {
        const newAdjustment: StockAdjustment = {
            id: `ADJ${Date.now()}`,
            productId,
            type,
            quantity,
            reason,
            date: new Date().toISOString().split('T')[0],
            performedBy: 'Current User' // Mock user
        };

        const updatedProducts = state.products.map(p => {
            if (p.id === productId) {
                return {
                    ...p,
                    stock: type === 'in' ? p.stock + quantity : p.stock - quantity
                };
            }
            return p;
        });

        return {
            products: updatedProducts,
            adjustments: [newAdjustment, ...state.adjustments]
        };
    }),

    issueParts: (jobCardId, items) => set((state) => {
        // Logic to decrease stock would need to iterate over items
        // For simplicity here, we just record the issue
        const newIssue: PartsIssue = {
            id: `ISS${Date.now()}`,
            jobCardId,
            items,
            issuedBy: 'Current User',
            issuedAt: new Date().toISOString(),
            status: 'pending'
        };
        return { partsIssues: [newIssue, ...state.partsIssues] };
    })
}));
