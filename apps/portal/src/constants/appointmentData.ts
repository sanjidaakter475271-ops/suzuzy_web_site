import { Appointment } from '../types/index';

export const MOCK_APPOINTMENTS: Appointment[] = [];

export const SERVICE_REMINDERS_SETTINGS = {
    smsEnabled: true,
    whatsappEnabled: true,
    reminderBeforeHours: 24,
    templates: {
        sms: "Reminder: Your service appointment for {vehicle} is tomorrow at {time}. - Royal Consortium",
        whatsapp: "Hello {customer}, this is a reminder for your upcoming service appointment for {vehicle} on {date} at {time}. Please arrive 10 mins early."
    }
};
