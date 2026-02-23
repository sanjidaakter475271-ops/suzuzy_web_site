import { create } from 'zustand';
import { POSInvoice, POSItem } from '../types/pos';
import { Product } from '../types/inventory';
import { MOCK_POS_PRODUCTS, MOCK_INVOICES } from '../constants/posData';

interface POSState {
    products: Product[];
    cart: POSItem[];
    invoices: POSInvoice[];
    customer: string | null; // Customer ID or Name
    discount: number;
    transport: number;

    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQty: (productId: string, qty: number) => void;
    setDiscount: (amount: number) => void;
    setTransport: (amount: number) => void;
    setCustomer: (customer: string | null) => void;
    checkout: () => void;
    clearCart: () => void;
}

export const usePOSStore = create<POSState>((set, get) => ({
    products: MOCK_POS_PRODUCTS,
    cart: [],
    invoices: MOCK_INVOICES,
    customer: null,
    discount: 0,
    transport: 0,

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

    removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.productId !== productId)
    })),

    updateQty: (productId, qty) => set((state) => ({
        cart: state.cart.map(item => item.productId === productId
            ? { ...item, qty, amount: qty * item.price }
            : item
        )
    })),

    setDiscount: (discount) => set({ discount }),
    setTransport: (transport) => set({ transport }),
    setCustomer: (customer) => set({ customer }),

    clearCart: () => set({ cart: [], customer: null, discount: 0, transport: 0 }),

    checkout: () => {
        const { cart, discount, transport, invoices, clearCart } = get();
        if (cart.length === 0) return;

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const total = subtotal - discount + transport;

        const newInvoice: POSInvoice = {
            id: `INV-${Date.now()}`,
            invoiceNo: `${Math.floor(100 + Math.random() * 900)}`,
            items: [...cart],
            subtotal,
            vat: 0,
            discount,
            transportFare: transport,
            total,
            paidAmount: total,
            change: 0,
            paymentMethod: 'cash',
            status: 'paid',
            salesRepId: 'U1',
            createdAt: new Date().toISOString(),
        };

        set({
            invoices: [newInvoice, ...invoices]
        });

        clearCart();
        alert('Invoice created successfully!');
    }
}));
