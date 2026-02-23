import { Customer, Vehicle } from '../types/index';
import { Complaint, ReminderLog } from '../types/crm';

export const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'C1',
        name: 'SS ENTERPRISE JAMALPUR',
        phone: '01911247745',
        type: 'enterprise',
        vehicles: ['V1'],
        address: 'Jamalpur Sadar, Mymensingh',
        createdAt: '2023-01-15',
    },
    {
        id: 'C2',
        name: 'Rafiq Ahmed',
        phone: '01712345678',
        email: 'rafiq@gmail.com',
        type: 'individual',
        vehicles: ['V2'],
        address: 'Tangail Road, Elenga',
        createdAt: '2023-03-20',
    },
    {
        id: 'C3',
        name: 'Kabir Hossain',
        phone: '01898765432',
        type: 'individual',
        vehicles: ['V3'],
        createdAt: '2023-05-10',
    }
];

export const MOCK_VEHICLES: Vehicle[] = [
    {
        id: 'V1',
        brand: 'Suzuki',
        model: 'Gixxer SF',
        regNo: 'AB-02-EU-1234',
        chassisNo: 'MD2DSCY1PW12345',
        mileage: '17250 km',
        lastServiceDate: '2024-04-02',
        ownerId: 'C1',
    },
    {
        id: 'V2',
        brand: 'Suzuki',
        model: 'GSX-R 150',
        regNo: 'DHAKA-METRO-LA-55-9988',
        chassisNo: 'MD2DSCY1PW67890',
        mileage: '5400 km',
        lastServiceDate: '2024-03-15',
        ownerId: 'C2',
    },
    {
        id: 'V3',
        brand: 'Suzuki',
        model: 'Hayate',
        regNo: 'TANGAIL-HA-11-2233',
        chassisNo: 'MD2DSCY1PW54321',
        mileage: '12000 km',
        lastServiceDate: '2023-12-01',
        ownerId: 'C3',
    }
];

export const MOCK_COMPLAINTS: Complaint[] = [
    {
        id: 'CMP001',
        customerId: 'C1',
        vehicleId: 'V1',
        description: 'Engine overheating after 50km ride.',
        date: '2024-04-20',
        status: 'resolved',
        jobCardId: 'JC0732'
    },
    {
        id: 'CMP002',
        customerId: 'C2',
        vehicleId: 'V2',
        description: 'Brake noise when stopping suddenly.',
        date: '2024-04-22',
        status: 'open',
    }
];

export const MOCK_REMINDER_LOGS: ReminderLog[] = [
    {
        id: 'LOG001',
        customerId: 'C1',
        type: 'sms',
        message: 'Your service for Gixxer SF is due on April 25th.',
        sentAt: '2024-04-23T10:00:00Z',
        status: 'sent'
    },
    {
        id: 'LOG002',
        customerId: 'C2',
        type: 'whatsapp',
        message: 'Reminder: Appointment at 11:30 AM tomorrow.',
        sentAt: '2024-04-24T09:00:00Z',
        status: 'delivered'
    }
];
