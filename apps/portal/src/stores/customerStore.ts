
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
                // To be implemented with actual API
                return false;
            },

            register: async (data) => {
                // To be implemented with actual API
                return false;
            },

            logout: () => set({ isAuthenticated: false, customer: null }),

            requestService: (vehicleId, complaint) => {
                // To be implemented
            }
        }),
        {
            name: 'customer-storage',
        }
    )
);
