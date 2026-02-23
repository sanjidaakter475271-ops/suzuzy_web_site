import { create } from 'zustand';
import { Customer, Vehicle } from '../types/index';
import { Complaint, ReminderLog } from '../types/crm';
import { MOCK_CUSTOMERS, MOCK_VEHICLES, MOCK_COMPLAINTS, MOCK_REMINDER_LOGS } from '../constants/crmData';

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
    customers: MOCK_CUSTOMERS,
    vehicles: MOCK_VEHICLES,
    complaints: MOCK_COMPLAINTS,
    reminderLogs: MOCK_REMINDER_LOGS,
    addCustomer: (c) => set((state) => ({ customers: [c, ...state.customers] })),
    addVehicle: (v) => set((state) => ({ vehicles: [v, ...state.vehicles] })),
    addComplaint: (c) => set((state) => ({ complaints: [c, ...state.complaints] })),
    logReminder: (l) => set((state) => ({ reminderLogs: [l, ...state.reminderLogs] })),
}));
