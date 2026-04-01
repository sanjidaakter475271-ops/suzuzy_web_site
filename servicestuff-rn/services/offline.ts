import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TechnicianAPI } from './api';
import { JobCard } from '../types';

export class OfflineService {
    private static instance: OfflineService;
    private isOnline: boolean = true;

    private constructor() {
        this.init();
    }

    static getInstance(): OfflineService {
        if (!OfflineService.instance) {
            OfflineService.instance = new OfflineService();
        }
        return OfflineService.instance;
    }

    private async init() {
        // Get initial state
        const state = await NetInfo.fetch();
        this.isOnline = state.isConnected ?? true;

        // Listen for changes
        NetInfo.addEventListener(state => {
            const wasOffline = !this.isOnline;
            this.isOnline = state.isConnected ?? true;

            if (this.isOnline && wasOffline) {
                this.syncQueue();
            }
        });
    }

    getOnlineStatus(): boolean {
        return this.isOnline;
    }

    // Cache job card list
    async cacheJobs(jobs: JobCard[]) {
        await AsyncStorage.setItem('cached_jobs', JSON.stringify({
            data: jobs,
            timestamp: Date.now()
        }));
    }

    // Get cached job card list
    async getCachedJobs(): Promise<JobCard[]> {
        const value = await AsyncStorage.getItem('cached_jobs');
        if (!value) return [];
        return JSON.parse(value).data;
    }

    // Cache a single job detail
    async cacheJobDetail(jobId: string, jobDetail: JobCard) {
        await AsyncStorage.setItem(`job_detail_${jobId}`, JSON.stringify(jobDetail));
    }

    // Get cached job detail
    async getCachedJobDetail(jobId: string): Promise<JobCard | null> {
        const value = await AsyncStorage.getItem(`job_detail_${jobId}`);
        return value ? JSON.parse(value) : null;
    }

    // Queue sync actions (checklist updates, notes, etc)
    async queueAction(type: string, data: any) {
        const value = await AsyncStorage.getItem('sync_queue');
        const queue = value ? JSON.parse(value) : [];
        queue.push({ type, data, timestamp: Date.now() });
        await AsyncStorage.setItem('sync_queue', JSON.stringify(queue));
    }

    private async syncQueue() {
        const value = await AsyncStorage.getItem('sync_queue');
        if (!value) return;

        let queue = JSON.parse(value);
        if (queue.length === 0) return;

        console.log(`[OFFLINE] Syncing ${queue.length} queued actions...`);

        const failedActions = [];

        for (const action of queue) {
            try {
                switch (action.type) {
                    case 'update_status':
                        await TechnicianAPI.updateJobStatus(action.data.jobId, action.data.status, action.data.location);
                        break;
                    case 'update_checklist':
                        await TechnicianAPI.updateChecklist(action.data.jobId, [{
                            id: action.data.itemId,
                            condition: action.data.condition,
                            completed: action.data.completed
                        }]);
                        break;
                    case 'add_note':
                        await TechnicianAPI.addNote(action.data.jobId, action.data.note);
                        break;
                    default:
                        console.warn(`[OFFLINE] Unknown action type: ${action.type}`);
                }
            } catch (error) {
                console.error(`[OFFLINE] Failed to sync action: ${action.type}`, error);
                failedActions.push(action);
            }
        }

        // Keep only failed actions in the queue
        await AsyncStorage.setItem('sync_queue', JSON.stringify(failedActions));

        if (failedActions.length === 0) {
            console.log('[OFFLINE] All actions synced successfully');
        } else {
            console.warn(`[OFFLINE] ${failedActions.length} actions failed to sync and remain in queue`);
        }
    }

    // Cache dashboard stats
    async cacheStats(stats: any) {
        await AsyncStorage.setItem('cached_stats', JSON.stringify(stats));
    }

    async getCachedStats(): Promise<any | null> {
        const value = await AsyncStorage.getItem('cached_stats');
        return value ? JSON.parse(value) : null;
    }

    // Cache user profile with 24h expiration
    async cacheUserProfile(user: any) {
        await AsyncStorage.setItem('cached_profile', JSON.stringify({
            data: user,
            timestamp: Date.now()
        }));
    }

    async getCachedUserProfile(): Promise<any | null> {
        const value = await AsyncStorage.getItem('cached_profile');
        if (!value) return null;

        const cached = JSON.parse(value);
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (Date.now() - cached.timestamp > twentyFourHours) {
            await AsyncStorage.removeItem('cached_profile');
            return null;
        }

        return cached.data;
    }

    async clearUserProfile() {
        await AsyncStorage.removeItem('cached_profile');
    }
}
