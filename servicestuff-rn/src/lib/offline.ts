import NetInfo from '@react-native-community/netinfo';
import { TechnicianAPI } from './api';
import { JobCard } from '@/types';
import { storage, getStorageJSON, setStorageJSON } from './storage';

export class OfflineService {
    private static instance: OfflineService;
    private isOnline: boolean = true;
    private isSyncing: boolean = false;

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

    /**
     * Instantly fetch and cache latest jobs in background.
     * Used by background tasks to ensure the cache is warm.
     */
    async fetchAndCacheLatestJobs() {
        try {
            const res = await TechnicianAPI.getJobs({ limit: 50 });
            if (res.data?.data) {
                this.cacheJobs(res.data.data);
            }
        } catch (e) {
            console.error('[OFFLINE] Background job fetch failed', e);
        }
    }

    // Cache job card list
    cacheJobs(jobs: JobCard[]) {
        setStorageJSON('cached_jobs', {
            data: jobs,
            timestamp: Date.now()
        });
    }

    // Get cached job card list
    getCachedJobs(): JobCard[] {
        const value = getStorageJSON<{ data: JobCard[] }>('cached_jobs');
        return value?.data || [];
    }

    // Cache a single job detail
    cacheJobDetail(jobId: string, jobDetail: JobCard) {
        setStorageJSON(`job_detail_${jobId}`, jobDetail);
    }

    // Get cached job detail
    getCachedJobDetail(jobId: string): JobCard | null {
        return getStorageJSON<JobCard>(`job_detail_${jobId}`);
    }

    // Queue sync actions (checklist updates, notes, etc)
    queueAction(type: string, data: any) {
        const queue = getStorageJSON<any[]>('sync_queue') || [];
        queue.push({ type, data, timestamp: Date.now() });
        setStorageJSON('sync_queue', queue);
    }

    /**
     * Processes the offline queue.
     * Returns true if all items synced, false otherwise.
     */
    async syncQueue(): Promise<boolean> {
        if (this.isSyncing) return false;

        const queue = getStorageJSON<any[]>('sync_queue');
        if (!queue || queue.length === 0) return true;

        this.isSyncing = true;
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
        setStorageJSON('sync_queue', failedActions);
        this.isSyncing = false;

        if (failedActions.length === 0) {
            console.log('[OFFLINE] All actions synced successfully');
            return true;
        } else {
            console.warn(`[OFFLINE] ${failedActions.length} actions failed to sync and remain in queue`);
            return false;
        }
    }

    // Cache dashboard stats
    cacheStats(stats: any) {
        setStorageJSON('cached_stats', stats);
    }

    getCachedStats(): any | null {
        return getStorageJSON<any>('cached_stats');
    }

    // Cache user profile with 24h expiration
    cacheUserProfile(user: any) {
        setStorageJSON('cached_profile', {
            data: user,
            timestamp: Date.now()
        });
    }

    getCachedUserProfile(): any | null {
        const cached = getStorageJSON<{ data: any, timestamp: number }>('cached_profile');
        if (!cached) return null;

        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (Date.now() - cached.timestamp > twentyFourHours) {
            storage.remove('cached_profile');
            return null;
        }

        return cached.data;
    }

    clearUserProfile() {
        storage.remove('cached_profile');
    }
}
