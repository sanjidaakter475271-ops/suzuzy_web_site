import { create } from 'zustand';
import { Product, StockAdjustment, PartsIssue } from '@/types/service-admin/inventory';

interface InventoryState {
    products: Product[];
    adjustments: StockAdjustment[];
    partsIssues: PartsIssue[];
    isLoading: boolean;
    error: string | null;

    fetchProducts: () => Promise<void>;
    fetchAdjustments: () => Promise<void>;
    fetchRequisitions: () => Promise<void>;
    approveRequisition: (id: string) => Promise<void>;
    rejectRequisition: (id: string, reason: string) => Promise<void>;
    addProduct: (product: any) => Promise<void>;
    updateProduct: (product: any) => Promise<void>;
    updateStock: (productId: string, quantity: number, type: 'in' | 'out', reason: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    products: [],
    adjustments: [],
    partsIssues: [],
    isLoading: false,
    error: null,

    fetchProducts: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/v1/workshop/inventory');
            const data = await res.json();
            if (data.success) {
                set({ products: data.data, isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchAdjustments: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/v1/workshop/inventory?movements=true');
            const data = await res.json();
            if (data.success) {
                const mappedAdjustments = data.data.map((m: any) => ({
                    id: m.id,
                    productId: m.product_id,
                    productName: m.products?.name || 'Unknown',
                    quantity: Math.abs(m.quantity_change),
                    type: m.quantity_change > 0 ? 'in' : 'out',
                    reason: m.reason || 'N/A',
                    performedBy: m.profiles?.full_name || 'System',
                    date: new Date(m.created_at).toLocaleDateString()
                }));
                set({ adjustments: mappedAdjustments, isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addProduct: async (product: any) => {
        try {
            const res = await fetch('/api/v1/workshop/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await get().fetchProducts();
        } catch (error: any) {
            alert(error.message);
        }
    },

    updateProduct: async (product: any) => {
        try {
            const res = await fetch('/api/v1/workshop/inventory', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await get().fetchProducts();
        } catch (error: any) {
            alert(error.message);
        }
    },

    fetchRequisitions: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/v1/workshop/requisitions?status=pending');
            const result = await res.json();
            if (result.success) {
                const issues: PartsIssue[] = result.data.map((r: any) => ({
                    id: r.id,
                    jobCardId: r.job_card_id,
                    items: [{
                        productId: r.product_id,
                        qty: r.quantity,
                        productName: r.products?.name || 'Unknown'
                    }],
                    issuedBy: r.service_staff?.profiles?.full_name || 'Technician',
                    issuedAt: r.created_at,
                    status: r.status
                }));
                set({ partsIssues: issues, isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    approveRequisition: async (id: string) => {
        try {
            const res = await fetch(`/api/v1/workshop/requisitions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await get().fetchRequisitions();
        } catch (error: any) {
            alert(error.message);
        }
    },

    rejectRequisition: async (id: string, reason: string) => {
        try {
            const res = await fetch(`/api/v1/workshop/requisitions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected', reason })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await get().fetchRequisitions();
        } catch (error: any) {
            alert(error.message);
        }
    },

    updateStock: async (productId: string, quantity: number, type: 'in' | 'out', reason: string) => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/v1/workshop/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity, type, reason })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            await get().fetchProducts();
            await get().fetchAdjustments();
            set({ isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            alert(error.message);
        }
    }
}));

// Setup real-time listeners
if (typeof window !== 'undefined') {
    import('@/lib/socket').then(({ socket }) => {
        socket.on('inventory:changed', () => {
            useInventoryStore.getState().fetchProducts();
            useInventoryStore.getState().fetchAdjustments();
        });

        socket.on('inventory:adjusted', () => {
            useInventoryStore.getState().fetchProducts();
            useInventoryStore.getState().fetchAdjustments();
        });

        socket.on('requisition:status_changed', () => {
            useInventoryStore.getState().fetchRequisitions();
        });

        socket.on('requisition:created', () => {
            useInventoryStore.getState().fetchRequisitions();
        });
    });
}
