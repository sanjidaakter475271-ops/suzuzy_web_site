import { create } from 'zustand';
import { Appointment } from '@/types/service-admin/index';
import { MOCK_APPOINTMENTS } from '@/constants/service-admin/appointmentData';

interface AppointmentState {
    appointments: Appointment[];
    isLoading: boolean;
    error: string | null;
    fetchAppointments: (filters?: { date?: string, status?: string }) => Promise<void>;
    addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'customerName' | 'customerPhone' | 'vehicleRegNo' | 'vehicleModel'>) => Promise<void>;
    updateStatus: (id: string, status: Appointment['status']) => Promise<void>;
    reschedule: (id: string, date: string, time: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
    appointments: [],
    isLoading: false,
    error: null,

    fetchAppointments: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const query = new URLSearchParams();
            if (filters?.date) query.append('date', filters.date);
            if (filters?.status) query.append('status', filters.status);

            const res = await fetch(`/api/v1/workshop/appointments?${query.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch appointments');
            const { data } = await res.json();
            set({ appointments: data, isLoading: false });
        } catch (error: any) {
            console.error('fetchAppointments error:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    addAppointment: async (appointmentData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch('/api/v1/workshop/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData),
            });
            if (!res.ok) throw new Error('Failed to create appointment');
            const { data } = await res.json();
            set((state) => ({ appointments: [...state.appointments, data], isLoading: false }));
        } catch (error: any) {
            console.error('addAppointment error:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    updateStatus: async (id, status) => {
        set((state) => ({
            appointments: state.appointments.map((apt) => apt.id === id ? { ...apt, status } : apt)
        }));
        try {
            await fetch(`/api/v1/workshop/appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            console.error('updateStatus error:', error);
            // Optional: rollback on error
        }
    },

    reschedule: async (id, date, time) => {
        set((state) => ({
            appointments: state.appointments.map((apt) => apt.id === id ? { ...apt, date, time, status: 'scheduled' } : apt)
        }));
        try {
            await fetch(`/api/v1/workshop/appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, time, status: 'scheduled' }),
            });
        } catch (error) {
            console.error('reschedule error:', error);
        }
    },
}));
