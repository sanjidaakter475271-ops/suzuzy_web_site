import { create } from 'zustand';
import { Customer, Vehicle } from '@/types/service-admin/index';
import { Complaint, ReminderLog } from '@/types/service-admin/crm';

interface CRMState {
    customers: Customer[];
    vehicles: Vehicle[];
    complaints: Complaint[];
    reminderLogs: ReminderLog[];
    addCustomer: (customer: Customer) => void;
    addVehicle: (vehicle: Vehicle) => void;
    addComplaint: (complaint: Complaint) => void;
    logReminder: (log: ReminderLog) => void;
}

export const useCRMStore = create<CRMState>((set) => ({
    customers: [],
    vehicles: [],
    complaints: [],
    reminderLogs: [],
    addCustomer: (c) => set((state) => ({ customers: [c, ...state.customers] })),
    addVehicle: (v) => set((state) => ({ vehicles: [v, ...state.vehicles] })),
    addComplaint: (c) => set((state) => ({ complaints: [c, ...state.complaints] })),
    logReminder: (l) => set((state) => ({ reminderLogs: [l, ...state.reminderLogs] })),
}));
