'use client';

import { useState, useEffect, useCallback } from 'react';
import { KPI, ChartData, Transaction, FinancialAccount } from '@/types/service-admin';

// ----- API response types -----
interface DashboardKPIs {
    todayTickets: number;
    activeRamps: string;
    techOnDuty: number;
    avgTAT: string;
}

export interface RampData {
    id: string;
    ramp_number: number;
    status: string;
    technician_name: string | null;
    current_ticket: {
        service_number: string;
        vehicle_model: string;
    } | null;
}

export interface QueuedVehicle {
    ticket_id: string;
    service_number: string;
    vehicle_model: string;
    customer_name: string;
    status: string;
    waiting_since: string;
}

export interface CustomerRequest {
    id: string;
    service_number: string;
    service_description: string;
    customer_name: string;
    created_at: string;
}

interface WorkshopPulse {
    activeJobs: number;
    rampUsage: string;
    avgTatMinutes: number;
}

interface APIResponse {
    success: boolean;
    data: {
        kpis: DashboardKPIs;
        ramps: RampData[];
        queuedVehicles: QueuedVehicle[];
        customerRequests: CustomerRequest[];
        revenueData: ChartData[];
        expenseBreakdown: ChartData[];
        transactionVolume: ChartData[];
        workshopPulse: WorkshopPulse;
        recentTransactions: Transaction[];
    };
}

// ----- Transform API kpis object → KPI[] for KPICard -----
function transformKPIs(apiKpis: DashboardKPIs): KPI[] {
    return [
        {
            title: 'Today\'s Tickets',
            value: apiKpis.todayTickets.toLocaleString(),
            change: '',
            isPositive: true,
            prefix: ''
        },
        {
            title: 'Active Ramps',
            value: apiKpis.activeRamps.replace('/', ' / ') || '0',
            change: '',
            isPositive: true,
            prefix: ''
        },
        {
            title: 'Technicians On-Duty',
            value: apiKpis.techOnDuty.toLocaleString(),
            change: '',
            isPositive: true,
            prefix: ''
        },
        {
            title: 'Avg. TAT',
            value: apiKpis.avgTAT === 'N/A' ? '0' : apiKpis.avgTAT.replace('m', ''),
            change: apiKpis.avgTAT === 'N/A' ? 'No data' : '',
            isPositive: true,
            prefix: ''
        }
    ];
}

// ----- Dashboard stats shape -----
export interface DashboardStats {
    kpis: KPI[];
    ramps: RampData[];
    queuedVehicles: QueuedVehicle[];
    customerRequests: CustomerRequest[];
    revenueData: ChartData[];
    expenseBreakdown: ChartData[];
    transactionVolume: ChartData[];
    workshopPulse: WorkshopPulse;
    recentTransactions: Transaction[];
    accounts: FinancialAccount[];
    goals: any[];
}

export function useDashboardStats() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/v1/dashboard-stats');

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const json: APIResponse = await response.json();

            if (!json.success || !json.data) {
                throw new Error('Invalid API response format');
            }

            const apiData = json.data;

            setData({
                kpis: transformKPIs(apiData.kpis),
                ramps: apiData.ramps,
                queuedVehicles: apiData.queuedVehicles,
                customerRequests: apiData.customerRequests,
                revenueData: apiData.revenueData,
                expenseBreakdown: apiData.expenseBreakdown,
                transactionVolume: apiData.transactionVolume,
                workshopPulse: apiData.workshopPulse,
                recentTransactions: apiData.recentTransactions,
                accounts: [], // TODO: Add API for accounts
                goals: []     // TODO: Add API for goals
            });

        } catch (err) {
            console.error('Dashboard stats fetch failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to load dashboard');

            // On error, we return null or empty state, NOT mock data
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { data, isLoading, error, refetch: fetchStats };
}
