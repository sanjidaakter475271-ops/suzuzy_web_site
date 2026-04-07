import { create } from 'zustand';
import { TechnicianAPI } from '@/lib/api';
import { JobCard, DashboardStats, AttendanceStatus, JobStatus, PartsRequest } from '@/types';
import { SocketService } from '@/lib/socket';
import { OfflineService } from '@/lib/offline';
import * as Notifications from 'expo-notifications';

interface JobState {
  jobs: JobCard[];
  activeJob: JobCard | null;
  requisitions: PartsRequest[];
  stats: DashboardStats | null;
  attendanceStatus: AttendanceStatus | null;
  loading: boolean;
  refreshing: boolean;

  // Actions
  fetchDashboardData: (showLoading?: boolean) => Promise<void>;
  fetchJobs: (params?: { status?: string; limit?: number }) => Promise<void>;
  fetchJobDetail: (id: string) => Promise<void>;
  fetchRequisitions: (jobId?: string) => Promise<void>;
  updateJobStatus: (id: string, status: string, location?: { lat: number; lng: number }) => Promise<void>;
  requestParts: (jobId: string, items: { productId: string; quantity: number; notes?: string }[]) => Promise<void>;
  clockIn: (location: { lat: number; lng: number } | null, qrCode: string) => Promise<void>;
  clockOut: (location: { lat: number; lng: number } | null, qrCode: string) => Promise<void>;
  startShift: () => Promise<void>;
  endShift: () => Promise<void>;
  setRefreshing: (refreshing: boolean) => void;
  initializeSocketListeners: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  activeJob: null,
  requisitions: [],
  stats: null,
  attendanceStatus: null,
  loading: false,
  refreshing: false,

  setRefreshing: (refreshing: boolean) => set({ refreshing }),

  fetchDashboardData: async (showLoading = true) => {
    const offlineService = OfflineService.getInstance();

    // 1. Instant Cache Load (SWR Pattern)
    const cachedStats = offlineService.getCachedStats();
    const cachedAttendance = offlineService.getCachedAttendanceStatus();
    const cachedJobs = offlineService.getCachedJobs();

    if (cachedStats || cachedAttendance || (cachedJobs && cachedJobs.length > 0)) {
      set({
        stats: cachedStats || get().stats,
        attendanceStatus: cachedAttendance || get().attendanceStatus,
        jobs: (cachedJobs && cachedJobs.length > 0) ? cachedJobs : get().jobs,
        loading: false
      });
    } else if (showLoading) {
      set({ loading: true });
    }

    // 2. Background Revalidation
    try {
      const [statsResult, statusResult, jobsResult] = await Promise.allSettled([
        TechnicianAPI.getDashboardStats(),
        TechnicianAPI.getAttendanceStatus(),
        TechnicianAPI.getJobs({ limit: 5 }),
      ]);

      const newState: Partial<JobState> = { loading: false, refreshing: false };

      if (statsResult.status === 'fulfilled') {
        const stats = statsResult.value.data?.data?.stats;
        newState.stats = stats;
        if (stats) offlineService.cacheStats(stats);
      }

      if (statusResult.status === 'fulfilled') {
        const status = statusResult.value.data?.data;
        newState.attendanceStatus = status;
        if (status) offlineService.cacheAttendanceStatus(status);
      }

      if (jobsResult.status === 'fulfilled') {
        const jobs = jobsResult.value.data?.data;
        newState.jobs = jobs;
        if (jobs) offlineService.cacheJobs(jobs);
      }

      set(newState);
    } catch (err) {
      console.error("[JOB_STORE] Fetch dashboard error:", err);
      set({ loading: false, refreshing: false });
    }
  },

  fetchJobs: async (params) => {
    const offlineService = OfflineService.getInstance();

    // 1. Instant Cache Load
    const cachedJobs = offlineService.getCachedJobs();
    if (cachedJobs && cachedJobs.length > 0) {
      set({ jobs: cachedJobs, loading: false });
    } else {
      set({ loading: true });
    }

    // 2. Background Revalidation
    try {
      const res = await TechnicianAPI.getJobs(params);
      const jobs = res.data?.data || [];
      set({ jobs, loading: false });
      if (jobs && jobs.length > 0) offlineService.cacheJobs(jobs);
    } catch (err) {
      console.error("[JOB_STORE] Fetch jobs error:", err);
      set({ loading: false });
    }
  },

  fetchJobDetail: async (id) => {
    const offlineService = OfflineService.getInstance();

    // 1. Instant Cache Load
    const cachedDetail = offlineService.getCachedJobDetail(id);
    if (cachedDetail) {
      set({ activeJob: cachedDetail, loading: false });
    } else {
      set({ loading: true });
    }

    // 2. Background Revalidation
    try {
      const res = await TechnicianAPI.getJobDetail(id);
      const jobData = res.data.data;

      const sanitizedJob = {
          ...jobData,
          tasks: jobData.tasks || [],
          checklist: (jobData.checklist || jobData.service_checklist_items || []).map((i: any) => ({
              id: i.id,
              name: i.name,
              category: i.category,
              is_completed: i.is_completed || false,
              condition: i.condition || 'na',
              photo_url: i.photo_url || i.photoUrl
          })),
          photos: jobData.photos || jobData.job_photos || []
      };

      set({ activeJob: sanitizedJob, loading: false });
      if (id) offlineService.cacheJobDetail(id, sanitizedJob);
    } catch (err) {
      console.error("[JOB_STORE] Fetch job detail error:", err);
      set({ loading: false });
    }
  },

