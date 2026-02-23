import { create } from 'zustand';
import { Appointment } from '../types/index';
import { MOCK_APPOINTMENTS } from '../constants/appointmentData';

interface AppointmentState {
    appointments: Appointment[];
    addAppointment: (appointment: Appointment) => void;
    updateStatus: (id: string, status: Appointment['status']) => void;
    reschedule: (id: string, date: string, time: string) => void;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
    appointments: MOCK_APPOINTMENTS,
    addAppointment: (apt) => set((state) => ({ appointments: [...state.appointments, apt] })),
    updateStatus: (id, status) => set((state) => ({
        appointments: state.appointments.map((apt) => apt.id === id ? { ...apt, status } : apt)
    })),
    reschedule: (id, date, time) => set((state) => ({
        appointments: state.appointments.map((apt) => apt.id === id ? { ...apt, date, time, status: 'scheduled' } : apt)
    })),
}));
