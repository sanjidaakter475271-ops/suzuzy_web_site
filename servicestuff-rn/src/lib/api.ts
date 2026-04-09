import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '@/lib/env';
import { router } from 'expo-router';
import { storage } from './storage';

const API_Base_URL = ENV.PORTAL_API_URL;
const AUTH_TOKEN_KEY = 'auth_token';

// Flag to prevent multiple 401 redirects
let isAuthRedirecting = false;
let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
    onUnauthorizedCallback = handler;
};

const api = axios.create({
    baseURL: `${API_Base_URL}/api/v1/technician`,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Try to get token from SecureStore
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for retries and 401 handling
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            if (!isAuthRedirecting) {
                isAuthRedirecting = true;
                console.log('[API] 401 Unauthorized - Clearing session and notifying provider');

                await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
                storage.remove('cached_profile');

                // Trigger the callback to reset AuthProvider state
                if (onUnauthorizedCallback) {
                    onUnauthorizedCallback();
                } else {
                    // Fallback to direct redirect if no handler set
                    try {
                        router.replace('/login');
                    } catch (e) {
                        console.error('[API] Auth error redirect failed', e);
                    }
                }

                // Reset flag after delay
                setTimeout(() => { isAuthRedirecting = false; }, 3000);
            }

            return Promise.reject(error);
        }

        const config: any = error.config;

        // Exponential Backoff Retry (Max 2 retries) for Network / 500 errors
        if (config && (!config._retryCount || config._retryCount < 2) && (!error.response || error.response.status >= 500)) {
            config._retryCount = (config._retryCount || 0) + 1;
            console.log(`[API Retry] Retrying request ${config.url} (Attempt ${config._retryCount})`);
            await new Promise(r => setTimeout(r, config._retryCount * 1000));
            return api(config);
        }

        return Promise.reject(error);
    }
);

// API Methods
export const TechnicianAPI = {
    // Dashboard
    getDashboardStats: (config?: AxiosRequestConfig) => api.get('/dashboard', config),

    // Jobs
    getJobs: (params?: { status?: string; page?: number; limit?: number }, config?: AxiosRequestConfig) =>
        api.get('/jobs', { params, ...config }),
    getJobDetail: (id: string, config?: AxiosRequestConfig) => api.get(`/jobs/${id}`, config),
    updateJobStatus: (id: string, status: string, location?: { lat: number; lng: number }, config?: AxiosRequestConfig) =>
        api.post(`/jobs/${id}/status`, { status, location }, config),

    // Time Tracking
    logTime: (jobId: string, eventType: string, location?: { lat: number; lng: number }, config?: AxiosRequestConfig) =>
        api.post(`/jobs/${jobId}/time`, { eventType, location }, config),
    logBreak: (timeLogId: string, breakType: string, config?: AxiosRequestConfig) =>
        api.post(`/breaks`, { timeLogId, breakType }, config),

    // Checklist
    updateChecklist: (jobId: string, items: { id: string; condition: string; notes?: string; photoUrl?: string; completed?: boolean }[], config?: AxiosRequestConfig) =>
        api.patch(`/jobs/${jobId}/checklist`, { items }, config),

    // Parts
    addPartUsage: (jobId: string, variantId: string, quantity: number, unitPrice?: number, config?: AxiosRequestConfig) =>
        api.post(`/jobs/${jobId}/parts`, { variantId, quantity, unitPrice }, config),
    requestParts: (jobId: string, items: { productId: string; quantity: number; notes?: string }[], config?: AxiosRequestConfig) =>
        api.post(`/requisitions`, { jobId, items }, config),
    getPartsHistory: (config?: AxiosRequestConfig) => api.get('/requisitions', config),
    updateRequisition: (id: string, quantity: number, config?: AxiosRequestConfig) => api.patch(`/requisitions/${id}`, { quantity }, config),
    deleteRequisition: (id: string, config?: AxiosRequestConfig) => api.delete(`/requisitions/${id}`, config),
    getCategories: (config?: AxiosRequestConfig) => api.get('/categories', config),
    getProductsByCategory: (categoryId: string, config?: AxiosRequestConfig) => api.get(`/products?categoryId=${categoryId}`, config),
    searchProducts: (params: { categoryId?: string; search?: string; limit?: number }, config?: AxiosRequestConfig) =>
        api.get('/products', { params, ...config }),
    getProductDetail: (id: string, config?: AxiosRequestConfig) => api.get(`/products/${id}`, config),
    getProductVariants: (productId: string, config?: AxiosRequestConfig) => api.get(`/products/${productId}/variants`, config),

    // Photos
    uploadPhoto: (jobId: string, data: { url: string; tag: string; caption?: string }, config?: AxiosRequestConfig) =>
        api.post(`/jobs/${jobId}/photos`, data, config),

    // Notes
    addNote: (jobId: string, note: string, config?: AxiosRequestConfig) => api.post(`/jobs/${jobId}/notes`, { note }, config),

    // QC
    requestQC: (jobId: string, notes?: string, config?: AxiosRequestConfig) => api.post(`/jobs/${jobId}/qc`, { notes }, config),

    // Attendance
    clockIn: (location?: { lat: number; lng: number }, qr_code?: string, deviceId?: string, config?: AxiosRequestConfig) =>
        api.post('/attendance/clock-in', { location, qr_code, deviceId }, config),
    clockOut: (location?: { lat: number; lng: number }, qr_code?: string, config?: AxiosRequestConfig) =>
        api.post('/attendance/clock-out', { location, qr_code }, config),
    getAttendanceStatus: (config?: AxiosRequestConfig) => api.get('/attendance/status', config),
    startShift: (config?: AxiosRequestConfig) => api.post('/attendance/start-shift', {}, config),
    endShift: (config?: AxiosRequestConfig) => api.post('/attendance/end-shift', {}, config),
    getAttendanceHistory: (config?: AxiosRequestConfig) => api.get('/attendance', config),
    getDateStats: (date: string, config?: AxiosRequestConfig) => api.get(`/attendance/stats-by-date?date=${date}`, config),

    // Profile
    getProfile: (config?: AxiosRequestConfig) => api.get('/profile', config),
    updateProfile: (data: any, config?: AxiosRequestConfig) => api.patch('/profile', data, config),

    // Issue Reporting
    reportIssue: (data: { category: string; description: string; severity: string; images?: string[] }, config?: AxiosRequestConfig) =>
        api.post('/issues', data, config),

    // Location Tracking
    updateLocation: (latitude: number, longitude: number, config?: AxiosRequestConfig) => api.post('/location', { latitude, longitude }, config),

    // Push Notifications
    registerPushToken: (token: string, deviceType: string, deviceName?: string, config?: AxiosRequestConfig) =>
        api.post('/push-tokens', { token, deviceType, deviceName }, config),
    removePushToken: (token: string, config?: AxiosRequestConfig) => api.delete('/push-tokens', { data: { token }, ...config }),

    // In-app Notifications
    getNotifications: (config?: AxiosRequestConfig) => api.get('/notifications', config),
    markNotificationsRead: (id?: string, config?: AxiosRequestConfig) => api.patch('/notifications', { id }, config),
    deleteNotifications: (id?: string, config?: AxiosRequestConfig) => api.delete('/notifications', { data: { id }, ...config }),

    // Leave Application
    applyForLeave: (data: { leaveType: string; startDate: string; endDate: string; reason: string; hometown?: string; phoneNumber?: string }, config?: AxiosRequestConfig) =>
        api.post('/leave', data, config),
    getLeaveHistory: (config?: AxiosRequestConfig) => api.get('/leave', config),
};

export default api;
