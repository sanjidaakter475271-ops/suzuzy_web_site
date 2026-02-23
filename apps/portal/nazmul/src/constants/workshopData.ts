import { JobCard, Technician, ServiceType, QCChecklistItem, Ramp } from '../types/workshop';

export const MOCK_TECHNICIANS: Technician[] = [
    { id: 'T1', name: 'Rafiq Ahmed', avatar: 'https://i.pravatar.cc/150?u=T1', activeJobs: 2, capacity: 5, status: 'active' },
    { id: 'T2', name: 'Selim Reza', avatar: 'https://i.pravatar.cc/150?u=T2', activeJobs: 4, capacity: 5, status: 'busy' },
    { id: 'T3', name: 'Kabir Hossain', avatar: 'https://i.pravatar.cc/150?u=T3', activeJobs: 0, capacity: 5, status: 'on-leave' },
    { id: 'T4', name: 'Ariful Islam', avatar: 'https://i.pravatar.cc/150?u=T4', activeJobs: 1, capacity: 5, status: 'active' },
];

export const MOCK_SERVICE_TYPES: ServiceType[] = [
    { id: 'S1', name: 'Engine Noise Diagnosis', laborRate: 650, estimatedTime: '1h' },
    { id: 'S2', name: 'Oil & Filter Change', laborRate: 200, estimatedTime: '30m' },
    { id: 'S3', name: 'Brake Adjustment', laborRate: 150, estimatedTime: '20m' },
    { id: 'S4', name: 'Full Service', laborRate: 1200, estimatedTime: '3h' },
    { id: 'S5', name: 'Chain Lubrication', laborRate: 50, estimatedTime: '10m' },
];

export const MOCK_JOB_CARDS: JobCard[] = [
    {
        id: 'JC0732',
        jobNo: '0732',
        customerId: 'C1',
        customerName: 'Rafiqul Islam',
        customerPhone: '01711000000',
        vehicleId: 'V1',
        vehicleModel: 'Yamaha FZ-S V3',
        vehicleRegNo: 'Dhaka Metro Ha-12-3490',
        complaintChecklist: ['Engine Noise', 'Oil Leak'],
        complaints: 'Engine making rattling noise at high RPMs. Oil leaking near the engine cover.',
        items: [
            { description: 'Engine Noise Diagnosis', status: 'in-progress', cost: 650 },
            { description: 'Leak at Engine Cover', status: 'completed', cost: 200 },
            { description: 'Oil & Filter Change', status: 'pending', cost: 1650 },
        ],
        status: 'in-service',
        assignedTechnicianId: 'T1',
        laborCost: 650,
        partsCost: 1850,
        discount: 0,
        total: 2500,
        warrantyType: 'paid',
        createdAt: '2024-04-20T10:00:00Z',
        updatedAt: '2024-04-24T14:30:00Z',
    },
    {
        id: 'JC0733',
        jobNo: '0733',
        customerId: 'C2',
        customerName: 'Md. Rahim',
        customerPhone: '01811000000',
        vehicleId: 'V2',
        vehicleModel: 'Suzuki Gixxer SF',
        vehicleRegNo: 'Chatta Metro La-22-1982',
        complaintChecklist: ['Brake Issue'],
        complaints: 'Brake not working properly.',
        items: [
            { description: 'Brake Pad Replacement', status: 'completed', cost: 800, qty: 1, unit: 'pair' },
        ],
        status: 'qc-done',
        assignedTechnicianId: 'T2',
        laborCost: 300,
        partsCost: 800,
        discount: 50,
        total: 1050,
        warrantyType: 'warranty',
        createdAt: '2024-04-23T09:00:00Z',
        updatedAt: '2024-04-24T11:00:00Z',
    },
];

export const QC_CHECKLIST_TEMPLATE: QCChecklistItem[] = [
    { id: 'QC1', label: 'Engine Oil Level Checked', checked: false },
    { id: 'QC2', label: 'Brake Performance Verified', checked: false },
    { id: 'QC3', label: 'Tire Pressure Checked', checked: false },
    { id: 'QC4', label: 'Lights & Indicators Working', checked: false },
    { id: 'QC5', label: 'Chain Tension Adjusted', checked: false },
    { id: 'QC6', label: 'Test Ride Completed', checked: false },
];

export const MOCK_RAMPS: Ramp[] = [
    { id: 'R1', name: 'Ramp-01', status: 'occupied', dedicatedTechnicianId: 'T1', assignedTechnicianId: 'T1', currentJobCardId: 'JC0732', vehicleRegNo: 'Dhaka Metro H-12-3490' },
    { id: 'R2', name: 'Ramp-02', status: 'available', dedicatedTechnicianId: 'T4', assignedTechnicianId: 'T4' },
    { id: 'R3', name: 'Ramp-03', status: 'occupied', dedicatedTechnicianId: 'T2', assignedTechnicianId: 'T2', currentJobCardId: 'JC0733', vehicleRegNo: 'Chatta Metro L-22-1982' },
    { id: 'R4', name: 'Ramp-04', status: 'maintenance', dedicatedTechnicianId: 'T3' },
    { id: 'R5', name: 'Ramp-05', status: 'available', dedicatedTechnicianId: 'T1' },
    { id: 'R6', name: 'Ramp-06', status: 'available', dedicatedTechnicianId: 'T2' },
    { id: 'R7', name: 'Ramp-07', status: 'occupied', dedicatedTechnicianId: 'T1', assignedTechnicianId: 'T1', currentJobCardId: 'JC0732', vehicleRegNo: 'Dhaka Metro Ha-33-0012' },
    { id: 'R8', name: 'Ramp-08', status: 'available', dedicatedTechnicianId: 'T4' },
    { id: 'R9', name: 'Ramp-09', status: 'available', dedicatedTechnicianId: 'T3' },
    { id: 'R10', name: 'Express Bay', status: 'available', dedicatedTechnicianId: 'T1' },
];
