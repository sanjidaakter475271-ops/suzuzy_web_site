import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Preferences } from '@capacitor/preferences';
import { ENV } from '../lib/env';

const API_Base_URL = ENV.PORTAL_API_URL;

const api = axios.create({
    baseURL: `${API_Base_URL}/api/v1/technician`,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Try to get token from preferences
        const { value: token } = await Preferences.get({ key: 'auth_token' });

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Also try to get session from better-auth if token missing?
        // Usually we rely on the stored token.

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for 401
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            await Preferences.remove({ key: 'auth_token' });
            // Redirect to login or trigger re-auth
            // window.location.href = '/login'; // Or use an event emitter
        }
        return Promise.reject(error);
    }
);

// API Methods
export const TechnicianAPI = {
    // Dashboard
    getDashboardStats: () => api.get('/dashboard'),

    // Jobs
    getJobs: (params?: { status?: string; page?: number; limit?: number }) => api.get('/jobs', { params }),
    getJobDetail: (id: string) => api.get(`/jobs/${id}`),
    updateJobStatus: (id: string, status: string, location?: { lat: number; lng: number }) =>
        api.post(`/jobs/${id}/status`, { status, location }),

    // Time Tracking
    logTime: (jobId: string, eventType: string, location?: { lat: number; lng: number }) =>
        api.post(`/jobs/${jobId}/time`, { eventType, location }),
    logBreak: (timeLogId: string, breakType: string) =>
        api.post(`/breaks`, { timeLogId, breakType }),

    // Checklist
    updateChecklist: (jobId: string, items: { id: string; condition: string; notes?: string; photoUrl?: string; completed?: boolean }[]) =>
        api.patch(`/jobs/${jobId}/checklist`, { items }),

    // Parts
    addPartUsage: (jobId: string, variantId: string, quantity: number, unitPrice?: number) =>
        api.post(`/jobs/${jobId}/parts`, { variantId, quantity, unitPrice }),
    requestParts: (jobId: string, items: { variantId: string; quantity: number }[]) =>
        api.post(`/requisitions`, { jobId, items }),
    getPartsHistory: () => api.get('/requisitions'),

    // Photos
    uploadPhoto: (jobId: string, data: { url: string; tag: string; caption?: string }) =>
        api.post(`/jobs/${jobId}/photos`, data),

    // Notes
    addNote: (jobId: string, note: string) => api.post(`/jobs/${jobId}/notes`, { note }),

    // QC
    requestQC: (jobId: string, notes?: string) => api.post(`/jobs/${jobId}/qc`, { notes }),

    // Attendance
    clockIn: (location: { lat: number; lng: number }) => api.post('/attendance/clock-in', { location }),
    clockOut: (location: { lat: number; lng: number }) => api.post('/attendance/clock-out', { location }),
    getAttendanceHistory: () => api.get('/attendance'),

    // Profile
    getProfile: () => api.get('/profile'),
    updateProfile: (data: any) => api.patch('/profile', data),

    // Issue Reporting
    reportIssue: (data: { category: string; description: string; severity: string; images?: string[] }) =>
        api.post('/issues', data),

    // Location Tracking
    updateLocation: (latitude: number, longitude: number) => api.post('/location', { latitude, longitude }),

    // Push Notifications
    registerPushToken: (token: string, deviceType: string, deviceName?: string) =>
        api.post('/push-tokens', { token, deviceType, deviceName }),
    removePushToken: (token: string) => api.delete('/push-tokens', { data: { token } }),
};

export default api;
