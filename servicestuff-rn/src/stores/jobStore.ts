import { create } from 'zustand';
import { TechnicianAPI } from '@/lib/api';
import { JobCard, DashboardStats, AttendanceStatus, JobStatus } from '@/types';
import { SocketService } from '@/lib/socket';
import { getStorageJSON } from '@/lib/storage';

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
    // 1. Instant Cache Load (SWR Pattern)
    const cachedStats = getStorageJSON<any>('cached_stats');
    const cachedAttendance = getStorageJSON<AttendanceStatus>('attendance_status'); // Adjusted key
    const cachedJobs = getStorageJSON<{ data: JobCard[] }>('cached_jobs');

    if (cachedStats || cachedAttendance || cachedJobs) {
      set({
        stats: cachedStats?.stats || get().stats,
        attendanceStatus: cachedAttendance || get().attendanceStatus,
        jobs: cachedJobs?.data || get().jobs,
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

      set({
        stats: statsResult.status === 'fulfilled' ? statsResult.value.data?.data?.stats : get().stats,
        attendanceStatus: statusResult.status === 'fulfilled' ? statusResult.value.data?.data : get().attendanceStatus,
        jobs: jobsResult.status === 'fulfilled' ? jobsResult.value.data?.data : get().jobs,
        loading: false,
        refreshing: false,
      });
    } catch (err) {
      console.error("[JOB_STORE] Fetch dashboard error:", err);
      set({ loading: false, refreshing: false });
    }
  },

  fetchJobs: async (params) => {
    // 1. Instant Cache Load
    const cachedJobs = getStorageJSON<{ data: JobCard[] }>('cached_jobs');
    if (cachedJobs?.data) {
      set({ jobs: cachedJobs.data, loading: false });
    } else {
      set({ loading: true });
    }

    // 2. Background Revalidation
    try {
      const res = await TechnicianAPI.getJobs(params);
      set({ jobs: res.data?.data || [], loading: false });
    } catch (err) {
      console.error("[JOB_STORE] Fetch jobs error:", err);
      set({ loading: false });
    }
  },

  fetchJobDetail: async (id) => {
    // 1. Instant Cache Load
    const cachedDetail = getStorageJSON<JobCard>(`job_detail_${id}`);
    if (cachedDetail) {
      set({ activeJob: cachedDetail, loading: false });
    } else {
      set({ loading: true });
    }

    // 2. Background Revalidation
    try {
      const res = await TechnicianAPI.getJobDetail(id);
      set({ activeJob: res.data?.data || null, loading: false });
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
