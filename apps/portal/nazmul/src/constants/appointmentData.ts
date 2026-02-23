import { Appointment } from '../types/index';

export const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 'APT001',
        customerId: 'C1', // SS ENTERPRISE JAMALPUR
        vehicleId: 'V1', // AB-02-EU-1234
        serviceType: 'Full Service',
        date: '2024-04-25',
        time: '10:00 AM',
        status: 'scheduled',
        token: 101,
    },
    {
        id: 'APT002',
        customerId: 'C2',
        vehicleId: 'V2',
        serviceType: 'Oil Change',
        date: '2024-04-25',
        time: '11:30 AM',
        status: 'scheduled',
        token: 102,
    },
    {
        id: 'APT003',
        customerId: 'C3',
        vehicleId: 'V3',
        serviceType: 'Brake Check',
        date: '2024-04-25',
        time: '02:00 PM',
        status: 'cancelled',
        token: 103,
    },
    {
        id: 'APT004',
        customerId: 'C4',
        vehicleId: 'V4',
        serviceType: 'General Checkup',
        date: '2024-04-26',
        time: '09:00 AM',
        status: 'scheduled',
        token: 201,

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
