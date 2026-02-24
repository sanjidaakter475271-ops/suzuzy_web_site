import { create } from 'zustand';
import { POSInvoice, POSItem } from '@/types/service-admin/pos';
import { Product } from '@/types/service-admin/inventory';
// Mock data imports removed — all data now fetched from real APIs

interface POSState {
    products: Product[];
    cart: POSItem[];
    invoices: POSInvoice[];
    customer: string | null;
    discount: number;
    transport: number;
    isLoading: boolean;
    activeJob: {
        id: string;
        jobNo: string;
        vehicleRegNo: string;
        laborCost: number;
    } | null;

    fetchProducts: () => Promise<void>;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => Promise<void>;
    updateQty: (productId: string, qty: number) => void;
    setDiscount: (amount: number) => void;
    setTransport: (amount: number) => void;
    setCustomer: (customer: string | null) => void;
    checkout: (jobCardId?: string, paymentMethod?: string) => Promise<any>;
    clearCart: () => void;
    loadJobBilling: (jobId: string) => Promise<void>;
    fetchInvoices: () => Promise<void>;
}

export const usePOSStore = create<POSState>((set, get) => ({
    products: [],
    cart: [],
    invoices: [],
    customer: null,
    discount: 0,
    transport: 0,
    isLoading: false,
    activeJob: null,

    fetchProducts: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/v1/workshop/inventory');
            const data = await res.json();
            if (data.success) {
                set({ products: data.data });
            }
        } catch (error) {
            console.error('POS fetch error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addToCart: (product) => {
        const { cart, products } = get();

        // Update product popularity
        const updatedProducts = products.map(p =>
            p.id === product.id ? { ...p, popularity: (p.popularity || 0) + 1 } : p
        );

        const existing = cart.find(item => item.productId === product.id);
        const updatedCart = existing
            ? cart.map(item => item.productId === product.id
                ? { ...item, qty: item.qty + 1, amount: (item.qty + 1) * item.price }
                : item
            )
            : [...cart, {
                productId: product.id,
                name: product.name,
                qty: 1,
                price: product.price,
                amount: product.price
            }];

        set({
            products: updatedProducts,
            cart: updatedCart
        });
    },

    removeFromCart: async (productId: string) => {
        const { cart } = get();
        const itemToRemove = cart.find(item => item.productId === productId);

        if (itemToRemove?.requisitionId) {
            // Revert on backend
            try {
                const res = await fetch(`/api/v1/workshop/requisitions/${itemToRemove.requisitionId}/return`, {
                    method: 'POST'
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
            } catch (error: any) {
                alert("Failed to return stock: " + error.message);
                return;
            }
        }

        set((state) => ({
            cart: state.cart.filter(item => item.productId !== productId)
        }));
    },

    updateQty: (productId: string, qty: number) => set((state) => ({
        cart: state.cart.map(item => item.productId === productId
            ? { ...item, qty, amount: qty * item.price }
            : item
        )
    })),

    setDiscount: (discount: number) => set({ discount }),
    setTransport: (transport: number) => set({ transport }),
    setCustomer: (customer: string | null) => set({ customer }),

    clearCart: () => set({ cart: [], customer: null, discount: 0, transport: 0 }),

    loadJobBilling: async (jobId: string) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`/api/v1/workshop/jobs/${jobId}/billing`);
            const data = await res.json();
            if (data.success) {
                const job = data.data;
                const cartItems: POSItem[] = job.items.map((item: any) => ({
                    productId: item.productId,
                    requisitionId: item.requisitionId,
                    name: item.description,
                    qty: item.qty,
                    price: item.cost,
                    amount: item.amount || (item.cost * item.qty)
                }));
                set({
                    cart: cartItems,
                    customer: job.customerName,
                    discount: job.discount || 0,
                    activeJob: {
                        id: job.jobId,
                        jobNo: job.jobNumber,
                        vehicleRegNo: job.plateNumber,
                        laborCost: job.laborCost || 0
                    }
                });
            }
        } catch (error) {
            console.error('POS load job error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    checkout: async (jobCardId?: string, paymentMethod: string = 'cash') => {
        const { cart, discount, transport, customer, activeJob } = get();
        if (cart.length === 0) return null;

        set({ isLoading: true });
        try {
            const subtotal = cart.reduce((sum, item) => sum + (item.amount || (item.price * item.qty)), 0) + (activeJob?.laborCost || 0);
            const discountAmount = (subtotal * (discount || 0)) / 100;
            const total = (subtotal - discountAmount) + transport;

            const res = await fetch('/api/v1/workshop/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobCardId,
                    customerName: customer,
                    items: cart,
                    subtotal,
                    discount,
                    transport,
                    total,
                    paymentMethod,
                    laborCost: activeJob?.laborCost || 0
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            get().clearCart();
            return data.data; // Return sale record
        } catch (error: any) {
            alert(error.message);
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchInvoices: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/v1/workshop/sales');
            const data = await res.json();
            if (data.success) {
                set({ invoices: data.data });
            }
        } catch (error) {
            console.error('POS fetch invoices error:', error);
        } finally {
            set({ isLoading: false });
        }
    }
}));
