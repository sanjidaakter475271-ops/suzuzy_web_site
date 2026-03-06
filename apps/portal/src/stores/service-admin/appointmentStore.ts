import { create } from 'zustand';
import { Appointment } from '@/types/service-admin/index';

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
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const errorMessage = errData.message || errData.error || errData.details || 'Failed to fetch appointments';
                throw new Error(errorMessage);
            }
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
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to create appointment');
            }
            const { data } = await res.json();
            set((state) => ({ appointments: [...state.appointments, data], isLoading: false }));
            return data;
        } catch (error: any) {
            console.error('addAppointment error:', error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateStatus: async (id, status) => {
        const previousAppointments = get().appointments;

        // Optimistic update
        set((state) => ({
            appointments: state.appointments.map((apt) => apt.id === id ? { ...apt, status } : apt)
        }));

        try {
            const res = await fetch(`/api/v1/workshop/appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update status');
            }

            // Sync with server data (token number might have been assigned)
            const { data } = await res.json();
            set((state) => ({
                appointments: state.appointments.map((apt) => apt.id === id ? data : apt)
            }));
        } catch (error: any) {
            console.error('updateStatus error:', error);
            // Rollback
            set({ appointments: previousAppointments });
            throw error; // Re-throw so component can show error toast
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
