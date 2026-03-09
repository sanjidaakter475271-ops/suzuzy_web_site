export interface JobCard {
    id: string;
    ticketId?: string;
    appointmentId?: string;
    jobNo: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    vehicleId: string;
    vehicleModel: string;
    vehicleRegNo: string;
    vehicleMileage?: string;
    chassisNo?: string;
    serviceType?: string;
    complaints: string;
    customComplaint?: string;
    complaintChecklist: string[];
    assignedRampId?: string;
    photos?: string[];
    items: JobCardItem[];
    requisitions?: any[];
    qc_requests?: any[];
    status: 'created' | 'diagnosed' | 'estimate_sent' | 'customer_approved' | 'in_progress' | 'waiting_parts' | 'additional_work' | 'qc_pending' | 'qc_approved' | 'qc_rejected' | 'completed' | 'invoiced' | 'paid' | 'delivered' | 'cancelled';
    assignedTechnicianId?: string;
    laborCost: number;
    partsCost: number;
    discount: number;
    total: number;
    warrantyType: 'paid' | 'warranty' | 'free-service';
    createdAt: string;
    updatedAt: string;
    deliveryOTP?: string;
    estimatedCompletion?: string;
}

export interface JobCardItem {
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    cost: number;
    qty?: number;
    productId?: string;
    requisitionId?: string;
    unit?: string;
}

export interface Technician {
    id: string;
    name: string;
    avatar: string;
    activeJobs: number;
    capacity: number;
    status: 'active' | 'on-leave' | 'busy' | 'pending';
}

export interface QCChecklistItem {
    id: string;
    label: string;
    checked: boolean;
}

export interface ServiceType {
    id: string;
    name: string;
    laborRate: number;
    estimatedTime: string; // e.g. "1h 30m"
}

export interface Ramp {
    id: string;
    name: string;
    status: 'available' | 'occupied' | 'maintenance';
    dedicatedTechnicianId: string;
    assignedTechnicianId?: string;
    currentJobCardId?: string;
    vehicleRegNo?: string;
    startTime?: string;
}
