export interface JobCard {
    id: string;
    jobNo: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    vehicleId: string;
    vehicleModel: string;
    vehicleRegNo: string;
    chassisNo?: string;
    complaints: string;
    complaintChecklist: string[];
    assignedRampId?: string;
    photos?: string[];
    items: JobCardItem[];
    status: 'received' | 'in-diagnosis' | 'waiting-parts' | 'in-service' | 'qc-done' | 'ready' | 'delivered';
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
    unit?: string;
}

export interface Technician {
    id: string;
    name: string;
    avatar: string;
    activeJobs: number;
    capacity: number;
    status: 'active' | 'on-leave' | 'busy';
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
