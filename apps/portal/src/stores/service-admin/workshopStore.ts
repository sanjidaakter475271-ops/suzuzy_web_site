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
    addTechnician: (data: Partial<Technician>) => Promise<void>;
    deleteTechnician: (id: string) => Promise<void>;
    addRamp: (data: Partial<Ramp>) => Promise<void>;
    deleteJobCard: (id: string) => Promise<void>;
    addServiceTask: (jobCardId: string, description: string, cost: number) => Promise<void>;
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
            const res = await fetch('/api/v1/workshop/overview');
            const result = await res.json();

            if (!result.success) throw new Error(result.error || "Failed to fetch data");

            const { jobCards: cardsRaw, ramps: rampsRaw, staff, serviceTasks } = result.data;

            // 1. Map Service Types
            const serviceTypes: ServiceType[] = serviceTasks.map((t: any) => ({
                id: t.id,
                name: t.name,
                laborRate: Number(t.rate) || 0,
                estimatedTime: t.estimated_hours ? `${t.estimated_hours}h` : '1h'
            }));

            // 2. Map Technicians
            const technicians: Technician[] = staff.map((s: any) => ({
                id: s.id,
                name: s.name,
                avatar: s.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`,
                activeJobs: cardsRaw.filter((c: any) => c.technician_id === s.id && c.status === 'in_progress').length,
                capacity: 5,
                status: s.status === 'active' || s.status === 'approved' ? 'active' : s.status === 'pending' ? 'pending' : 'busy'
            }));

            // 3. Map Job Cards
            const jobCards: JobCard[] = cardsRaw.map((card: any) => {
                const ticket = card.service_tickets;
                const vehicle = ticket?.service_vehicles;
                const customer = ticket?.profiles;
                const assignedRamp = rampsRaw.find((r: any) => r.current_ticket_id === card.ticket_id);

                return {
                    id: card.id,
                    ticketId: card.ticket_id,
                    jobNo: ticket?.service_number || 'J-' + card.id.substr(0, 4),
                    customerId: customer?.id || '',
                    customerName: customer?.full_name || 'Unknown',
                    customerPhone: customer?.phone || ticket?.service_vehicles?.phone_number || '',
                    customerAddress: ticket?.service_vehicles?.district_city || '',
                    vehicleId: vehicle?.id || '',
                    vehicleModel: vehicle?.bike_models?.name || 'Unknown Model',
                    vehicleRegNo: vehicle?.engine_number || 'Unknown',
                    complaints: ticket?.service_description || '',
                    complaintChecklist: [],
                    items: card.service_tasks?.map((t: any) => ({
                        description: t.name || 'Additional Task',
                        status: t.status || 'pending',
                        cost: Number(t.description?.replace('Cost: ', '') || 0)
                    })) || [],
                    requisitions: card.service_requisitions?.map((r: any) => ({
                        id: r.id,
                        description: r.products?.name || 'Unknown Part',
                        qty: r.quantity,
                        status: r.status,
                        cost: Number(r.total_price || 0)
                    })) || [],
                    status: mapJobStatus(card.status),
                    assignedTechnicianId: card.technician_id,
                    assignedRampId: assignedRamp?.id,
                    laborCost: 0,
                    partsCost: card.service_requisitions?.reduce((acc: number, r: any) => acc + Number(r.total_price || 0), 0) || 0,
                    discount: 0,
                    total: (card.service_tasks?.reduce((acc: number, t: any) => acc + Number(t.rate || 0), 0) || 0) +
                        (card.service_requisitions?.reduce((acc: number, r: any) => acc + Number(r.total_price || 0), 0) || 0),
                    warrantyType: 'paid',
                    createdAt: card.created_at,
                    updatedAt: card.updated_at
                };
            });

            // 4. Map Ramps
            const ramps: Ramp[] = rampsRaw.map((ramp: any) => {
                const ticket = ramp.service_tickets_service_ramps_current_ticket_idToservice_tickets;
                const card = cardsRaw.find((c: any) => c.ticket_id === ramp.current_ticket_id);

                return {
                    id: ramp.id,
                    name: `Ramp-${ramp.ramp_number}`,
                    status: ramp.status === 'idle' ? 'available' : ramp.status,
                    dedicatedTechnicianId: ramp.staff_id,
                    currentJobCardId: card?.id,
                    assignedTechnicianId: ramp.staff_id,
                    vehicleRegNo: ticket?.service_vehicles?.engine_number
                };
            });

            set({ jobCards, technicians, ramps, serviceTypes, isLoading: false });

        } catch (error: any) {
            console.error("Workshop fetch error:", error);
            set({ error: error.message, isLoading: false });
        }
    },

    addJobCard: async (jobCard: any) => {
        set({ isLoading: true });
        try {
            // Option B: Send full data chain
            const payload = {
                customer_name: jobCard.customerName,
                customer_phone: jobCard.customerPhone,
                customer_address: jobCard.customerAddress,
                vehicle_reg_no: jobCard.vehicleRegNo,
                vehicle_model: jobCard.vehicleModel,
                vehicle_chassis_no: jobCard.chassisNo,
                vehicle_mileage: jobCard.vehicleMileage,
                service_type: jobCard.serviceType,
                complaints: jobCard.complaints,
                custom_complaint: jobCard.customComplaint,
                estimated_completion: jobCard.estimatedCompletion,
                ramp_id: jobCard.assignedRampId,
                technician_id: jobCard.assignedTechnicianId
            };

            const res = await fetch('/api/v1/workshop/create-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create job card');
            }

            await get().fetchWorkshopData(); // Refresh all to include new data
        } catch (error: any) {
            console.error("Add Job Error:", error);
            set({ error: error.message, isLoading: false });
            throw error;
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

            // Sync with server for full data consistency (like updatedAt)
            await get().fetchWorkshopData();
        } catch (error: any) {
            console.error(error);
        }
    },

    deleteJobCard: async (id: string) => {
        try {
            const res = await fetch(`/api/v1/job_cards/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete job card');

            // Remove from local state
            set(state => ({
                jobCards: state.jobCards.filter(c => c.id !== id)
            }));
        } catch (error: any) {
            console.error('[DELETE_JOB_CARD_ERROR]', error);
            throw error;
        }
    },

    addServiceTask: async (jobCardId: string, description: string, cost: number) => {
        try {
            const res = await fetch(`/api/v1/workshop/jobs/${jobCardId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_name: description, cost, is_checked: false }),
            });
            if (!res.ok) throw new Error('Failed to add task');

            await get().fetchWorkshopData(); // Refetch to update data
        } catch (error: any) {
            console.error('[ADD_TASK_ERROR]', error);
            throw error;
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
    },

    addTechnician: async (data: any) => {
        try {
            const res = await fetch('/api/v1/service_staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to add technician');
            await get().fetchWorkshopData();
        } catch (error: any) {
            console.error(error);
            set({ error: error.message });
        }
    },

    deleteTechnician: async (id: string) => {
        try {
            const res = await fetch(`/api/v1/service_staff/${id}`, {
                method: 'PATCH', // Using PATCH for soft delete or PUT/DELETE if supported
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: false })
            });
            if (!res.ok) throw new Error('Failed to delete technician');
            await get().fetchWorkshopData();
        } catch (error: any) {
            console.error(error);
            set({ error: error.message });
        }
    },

    addRamp: async (data: any) => {
        try {
            const res = await fetch('/api/v1/service_ramps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ramp_number: get().ramps.length + 1,
                    status: 'idle',
                    ...data
                })
            });
            if (!res.ok) throw new Error('Failed to add ramp');
            await get().fetchWorkshopData();
        } catch (error: any) {
            console.error(error);
            set({ error: error.message });
        }
    }
}));
