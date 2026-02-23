import { create } from 'zustand';
import { JobCard, Technician, ServiceType, Ramp } from '@/types/service-admin/workshop';

// Helper to map API status to Frontend status
const mapJobStatus = (status: string): JobCard['status'] => {
    const map: Record<string, JobCard['status']> = {
        'pending': 'received',
        'in_progress': 'in-service',
        'completed': 'qc-done',
        'delivered': 'delivered',
        'waiting_parts': 'waiting-parts'
    };
    return map[status] || 'received';
};

interface WorkshopState {
    jobCards: JobCard[];
    technicians: Technician[];
    serviceTypes: ServiceType[];
    ramps: Ramp[];
    isLoading: boolean;
    error: string | null;

    fetchWorkshopData: () => Promise<void>;
    addJobCard: (jobCard: Partial<JobCard>) => Promise<void>;
    updateJobCardStatus: (id: string, status: JobCard['status']) => Promise<void>;
    assignTechnician: (jobCardId: string, technicianId: string) => Promise<void>;
    updateRampStatus: (rampId: string, status: Ramp['status']) => Promise<void>;
    assignJobToRamp: (rampId: string, jobCardId: string, technicianId: string) => Promise<void>;
    releaseRamp: (rampId: string) => Promise<void>;
    autoAssignRamp: (jobCardId: string) => Promise<void>;
    updateJobCardItems: (id: string, items: any[]) => Promise<void>;
    approveTechnician: (id: string) => Promise<void>;
}

