import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Clock, CheckCircle, AlertCircle, Calendar, RefreshCw,
  PlayCircle, StopCircle, ClipboardList, ChevronRight, X, QrCode, Scan, LogOut, Zap
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { FlashList } from '@shopify/flash-list';

import { StatusBadge } from '../../components/ui/StatusBadge';
import { DashboardSkeleton } from '../../components/Skeleton';
import { TechnicianAPI } from '../../services/api';
import { JobCard, DashboardStats, AttendanceStatus, RoutePath, JobStatus } from '../../types';
import { SocketService } from '../../services/socket';
import { LocationService } from '../../services/location';

// Memoized Shift Timer Component
const ShiftTimer = React.memo(({ startTime }: { startTime: string | null }) => {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!startTime) {
      setElapsed('00:00:00');
      return;
    }

    const updateTimer = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = now - start;

      const totalSeconds = Math.floor(diff / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      setElapsed(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
      <Clock size={12} color="#bfdbfe" />
      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#dbeafe', marginLeft: 6 }}>{elapsed}</Text>
    </View>
  );
});

// Task Card Component for FlashList
const TaskCard = React.memo(({ item, onPress }: { item: JobCard, onPress: (id: string) => void }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
      case 'qc_passed':
      case 'verified':
        return { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.2)', icon: <CheckCircle size={14} color="#4ade80" /> };
      case 'in_progress':
        return { bg: 'rgba(96, 165, 250, 0.1)', text: '#60a5fa', border: 'rgba(96, 165, 250, 0.2)', icon: <Clock size={14} color="#60a5fa" /> };
      case 'qc_pending':
        return { bg: 'rgba(251, 191, 36, 0.1)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.2)', icon: <AlertCircle size={14} color="#fbbf24" /> };
      default:
        return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.2)', icon: <AlertCircle size={14} color="#94a3b8" /> };
    }
  };

  const style = getStatusStyle(item.status);

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      style={{ backgroundColor: '#0d1326', padding: 20, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.5)', marginBottom: 16 }}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={{ fontWeight: 'bold', color: '#f1f5f9', fontSize: 16 }}>{item.vehicle?.model_name || 'Unknown Model'}</Text>
        <StatusBadge status={item.status} size="sm" />
      </View>

      <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 8 }}>
        <Text style={{ fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>{item.vehicle?.license_plate || 'N/A'}</Text>
      </View>

      <Text style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }} numberOfLines={2}>
        {item.vehicle?.issue_description || 'No description provided'}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(30, 41, 59, 0.5)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Calendar size={12} color="#64748b" />
          <Text style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '500', color: '#94a3b8' }}>Owner: {item.vehicle?.customer_name || 'Unknown'}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default function Dashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<JobCard[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchTimeoutReq = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [statsResult, statusResult, jobsResult] = await Promise.allSettled([
        TechnicianAPI.getDashboardStats(),
        TechnicianAPI.getAttendanceStatus(),
        TechnicianAPI.getJobs({ limit: 5 }),
      ]);

      if (statsResult.status === 'fulfilled') setStats(statsResult.value.data?.data?.stats || null);
      if (statusResult.status === 'fulfilled') setAttendanceStatus(statusResult.value.data?.data || null);
      if (jobsResult.status === 'fulfilled') setTasks(jobsResult.value.data?.data || []);

    } catch (err) {
      console.error("[DASHBOARD] Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup Socket Listeners
    const socket = SocketService.getInstance();
    const handleUpdate = () => {
      if (fetchTimeoutReq.current) clearTimeout(fetchTimeoutReq.current);
      fetchTimeoutReq.current = setTimeout(() => fetchData(false), 300);
    };

    const events = ['job_cards:changed', 'order:update', 'inventory:changed', 'attendance:changed'];
    events.forEach(e => socket.on(e, handleUpdate));

    return () => {
      events.forEach(e => socket.off(e, handleUpdate));
      if (fetchTimeoutReq.current) clearTimeout(fetchTimeoutReq.current);
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, []);

  const renderEfficiencyCircle = () => {
    const score = stats?.efficiency_score || 0;
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <View style={{ position: 'relative', width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx="28"
            cy="28"
            r={radius}
            stroke="#1e293b"
            strokeWidth="4"
            fill="transparent"
          />
          <Circle
            cx="28"
            cy="28"
            r={radius}
            stroke="#10b981"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#cbd5e1' }}>{score}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#020617' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        {/* Header Spacer */}
        <View style={{ height: 48 }} />

        {/* Top Header */}
        <View style={{ paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Technician</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Dashboard</Text>
          </View>
          <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: '#0f172a', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1e293b' }} onPress={() => fetchData(true)}>
            <RefreshCw size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Attendance Widget */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.push('/attendance')}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.15)', 'rgba(79, 70, 229, 0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 40, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: '#60a5fa', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontStyle: 'italic' }}>Workshop Status</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: -0.5 }}>
                    {attendanceStatus?.currentState === 'SHIFT_ACTIVE' ? 'Working Active' :
                     attendanceStatus?.currentState === 'SHIFT_PAUSED' ? 'On Break' :
                     attendanceStatus?.currentState === 'CHECKED_IN_IDLE' ? 'Logged In' : 'Offline'}
                  </Text>

                  <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                    {attendanceStatus?.currentState === 'SHIFT_ACTIVE' ? (
                      <>
                        <ShiftTimer startTime={attendanceStatus.currentShiftStartedAt} />
                        <MotiView
                          from={{ opacity: 0.3 }}
                          animate={{ opacity: 1 }}
                          transition={{ loop: true, type: 'timing', duration: 1000 }}
                          style={{ marginLeft: 8, width: 8, height: 8, backgroundColor: '#10b981', borderRadius: 999 }}
                        />
                      </>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                        <Clock size={12} color="#94a3b8" />
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginLeft: 6 }}>Session Idle</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <QrCode size={24} color="white" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Scanner */}
          <TouchableOpacity
            style={{ width: '100%', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 20, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.5)', marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Scan size={24} color="#3b82f6" />
              </View>
              <View style={{ marginLeft: 16 }}>
                <Text style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Scanner</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>Scan VIN or Ticket</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#475569" />
          </TouchableOpacity>

          {/* Pending */}
          <TouchableOpacity
            style={{ width: '48%', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 20, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.5)', marginBottom: 16 }}
            onPress={() => router.push({ pathname: '/jobs', params: { status: JobStatus.PENDING } })}
          >
            <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>Pending</Text>
            <Text style={{ fontSize: 36, fontWeight: '900', color: '#fbbf24', marginTop: 8, fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>{stats?.pending || 0}</Text>
          </TouchableOpacity>

          {/* Active */}
          <TouchableOpacity
            style={{ width: '48%', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 20, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.5)', marginBottom: 16 }}
            onPress={() => router.push({ pathname: '/jobs', params: { status: JobStatus.IN_PROGRESS } })}
          >
            <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>Active</Text>
            <Text style={{ fontSize: 36, fontWeight: '900', color: '#3b82f6', marginTop: 8, fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>{stats?.active || 0}</Text>
          </TouchableOpacity>

          {/* Efficiency Card */}
          <View style={{ width: '100%', backgroundColor: '#0d1326', padding: 24, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.5)', marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {renderEfficiencyCircle()}
              <View style={{ marginLeft: 16 }}>
                <Text style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Efficiency</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#10b981' }}>Above Average</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Work Hours</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>{stats?.hours_worked || 0}h</Text>
            </View>
          </View>
        </View>

        {/* Recent Tasks List */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Recent Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/jobs')}>
            <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16, minHeight: 300 }}>
          {loading ? (
            <DashboardSkeleton />
          ) : tasks.length > 0 ? (
            <FlashList
              data={tasks}
              renderItem={({ item }: { item: JobCard }) => (
                <TaskCard
                  item={item}
                  onPress={(id: string) => router.push(`/job/${id}`)}
                />
              )}
              // @ts-ignore - FlashList types can be finicky with estimatedItemSize in some TS environments
              estimatedItemSize={160}
              scrollEnabled={false}
            />
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40, opacity: 0.3 }}>
              <ClipboardList size={48} color="#94a3b8" />
              <Text style={{ color: '#94a3b8', marginTop: 12, fontWeight: '500' }}>No recent tasks found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
