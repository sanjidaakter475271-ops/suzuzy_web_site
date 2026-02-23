
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Customer {
    id: string;
    name: string;
    phone: string;
    vehicles: CustomerVehicle[];
}

interface CustomerVehicle {
    id: string;
    regNo: string;
    model: string;
    lastService?: string;
}

interface ServiceRequest {
    id: string;
    vehicleId: string;
    complaint: string;
    status: 'pending' | 'accepted' | 'rejected';
    date: string;
}

interface CustomerState {
    isAuthenticated: boolean;
    customer: Customer | null;
    serviceRequests: ServiceRequest[];

    login: (phone: string, otp: string) => Promise<boolean>;
    register: (data: { name: string; phone: string; vehicleModel: string; vehicleRegNo: string }) => Promise<boolean>;
    logout: () => void;
    requestService: (vehicleId: string, complaint: string) => void;
}

// Mock Data
const MOCK_CUSTOMER: Customer = {
    id: 'C1',
    name: 'Rafiqul Islam',
    phone: '01711000000',
    vehicles: [
        { id: 'V1', regNo: 'Dhaka Metro Ha-12-3490', model: 'Yamaha FZ-S V3', lastService: '2024-01-15' }
    ]
};

export const useCustomerStore = create<CustomerState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            customer: null,
            serviceRequests: [],

            login: async (phone, otp) => {
                // Mock API call
                return new Promise((resolve) => {
                    setTimeout(() => {
                        if (otp.length === 4) {
                            set({ isAuthenticated: true, customer: { ...MOCK_CUSTOMER, phone } });
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }, 1000);
                });
            },

            register: async (data) => {
                // Mock API call
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const newCustomer: Customer = {
                            id: 'C' + Math.random().toString(36).substr(2, 9),
                            name: data.name,
                            phone: data.phone,
                            vehicles: [
                                { id: 'V' + Math.random(), regNo: data.vehicleRegNo, model: data.vehicleModel }
                            ]
                        };
                        set({ isAuthenticated: true, customer: newCustomer });
                        resolve(true);
                    }, 1000);
                });
            },

            logout: () => set({ isAuthenticated: false, customer: null }),

            requestService: (vehicleId, complaint) => {
                const newRequest: ServiceRequest = {
                    id: 'SR' + Math.random().toString(36).substr(2, 5).toUpperCase(),
                    vehicleId,
                    complaint,
                    status: 'pending',
                    date: new Date().toISOString()
                };
                set((state) => ({ serviceRequests: [newRequest, ...state.serviceRequests] }));
            }
        }),
        {
            name: 'customer-storage',
        }
    )
);