  fetchRequisitions: async (jobId) => {
    try {
      const res = await TechnicianAPI.getPartsHistory();
      if (res.data?.data) {
        let allItems = res.data.data;
        if (jobId) {
          allItems = allItems
            .filter((g: any) => g.job_card_id === jobId)
            .flatMap((g: any) => g.items || []);
        } else {
          allItems = allItems.flatMap((g: any) => g.items || []);
        }
        set({ requisitions: allItems });
      }
    } catch (err) {
      console.error('[JOB_STORE] Error fetching requisitions:', err);
    }
  },

  updateJobStatus: async (id, status, location) => {
    try {
      await TechnicianAPI.updateJobStatus(id, status, location);
      // Optimistically update the list if the job is in the list
      set((state) => ({
        jobs: state.jobs.map(job => job.id === id ? { ...job, status: status as JobStatus } : job),
        activeJob: state.activeJob?.id === id ? { ...state.activeJob, status: status as JobStatus } : state.activeJob
      }));
      // Refresh dashboard in background to sync stats
      get().fetchDashboardData(false);
    } catch (err) {
      console.error("[JOB_STORE] Update job status error:", err);
      throw err;
    }
  },

  requestParts: async (jobId, items) => {
    try {
      const res = await TechnicianAPI.requestParts(jobId, items);
      if (res.data.success) {
        await Promise.all([
          get().fetchJobDetail(jobId),
          get().fetchRequisitions(jobId)
        ]);
      }
    } catch (err) {
      console.error("[JOB_STORE] Request parts error:", err);
      throw err;
    }
  },

  clockIn: async (location, qrCode) => {
    try {
      await TechnicianAPI.clockIn(location || undefined, qrCode);
      await get().fetchDashboardData(false);
    } catch (err) {
      console.error("[JOB_STORE] Clock in error:", err);
      throw err;
    }
  },

  clockOut: async (location, qrCode) => {
    try {
      await TechnicianAPI.clockOut(location || undefined, qrCode);
      await get().fetchDashboardData(false);
    } catch (err) {
      console.error("[JOB_STORE] Clock out error:", err);
      throw err;
    }
  },

  startShift: async () => {
    try {
      await TechnicianAPI.startShift();
      await get().fetchDashboardData(false);
    } catch (err) {
      console.error("[JOB_STORE] Start shift error:", err);
      throw err;
    }
  },

  endShift: async () => {
    try {
      await TechnicianAPI.endShift();
      await get().fetchDashboardData(false);
    } catch (err) {
      console.error("[JOB_STORE] End shift error:", err);
      throw err;
    }
  },

  initializeSocketListeners: () => {
    const socket = SocketService.getInstance();

    const handleUpdate = () => {
      // Debounced refresh
      const timeout = (global as any).jobStoreRefreshTimeout;
      if (timeout) clearTimeout(timeout);
      (global as any).jobStoreRefreshTimeout = setTimeout(() => {
        get().fetchDashboardData(false);
      }, 500);
    };

    const events = ['job_cards:changed', 'order:update', 'inventory:changed', 'attendance:changed', 'requisition:status_changed', 'requisition:approved', 'requisition:rejected'];
    events.forEach(e => socket.on(e, (data) => {
      handleUpdate();

      // Only schedule system notification if app is in background
      // The custom toast in _layout.tsx handles foreground notifications
      const scheduleSystemNotification = async () => {
        let title = "App Update";
        let body = "Something has changed in your dashboard.";
        let shouldNotify = false;

        if (e === 'job_cards:changed') {
          title = "Job Card Updated";
          body = `Job #${data.jobNo || data.id.substring(0, 8)} status changed to ${data.toStatus || 'updated'}`;
          shouldNotify = true;
        } else if (e === 'requisition:approved') {
          title = "Requisition Approved";
          body = `Your parts request for Job #${data.jobNo || 'N/A'} has been approved!`;
          shouldNotify = true;
        } else if (e === 'requisition:rejected') {
          title = "Requisition Rejected";
          body = `Your parts request for Job #${data.jobNo || 'N/A'} was rejected.`;
          shouldNotify = true;
        }

        if (shouldNotify) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              data: { url: e.includes('requisition') ? '/(tabs)/requisitions' : `/(tabs)/jobs/${data.id || data.jobId}` },
            },
            trigger: null,
          });
        }
      };

      // We still schedule it; expo-notifications setNotificationHandler
      // config in _layout.tsx determines if it shows while app is foregrounded.
      // But having the custom toast provides a much better UX.
      scheduleSystemNotification();
    }));

    // Specific attendance events
    socket.on('attendance:shift_start', handleUpdate);
    socket.on('attendance:shift_end', handleUpdate);
  },
}));
