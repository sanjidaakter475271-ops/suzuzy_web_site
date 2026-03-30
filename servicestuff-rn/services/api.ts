import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../lib/env';
import { router } from 'expo-router';

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
        // Try to get token from AsyncStorage
        const token = await AsyncStorage.getItem('auth_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for caching, retries, and offline fallback
api.interceptors.response.use(
    async (response) => {
        // Cache successful GET responses
        if (response.config.method?.toUpperCase() === 'GET') {
            const cacheKey = `cache_${response.config.url}`;
            try {
                await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
            } catch (e) {
                console.warn('Failed to cache response', e);
            }
        }
        return response;
    },
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('cached_profile'); // Clear offline profile to prevent login loop

            // Redirect to login using expo-router
            // Note: In some contexts, router might not be ready, so we use replace if possible
            try {
                router.replace('/login');
            } catch (e) {
                console.error('[API] Auth error redirect failed', e);
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

        // Offline Fallback for GET requests
        if (config && config.method?.toUpperCase() === 'GET' && (!error.response || error.response.status >= 500)) {
            const cacheKey = `cache_${config.url}`;
            const value = await AsyncStorage.getItem(cacheKey);
            if (value) {
                console.log(`[Offline Fallback] Serving cached data for ${config.url}`);
                return Promise.resolve({
                    data: JSON.parse(value),
                    status: 200,
                    statusText: 'OK from Cache',
                    headers: {},
                    config
                } as any);
            }
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
    requestParts: (jobId: string, items: { productId: string; quantity: number; notes?: string }[]) =>
        api.post(`/requisitions`, { jobId, items }),
    getPartsHistory: () => api.get('/requisitions'),
    updateRequisition: (id: string, quantity: number) => api.patch(`/requisitions/${id}`, { quantity }),
    deleteRequisition: (id: string) => api.delete(`/requisitions/${id}`),
    getCategories: () => api.get('/categories'),
    getProductsByCategory: (categoryId: string) => api.get(`/products?categoryId=${categoryId}`),
    getProductDetail: (id: string) => api.get(`/products/${id}`),
    getProductVariants: (productId: string) => api.get(`/products/${productId}/variants`),

    // Photos
    uploadPhoto: (jobId: string, data: { url: string; tag: string; caption?: string }) =>
        api.post(`/jobs/${jobId}/photos`, data),

    // Notes
    addNote: (jobId: string, note: string) => api.post(`/jobs/${jobId}/notes`, { note }),

    // QC
    requestQC: (jobId: string, notes?: string) => api.post(`/jobs/${jobId}/qc`, { notes }),

    // Attendance
    clockIn: (location?: { lat: number; lng: number }, qr_code?: string, deviceId?: string) =>
        api.post('/attendance/clock-in', { location, qr_code, deviceId }),
    clockOut: (location?: { lat: number; lng: number }, qr_code?: string) =>
        api.post('/attendance/clock-out', { location, qr_code }),
    getAttendanceStatus: () => api.get('/attendance/status'),
    startShift: () => api.post('/attendance/start-shift'),
    endShift: () => api.post('/attendance/end-shift'),
    getAttendanceHistory: () => api.get('/attendance'),
    getDateStats: (date: string) => api.get(`/attendance/stats-by-date?date=${date}`),

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

    // In-app Notifications
    getNotifications: () => api.get('/notifications'),
    markNotificationsRead: (id?: string) => api.patch('/notifications', { id }),
    deleteNotifications: (id?: string) => api.delete('/notifications', { data: { id } }),
};

export default api;
