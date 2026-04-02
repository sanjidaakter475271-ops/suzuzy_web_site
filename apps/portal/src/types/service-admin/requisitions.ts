export interface RequisitionItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}

export interface RequisitionGroup {
    id: string; // requisition_group_id
    jobCardId: string;
    jobNumber: string;
    technicianId: string;
    technicianName: string;
    technicianAvatar?: string;
    customerName: string;
    customerId?: string;
    problemType: string;
    status: 'pending' | 'approved' | 'rejected' | 'issued';
    items: RequisitionItem[];
    createdAt: string;
    updatedAt: string;
    totalAmount: number;
    rating?: number;
    invoiceAmount?: number;
}
