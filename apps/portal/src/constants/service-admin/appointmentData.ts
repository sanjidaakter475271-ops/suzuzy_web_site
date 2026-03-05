import { Appointment } from '@/types/service-admin/index';

export const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 'APT001',
        customerId: 'C1',
        customerName: 'Jamalpur Enterprise',
        customerPhone: '01700000000',
        vehicleId: 'V1',
        vehicleRegNo: 'AB-02-EU-1234',
        vehicleModel: 'Suzuki Gixxer',
        serviceType: 'Full Service',
        source: 'walk_in',
        date: '2024-04-25',
        time: '10:00 AM',
        status: 'scheduled',
        token: 101,
        createdAt: '2024-04-24T10:00:00Z'
    },
    {
        id: 'APT002',
        customerId: 'C2',
        customerName: 'Rakib Hasan',
        customerPhone: '01800000000',
        vehicleId: 'V2',
        vehicleRegNo: 'DHA-01-ME-5678',
        vehicleModel: 'Suzuki GSX-R',
        serviceType: 'Oil Change',
        source: 'online',
        date: '2024-04-25',
        time: '11:30 AM',
        status: 'scheduled',
        token: 102,
        createdAt: '2024-04-24T11:00:00Z'
    },
    {
        id: 'APT003',
        customerId: 'C3',
        customerName: 'Sanjida Akter',
        customerPhone: '01900000000',
        vehicleId: 'V3',
        vehicleRegNo: 'RAJ-03-GA-4321',
        vehicleModel: 'Suzuki Access',
        serviceType: 'Brake Check',
        source: 'phone',
        date: '2024-04-25',
        time: '02:00 PM',
        status: 'cancelled',
        token: 103,
        createdAt: '2024-04-24T12:00:00Z'
    },
    {
        id: 'APT004',
        customerId: 'C4',
        customerName: 'Karim Ullah',
        customerPhone: '01600000000',
        vehicleId: 'V4',
        vehicleRegNo: 'SYL-04-HA-9876',
        vehicleModel: 'Suzuki Burgman',
        serviceType: 'General Checkup',
        source: 'walk_in',
        date: '2024-04-26',
        time: '09:00 AM',
        status: 'scheduled',
        token: 201,
        createdAt: '2024-04-25T09:00:00Z'
    }
];

export const SERVICE_REMINDERS_SETTINGS = {
    smsEnabled: true,
    whatsappEnabled: true,
    reminderBeforeHours: 24,
    templates: {
        sms: "Reminder: Your service appointment for {vehicle} is tomorrow at {time}. - Royal Consortium",
        whatsapp: "Hello {customer}, this is a reminder for your upcoming service appointment for {vehicle} on {date} at {time}. Please arrive 10 mins early."
    }
};
