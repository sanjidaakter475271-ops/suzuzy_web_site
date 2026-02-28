import { JobCard, Technician, ServiceType, QCChecklistItem, Ramp } from '../types/workshop';

export const MOCK_TECHNICIANS: Technician[] = [];
export const MOCK_SERVICE_TYPES: ServiceType[] = [];
export const MOCK_JOB_CARDS: JobCard[] = [];
export const QC_CHECKLIST_TEMPLATE: QCChecklistItem[] = [
    { id: 'QC1', label: 'Engine Oil Level Checked', checked: false },
    { id: 'QC2', label: 'Brake Performance Verified', checked: false },
    { id: 'QC3', label: 'Tire Pressure Checked', checked: false },
    { id: 'QC4', label: 'Lights & Indicators Working', checked: false },
    { id: 'QC5', label: 'Chain Tension Adjusted', checked: false },
    { id: 'QC6', label: 'Test Ride Completed', checked: false },
];
export const MOCK_RAMPS: Ramp[] = [];
