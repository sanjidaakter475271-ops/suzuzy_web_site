import { Customer, Vehicle } from './index';

export interface Complaint {
    id: string;
    customerId: string;
    vehicleId: string;
    jobCardId?: string;
    description: string;
    date: string;
    status: 'open' | 'resolved';
}

export interface ReminderLog {
    id: string;
    customerId: string;
    type: 'sms' | 'whatsapp';
    message: string;
    sentAt: string;
    status: 'sent' | 'failed' | 'delivered';
}

export interface CustomerHistory {
    customerId: string;
    jobCards: string[];
    appointments: string[];
    totalSpent: number;
}
