import { create } from 'zustand';
import { RequisitionGroup } from '@/types/service-admin/requisitions';

interface RequisitionsState {
    requisitions: RequisitionGroup[];
    isLoading: boolean;
    error: string | null;
    pendingCount: number;

    fetchRequisitions: (status?: string) => Promise<void>;
    approveRequisitionGroup: (groupId: string) => Promise<void>;
    rejectRequisitionGroup: (groupId: string, reason: string) => Promise<void>;
    approveRequisitionItem: (id: string) => Promise<void>;
    rejectRequisitionItem: (id: string, reason: string) => Promise<void>;
}

export const useRequisitionsStore = create<RequisitionsState>((set, get) => ({
    requisitions: [],
    isLoading: false,
    error: null,
    pendingCount: 0,

    fetchRequisitions: async (status) => {
        set({ isLoading: true, error: null });
        try {
            const query = status ? `?status=${status}` : '';
            const res = await fetch(`/api/v1/workshop/requisitions${query}`);
            const result = await res.json();

            if (!result.success) throw new Error(result.error);

            // Grouping logic (in case the API doesn't group them yet)
            const rawData = result.data;
            const groups: Record<string, RequisitionGroup> = {};

            rawData.forEach((item: any) => {
                const groupId = item.requisition_group_id || `ungrouped-${item.id}`;
                if (!groups[groupId]) {
                    groups[groupId] = {
                        id: groupId,
                        jobCardId: item.job_card_id,
                        jobNumber: item.job_cards?.service_tickets?.service_number || 'N/A',
                        technicianId: item.staff_id,
                        technicianName: item.service_staff?.profiles?.full_name || 'Unknown',
                        technicianAvatar: item.service_staff?.profiles?.avatar_url,
                        status: item.status,
                        items: [],
                        createdAt: item.created_at,
                        updatedAt: item.updated_at,
                        totalAmount: 0
                    };
                }

                groups[groupId].items.push({
                    id: item.id,
                    productId: item.product_id,
                    productName: item.products?.name || 'Unknown Item',
                    quantity: item.quantity,
                    unitPrice: Number(item.unit_price || 0),
                    totalPrice: Number(item.total_price || 0),
                    notes: item.notes
                });

                groups[groupId].totalAmount += Number(item.total_price || 0);
            });

            const requisitionList = Object.values(groups).sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            set({
                requisitions: requisitionList,
                isLoading: false,
                pendingCount: requisitionList.filter(r => r.status === 'pending').length
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    approveRequisitionGroup: async (groupId) => {
        const { requisitions } = get();
        const group = requisitions.find(r => r.id === groupId);
        if (!group) return;

        try {
            for (const item of group.items) {
                const res = await fetch(`/api/v1/workshop/requisitions/${item.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'approved' })
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error || `Failed to approve item ${item.id}`);
            }
            await get().fetchRequisitions();
        } catch (error: any) {
            alert(`Batch approve failed: ${error.message}`);
        }
    },

    rejectRequisitionGroup: async (groupId, reason) => {
        const { requisitions } = get();
        const group = requisitions.find(r => r.id === groupId);
        if (!group) return;

        try {
            for (const item of group.items) {
                const res = await fetch(`/api/v1/workshop/requisitions/${item.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'rejected', reason })
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error || `Failed to reject item ${item.id}`);
            }
            await get().fetchRequisitions();
        } catch (error: any) {
            alert(`Batch reject failed: ${error.message}`);
        }
    },

    approveRequisitionItem: async (id) => {
        try {
            const res = await fetch(`/api/v1/workshop/requisitions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await get().fetchRequisitions();
        } catch (error: any) {
            alert(error.message);
        }
    },

    rejectRequisitionItem: async (id, reason) => {
        try {
            const res = await fetch(`/api/v1/workshop/requisitions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected', reason })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await get().fetchRequisitions();
        } catch (error: any) {
            alert(error.message);
        }
    }
}));
