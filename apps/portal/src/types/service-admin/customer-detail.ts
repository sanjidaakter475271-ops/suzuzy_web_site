export interface CustomerAddress {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city?: string;
  district?: string;
  division?: string;
  postal_code?: string;
  is_default?: boolean;
}

export interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nid?: string;
  profession?: string;
  dateOfBirth?: string;
  gender?: string;
  permanentAddress?: {
    division?: string;
    district?: string;
    thana?: string;
    postOffice?: string;
    village?: string;
    houseRoad?: string;
  };
  presentAddress?: CustomerAddress;
  vehicles: CustomerVehicle[];
  servicePlans: ServicePlan[];
  totalSpent: number;
  outstandingBalance: number;
  totalServices: number;
  createdAt: string;
}

export interface CustomerVehicle {
  id: string;
  modelName: string;
  chassisNumber: string;
  engineNumber: string;
  regNo?: string;
  color?: string;
  purchaseDate?: string;
  purchaseFrom?: string;
  mileage?: number;
  daysSincePurchase?: number;
  lastServiceDate?: string;
  servicePlan?: ServicePlan;
}

export interface ServicePlan {
  id: string;
  totalFreeServices: number;
  usedFreeServices: number;
  remainingFreeServices: number;
  planType: string;
  isActive: boolean;
}

export interface ServiceHistoryEntry {
  id: string;
  serviceSequence?: number;
  serviceDate: string;
  vehicleName: string;
  vehicleId: string;
  serviceType: string; // "free" | "paid" | "warranty"
  totalCost: number;
  mileage?: number;
  summary?: string;
  nextServiceDueDate?: string;
  nextServiceDueMileage?: number;
  ticketId?: string;
}
