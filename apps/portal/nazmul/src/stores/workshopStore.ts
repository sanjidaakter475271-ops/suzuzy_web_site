import { create } from 'zustand';
import { JobCard, Technician, ServiceType, Ramp } from '../types/workshop';
import { MOCK_JOB_CARDS, MOCK_TECHNICIANS, MOCK_SERVICE_TYPES, MOCK_RAMPS } from '../constants/workshopData';

interface WorkshopState {
    jobCards: JobCard[];
    technicians: Technician[];
    serviceTypes: ServiceType[];
    ramps: Ramp[];
    addJobCard: (jobCard: JobCard) => void;
    updateJobCardStatus: (id: string, status: JobCard['status']) => void;
    assignTechnician: (jobCardId: string, technicianId: string) => void;
    updateJobCardItems: (id: string, items: JobCard['items']) => void;
    updateRampStatus: (rampId: string, status: Ramp['status']) => void;
    assignJobToRamp: (rampId: string, jobCardId: string, technicianId: string, vehicleRegNo: string) => void;
    releaseRamp: (rampId: string) => void;
    autoAssignRamp: (jobCardId: string) => void;
}

export const useWorkshopStore = create<WorkshopState>((set) => ({
    jobCards: MOCK_JOB_CARDS,
    technicians: MOCK_TECHNICIANS,
    serviceTypes: MOCK_SERVICE_TYPES,
    ramps: MOCK_RAMPS,
    addJobCard: (jobCard) => set((state) => ({ jobCards: [jobCard, ...state.jobCards] })),
    updateJobCardStatus: (id, status) => set((state) => ({
        jobCards: state.jobCards.map((jc) => jc.id === id ? { ...jc, status, updatedAt: new Date().toISOString() } : jc)
    })),
    assignTechnician: (jobCardId, technicianId) => set((state) => ({
        jobCards: state.jobCards.map((jc) => jc.id === jobCardId ? { ...jc, assignedTechnicianId: technicianId } : jc)
    })),
    updateJobCardItems: (id, items) => set((state) => ({
        jobCards: state.jobCards.map((jc) => jc.id === id ? { ...jc, items, updatedAt: new Date().toISOString() } : jc)
    })),
    updateRampStatus: (rampId, status) => set((state) => ({
        ramps: state.ramps.map((r) => r.id === rampId ? { ...r, status } : r)
    })),
    assignJobToRamp: (rampId, jobCardId, technicianId, vehicleRegNo) => set((state) => ({
        ramps: state.ramps.map((r) => r.id === rampId ? {
            ...r,
            status: 'occupied',
            currentJobCardId: jobCardId,
            assignedTechnicianId: technicianId,
            vehicleRegNo
        } : r)
    })),
    releaseRamp: (rampId) => set((state) => ({
        ramps: state.ramps.map((r) => r.id === rampId ? {
            ...r,
            status: 'available',
            currentJobCardId: undefined,
            assignedTechnicianId: undefined,
            vehicleRegNo: undefined
        } : r)
    })),
    autoAssignRamp: (jobCardId) => set((state) => {
        const availableRamp = state.ramps.find(r => r.status === 'available');
        const jobCard = state.jobCards.find(jc => jc.id === jobCardId);

        if (availableRamp && jobCard) {
            // Assign to the ramp's dedicated technician
            const technicianId = availableRamp.dedicatedTechnicianId;

            return {
                ramps: state.ramps.map(r => r.id === availableRamp.id ? {
                    ...r,
                    status: 'occupied',
                    currentJobCardId: jobCardId,
                    assignedTechnicianId: technicianId,
                    vehicleRegNo: jobCard.vehicleRegNo
                } : r),
                jobCards: state.jobCards.map(jc => jc.id === jobCardId ? {
                    ...jc,
                    assignedRampId: availableRamp.id,
                    assignedTechnicianId: technicianId,
                    status: 'received'
                } : jc)
            };
        }
        return state;
    }),
}));
