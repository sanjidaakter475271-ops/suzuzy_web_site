import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
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
        const status = await Network.getStatus();
        this.isOnline = status.connected;

        Network.addListener('networkStatusChange', status => {
            this.isOnline = status.connected;
            if (this.isOnline) {
                this.syncQueue();
            }
        });
    }

    getOnlineStatus(): boolean {
        return this.isOnline;
    }

    // Cache job card list
    async cacheJobs(jobs: JobCard[]) {
        await Preferences.set({
            key: 'cached_jobs',
            value: JSON.stringify({
                data: jobs,
                timestamp: Date.now()
            })
        });
    }

    // Get cached job card list
    async getCachedJobs(): Promise<JobCard[]> {
        const { value } = await Preferences.get({ key: 'cached_jobs' });
        if (!value) return [];
        return JSON.parse(value).data;
    }

    // Cache a single job detail
    async cacheJobDetail(jobId: string, jobDetail: JobCard) {
        await Preferences.set({
            key: `job_detail_${jobId}`,
            value: JSON.stringify(jobDetail)
        });
    }

    // Get cached job detail
    async getCachedJobDetail(jobId: string): Promise<JobCard | null> {
        const { value } = await Preferences.get({ key: `job_detail_${jobId}` });
        return value ? JSON.parse(value) : null;
    }

    // Queue sync actions (checklist updates, notes, etc)
    async queueAction(type: string, data: any) {
        const { value } = await Preferences.get({ key: 'sync_queue' });
        const queue = value ? JSON.parse(value) : [];
        queue.push({ type, data, timestamp: Date.now() });
        await Preferences.set({ key: 'sync_queue', value: JSON.stringify(queue) });
    }

    private async syncQueue() {
        const { value } = await Preferences.get({ key: 'sync_queue' });
        if (!value) return;

        let queue = JSON.parse(value);
        if (queue.length === 0) return;

        console.log(`[OFFLINE] Syncing ${queue.length} queued actions...`);

        const failedActions = [];

        for (const action of queue) {
            try {
                switch (action.type) {
                    case 'update_status':
                        await TechnicianAPI.updateJobStatus(action.data.jobId, action.data.status, { lat: 0, lng: 0 });
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
        await Preferences.set({ key: 'sync_queue', value: JSON.stringify(failedActions) });

        if (failedActions.length === 0) {
            console.log('[OFFLINE] All actions synced successfully');
        } else {
            console.warn(`[OFFLINE] ${failedActions.length} actions failed to sync and remain in queue`);
        }
    }

    // Cache dashboard stats
    async cacheStats(stats: any) {
        await Preferences.set({ key: 'cached_stats', value: JSON.stringify(stats) });
    }

    async getCachedStats(): Promise<any | null> {
        const { value } = await Preferences.get({ key: 'cached_stats' });
        return value ? JSON.parse(value) : null;
    }

    // Cache user profile with 24h expiration
    async cacheUserProfile(user: any) {
        await Preferences.set({
            key: 'cached_profile',
            value: JSON.stringify({
                data: user,
                timestamp: Date.now()
            })
        });
    }

    async getCachedUserProfile(): Promise<any | null> {
        const { value } = await Preferences.get({ key: 'cached_profile' });
        if (!value) return null;

        const cached = JSON.parse(value);
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (Date.now() - cached.timestamp > twentyFourHours) {
            await Preferences.remove({ key: 'cached_profile' });
            return null;
        }

        return cached.data;
    }

    async clearUserProfile() {
        await Preferences.remove({ key: 'cached_profile' });
    }
}
