import { LucideIcon } from 'lucide-react';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
}

export interface MenuItem {
    title: string;
    icon?: LucideIcon;
    path?: string;
    subItems?: MenuItem[];
    badge?: number;
}

export interface MenuGroup {
    groupTitle: string;
    items: MenuItem[];
}

export interface KPI {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    prefix?: string;
}

export interface Transaction {
    id: string;
    title: string;
    category: string;
    date: string;
    amount: string;
    type: 'income' | 'expense';
    icon?: LucideIcon;
}

export interface FinancialAccount {
    id: string;
    name: string;
    balance: string;
    number: string;
    type: 'savings' | 'checking' | 'credit' | 'investment';
}

export interface ChartData {
    name: string;
    value?: number;
    [key: string]: string | number | undefined;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    type: 'individual' | 'enterprise';
    vehicles: string[];
    notes?: string;
    createdAt: string;
}

export interface Vehicle {
    id: string;
    brand: string;
    model: string;
    regNo: string;
    chassisNo: string;
    mileage: string;
    lastServiceDate?: string;
    ownerId: string;
}

export interface Appointment {
    id: string;
    customerId: string;
    vehicleId: string;
    serviceType: string;
    date: string;
    time: string;
    status: 'scheduled' | 'cancelled' | 'completed' | 'no-show';
    token?: number;
}

export interface OTPRecord {
    id: string;
    type: 'delivery' | 'discount' | 'login';
    phone: string;
    code: string;
    status: 'pending' | 'verified' | 'expired';
    expiresAt: string;
    createdAt: string;
}
