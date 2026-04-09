import { create } from 'zustand';
import { toast } from 'sonner';
import { Product, StockAdjustment, PartsIssue, SyncPreviewResult, SyncOptions } from '@/types/service-admin/inventory';

let currentAbortController: AbortController | null = null;

interface InventoryState {
    products: Product[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    summary: { totalValue: number; lowStockCount: number; totalItems: number };
    adjustments: StockAdjustment[];
    partsIssues: PartsIssue[];
    bikeModels: any[];
    categories: any[];
    isLoading: boolean;
    error: string | null;

    fetchProducts: (params?: { search?: string; categoryId?: string; bikeModelId?: string; stockStatus?: string; page?: number; limit?: number }) => Promise<void>;
    fetchAdjustments: () => Promise<void>;
    fetchRequisitions: () => Promise<void>;
    fetchBikeModels: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    previewSync: (rows: any[]) => Promise<SyncPreviewResult | null>;
    executeSync: (rows: any[], options: SyncOptions) => Promise<{ created: number; updated: number; skipped: number } | null>;
    approveRequisition: (id: string) => Promise<void>;
    rejectRequisition: (id: string, reason: string) => Promise<void>;
    addProduct: (product: any) => Promise<void>;
    updateProduct: (product: any) => Promise<void>;
    updateStock: (productId: string, quantity: number, type: 'in' | 'out', reason: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    products: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
    summary: { totalValue: 0, lowStockCount: 0, totalItems: 0 },
    adjustments: [],
    partsIssues: [],
    bikeModels: [],
    categories: [],
    isLoading: false,
    error: null,

    fetchProducts: async (params) => {
        if (currentAbortController) {
            currentAbortController.abort();
        }
        currentAbortController = new AbortController();

        set({ isLoading: true });
        try {
            const query = new URLSearchParams();
            if (params?.search) query.append('search', params.search);
            if (params?.categoryId) query.append('categoryId', params.categoryId);
            if (params?.bikeModelId) query.append('bikeModelId', params.bikeModelId);
            if (params?.stockStatus) query.append('stockStatus', params.stockStatus);
            if (params?.page) query.append('page', params.page.toString());
            if (params?.limit) query.append('limit', params.limit.toString());

            const res = await fetch(`/api/v1/workshop/inventory?${query.toString()}`, {
                signal: currentAbortController.signal
            });

            const data = await res.json();
            if (data.success) {
                set({
                    products: data.data,
                    pagination: data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 },
                    summary: data.summary || { totalValue: 0, lowStockCount: 0, totalItems: 0 },
                    isLoading: false
                });
            } else {
                set({ error: data.error || 'Failed to fetch products', isLoading: false });
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                set({ error: error.message, isLoading: false });
            }
        }
    },

    fetchBikeModels: async () => {
        try {
            const res = await fetch('/api/v1/workshop/inventory/bike-models');
            const data = await res.json();
            if (data.success) set({ bikeModels: data.data });
        } catch (error) {
            console.error("Error fetching bike models:", error);
        }
    },

    fetchCategories: async () => {
        try {
            const res = await fetch('/api/v1/workshop/inventory/categories');
            const data = await res.json();
            if (data.success) set({ categories: data.data });
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    },

    previewSync: async (rows) => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/v1/workshop/inventory/sync/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows })
            });
            const data = await res.json();
            set({ isLoading: false });
            if (data.success) return data.data;
            throw new Error(data.error);
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            return null;
        }
    },

    executeSync: async (rows, options) => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/v1/workshop/inventory/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows, options })
            });
            const data = await res.json();
            set({ isLoading: false });
            if (data.success) {
                await get().fetchProducts();
                return data.data;
            }
            throw new Error(data.error);
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            return null;
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
            toast.success("Product added successfully");
            await get().fetchProducts();
        } catch (error: any) {
            toast.error(error.message || "Failed to add product");
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
            toast.success("Product updated successfully");
            await get().fetchProducts();
        } catch (error: any) {
            toast.error(error.message || "Failed to update product");
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
            } else {
                set({ error: result.error, isLoading: false });
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
            toast.success("Requisition approved successfully");
            await get().fetchRequisitions();
        } catch (error: any) {
            toast.error(error.message || "Failed to approve requisition");
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
            toast.success("Requisition rejected");
            await get().fetchRequisitions();
        } catch (error: any) {
            toast.error(error.message || "Failed to reject requisition");
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

            toast.success(`Stock ${type === 'in' ? 'added' : 'removed'} successfully`);
            await get().fetchProducts();
            await get().fetchAdjustments();
            set({ isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || "Failed to update stock");
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
