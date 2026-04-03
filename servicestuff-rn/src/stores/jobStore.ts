import { create } from 'zustand';
import { TechnicianAPI } from '@/lib/api';
import { JobCard, DashboardStats, AttendanceStatus, JobStatus } from '@/types';
import { SocketService } from '@/lib/socket';
import { OfflineService } from '@/lib/offline';

interface JobState {
  jobs: JobCard[];
  activeJob: JobCard | null;
  stats: DashboardStats | null;
  attendanceStatus: AttendanceStatus | null;
  loading: boolean;
  refreshing: boolean;

  // Actions
  fetchDashboardData: (showLoading?: boolean) => Promise<void>;
  fetchJobs: (params?: { status?: string; limit?: number }) => Promise<void>;
  fetchJobDetail: (id: string) => Promise<void>;
  updateJobStatus: (id: string, status: string, location?: { lat: number; lng: number }) => Promise<void>;
  setRefreshing: (refreshing: boolean) => void;
  initializeSocketListeners: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  activeJob: null,
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

    if (cachedStats || cachedAttendance || cachedJobs.length > 0) {
      set({
        stats: cachedStats || get().stats,
        attendanceStatus: cachedAttendance || get().attendanceStatus,
        jobs: cachedJobs.length > 0 ? cachedJobs : get().jobs,
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
    if (cachedJobs.length > 0) {
      set({ jobs: cachedJobs, loading: false });
    } else {
      set({ loading: true });
    }

    // 2. Background Revalidation
    try {
      const res = await TechnicianAPI.getJobs(params);
      const jobs = res.data?.data || [];
      set({ jobs, loading: false });
      if (jobs.length > 0) offlineService.cacheJobs(jobs);
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
      const job = res.data?.data || null;
      set({ activeJob: job, loading: false });
      if (job) offlineService.cacheJobDetail(id, job);
    } catch (err) {
      console.error("[JOB_STORE] Fetch job detail error:", err);
      set({ loading: false });
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
    } catch (err) {
      console.error("[JOB_STORE] Update job status error:", err);
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

    const events = ['job_cards:changed', 'order:update', 'inventory:changed', 'attendance:changed'];
    events.forEach(e => socket.on(e, handleUpdate));

    // Specific attendance events
    socket.on('attendance:shift_start', handleUpdate);
    socket.on('attendance:shift_end', handleUpdate);
  },
}));