export const useWorkshopStore = create<WorkshopState>((set, get) => ({
    jobCards: [],
    technicians: [],
    serviceTypes: [],
    ramps: [],
    isLoading: false,
    error: null,

    fetchWorkshopData: async () => {
        set({ isLoading: true, error: null });
        try {
            // Fetch all necessary entities
            const [cardsRes, ticketsRes, rampsRes, staffRes, tasksRes] = await Promise.all([
                fetch('/api/v1/job_cards?limit=100').then(r => r.json()),
                fetch('/api/v1/service_tickets?limit=100').then(r => r.json()),
                fetch('/api/v1/service_ramps?limit=100').then(r => r.json()),
                fetch('/api/v1/service_staff?limit=100').then(r => r.json()),
                fetch('/api/v1/service_tasks?limit=100').then(r => r.json())
            ]);

            const tickets = ticketsRes.success ? ticketsRes.data : [];
            const staff = staffRes.success ? staffRes.data : [];
            const rampsRaw = rampsRes.success ? rampsRes.data : [];
            const cardsRaw = cardsRes.success ? cardsRes.data : [];
            const tasksRaw = tasksRes.success ? tasksRes.data : [];

            // Map Service Types (Tasks)
            const serviceTypes: ServiceType[] = tasksRaw.map((t: any) => ({
                id: t.id,
                name: t.name,
                laborRate: Number(t.rate) || 0,
                estimatedTime: t.estimated_hours ? `${t.estimated_hours}h` : '1h'
            }));

            // Map Technicians
            const technicians: Technician[] = staff.map((s: any) => ({
                id: s.id,
                name: s.name,
                avatar: s.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`,
                activeJobs: cardsRaw.filter((c: any) => c.technician_id === s.id && c.status === 'in_progress').length,
                capacity: 5,
                status: s.status === 'active' || s.status === 'approved' ? 'active' : s.status === 'pending' ? 'pending' : 'busy'
            }));

            // Map Job Cards
            const jobCards: JobCard[] = cardsRaw.map((card: any) => {
                const ticket = tickets.find((t: any) => t.id === card.ticket_id);
                const vehicle = ticket?.service_vehicles;
                const customer = ticket?.profiles;

                // Find assigned ramp
                const assignedRamp = rampsRaw.find((r: any) => r.current_ticket_id === card.ticket_id);

                return {
                    id: card.id,
                    ticketId: card.ticket_id,
                    jobNo: ticket?.service_number || 'J-' + card.id.substr(0, 4),
                    customerId: customer?.id || '',
                    customerName: customer?.full_name || 'Unknown',
                    customerPhone: customer?.phone || '',
                    vehicleId: vehicle?.id || '',
                    vehicleModel: vehicle?.bike_models?.name || 'Unknown Model',
                    vehicleRegNo: vehicle?.engine_number || 'Unknown',
                    complaints: ticket?.service_description || '',
                    complaintChecklist: [],
                    items: [], // Tasks are usually seperate
                    status: mapJobStatus(card.status),
                    assignedTechnicianId: card.technician_id,
                    assignedRampId: assignedRamp?.id,
                    laborCost: 0,
                    partsCost: 0,
                    discount: 0,
                    total: 0,
                    warrantyType: 'paid',
                    createdAt: card.created_at,
                    updatedAt: card.updated_at
                };
            });

            // Map Ramps
            const ramps: Ramp[] = rampsRaw.map((ramp: any) => ({
                id: ramp.id,
                name: `Ramp-${ramp.ramp_number}`,
                status: ramp.status === 'idle' ? 'available' : ramp.status,
                dedicatedTechnicianId: ramp.staff_id,
                currentJobCardId: undefined, // Filled below
                assignedTechnicianId: ramp.staff_id // Default to dedicated
            }));

            // Fix Ramp job card mapping
            ramps.forEach(r => {
                const rampRaw = rampsRaw.find((raw: any) => raw.id === r.id);
                if (rampRaw?.current_ticket_id) {
                    const card = cardsRaw.find((c: any) => c.ticket_id === rampRaw.current_ticket_id);
                    if (card) r.currentJobCardId = card.id;

                    const ticket = tickets.find((t: any) => t.id === rampRaw.current_ticket_id);
                    if (ticket?.service_vehicles) {
                        r.vehicleRegNo = ticket.service_vehicles.engine_number;
                    }
                }
            });

            set({ jobCards, technicians, ramps, serviceTypes, isLoading: false });

        } catch (error: any) {
            console.error("Workshop fetch error:", error);
            set({ error: error.message, isLoading: false });
        }
    },

    addJobCard: async (jobCard) => {
        set({ isLoading: true });
        try {
            // Assume jobCard has ticketId
            const payload = {
                ticket_id: jobCard.ticketId,
                technician_id: jobCard.assignedTechnicianId,
                status: 'pending',
                notes: jobCard.complaints
            };

            const res = await fetch('/api/v1/job_cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to create job card');

            await get().fetchWorkshopData(); // Refresh all
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    updateJobCardStatus: async (id, status) => {
        // Map frontend status to backend status
        const map: Record<string, string> = {
            'received': 'pending',
            'in-diagnosis': 'running', // Example
            'in-service': 'in_progress',
            'qc-done': 'completed',
            'delivered': 'delivered',
            'waiting-parts': 'waiting_parts'
        };
        const backendStatus = map[status] || status;

        try {
            await fetch(`/api/v1/job_cards/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: backendStatus })
            });

            // Optimistic Update
            set(state => ({
                jobCards: state.jobCards.map(c => c.id === id ? { ...c, status } : c)
            }));
        } catch (error: any) {
            console.error(error);
        }
    },

    assignTechnician: async (jobCardId, technicianId) => {
        try {
            await fetch(`/api/v1/job_cards/${jobCardId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ technician_id: technicianId })
            });

            set(state => ({
                jobCards: state.jobCards.map(c => c.id === jobCardId ? { ...c, assignedTechnicianId: technicianId } : c)
            }));
        } catch (error: any) {
            console.error(error);
        }
    },

    updateRampStatus: async (rampId, status) => {
        // Map available -> idle, occupied -> occupied
        const backendStatus = status === 'available' ? 'idle' : status.toLowerCase();
        try {
            await fetch(`/api/v1/service_ramps/${rampId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: backendStatus })
            });
            await get().fetchWorkshopData();
        } catch (error: any) {
            console.error(error);
        }
    },

    assignJobToRamp: async (rampId, jobCardId, technicianId) => {
        const job = get().jobCards.find(j => j.id === jobCardId);
        if (!job || !job.ticketId) return;

        try {
            await fetch(`/api/v1/service_ramps/${rampId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_ticket_id: job.ticketId,
                    status: 'occupied',
                    technician_name: 'Unknown', // Ideally fetch name
                    // staff_id: technicianId // update dedicated tech? maybe not
                })
            });

            await get().fetchWorkshopData();
        } catch (error: any) {
            console.error(error);
        }
    },

    releaseRamp: async (rampId) => {
        try {
            await fetch(`/api/v1/service_ramps/${rampId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_ticket_id: null,
                    status: 'idle'
                })
            });
            await get().fetchWorkshopData();
        } catch (error: any) {
            console.error(error);
        }
    },

    autoAssignRamp: async (jobCardId) => {
        // Find first available ramp
        const ramp = get().ramps.find(r => r.status === 'available');
        if (ramp) {
            // Find job
            const job = get().jobCards.find(j => j.id === jobCardId);
            if (job) {
                await get().assignJobToRamp(ramp.id, jobCardId, job.assignedTechnicianId || '');
            }
        }
    },

    updateJobCardItems: async (id, items) => {
        // Implementation for updating items in job card
        // This could involve multiple API calls depending on your schema
        set(state => ({
            jobCards: state.jobCards.map(c => c.id === id ? { ...c, items } : c)
        }));
    },

    approveTechnician: async (id) => {
        try {
            // 1. Get staff record to find profile_id
            const staff = get().technicians.find(t => t.id === id);

            // 2. Update service_staff status
            const res = await fetch(`/api/v1/service_staff/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            if (!res.ok) throw new Error('Failed to approve technician');

            // 3. Update linked profile status if exists
            const staffData = await res.json();
            const profileId = staffData.data?.profile_id;

            if (profileId) {
                await fetch(`/api/v1/profiles/${profileId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'active' })
                });
            }

            await get().fetchWorkshopData(); // Refresh list
        } catch (error: any) {
            console.error(error);
            set({ error: error.message });
        }
    }
}));
