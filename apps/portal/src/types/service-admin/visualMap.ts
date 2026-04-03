// apps/portal/src/types/service-admin/visualMap.ts

export type RampStatus =
  | 'active'        // কাজ চলছে
  | 'free'          // খালি আছে
  | 'booked'        // বুক করা হয়েছে কিন্তু কাজ শুরু হয়নি
  | 'qc_pending'    // QC এর জন্য অপেক্ষা
  | 'on_break'      // টেকনিশিয়ান ব্রেকে
  | 'maintenance';  // র‍্যাম্প মেরামতে

export type TechnicianStatus =
  | 'working'
  | 'on_break'
  | 'idle'
  | 'absent';

export interface TechnicianOnMap {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  status: TechnicianStatus;
  specialization?: string;
  breakStartedAt?: string | null;
  currentJobId?: string | null;
}

export interface VehicleOnRamp {
  jobCardId: string;
  jobCardNumber: string;
  vehicleRegNo: string;
  vehicleName: string;
  customerName: string;
  customerPhone?: string;
  serviceType: string;
  services: string[];
  estimatedCompletion?: string;
  priority: 'normal' | 'urgent' | 'vip';
}

export interface RampData {
  id: string;
  rampNumber: number;
  rampName: string;
  status: RampStatus;
  position: { row: number; col: number }; // Grid position
  technician: TechnicianOnMap | null;
  vehicle: VehicleOnRamp | null;
  occupiedSince: string | null;   // ISO timestamp
  bookedSince: string | null;
  lastActivityAt: string | null;
  notes?: string;
}

export interface MapStats {
  totalRamps: number;
  activeRamps: number;
  freeRamps: number;
  bookedRamps: number;
  qcPendingRamps: number;
  onBreakRamps: number;
  maintenanceRamps: number;
  totalTechnicians: number;
  workingTechnicians: number;
  idleTechnicians: number;
  onBreakTechnicians: number;
  absentTechnicians: number;
  financePendingCount: number;
  qcQueue: VehicleOnRamp[];       // List of units in QC
  financeQueue: VehicleOnRamp[];  // List of units in Payment
  avgOccupancyMinutes: number;
  longestOccupiedRamp: RampData | null;
}
