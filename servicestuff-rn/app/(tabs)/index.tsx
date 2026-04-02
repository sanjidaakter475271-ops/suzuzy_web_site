import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Clock, CheckCircle, AlertCircle, Calendar, RefreshCw,
  ClipboardList, ChevronRight, QrCode, Scan, Zap
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBadge } from '../../components/ui/StatusBadge';
import { DashboardSkeleton } from '../../components/Skeleton';
import { MaterialCircularProgress } from '../../components/ui/Loading';
import { TopBar } from '../../components/TopBar';
import { TechnicianAPI } from '../../services/api';
import { JobCard, DashboardStats, AttendanceStatus, JobStatus } from '../../types';
import { SocketService } from '../../services/socket';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

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
    <View style={styles.timerContainer}>
      <Clock size={12} color={COLORS.textTertiary} />
      <Text style={styles.timerText}>{elapsed}</Text>
    </View>
  );
});

// Task Card Component
const TaskCard = React.memo(({ item, onPress }: { item: JobCard, onPress: (id: string) => void }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      style={styles.taskCard}
      activeOpacity={0.8}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskModel}>{item.vehicle?.model_name || 'Unknown Model'}</Text>
        <StatusBadge status={item.status} size="sm" />
      </View>

      <View style={styles.plateBadge}>
        <Text style={styles.plateText}>{item.vehicle?.license_plate || 'N/A'}</Text>
      </View>

      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.vehicle?.issue_description || 'No description provided'}
      </Text>

      <View style={styles.taskFooter}>
        <View style={styles.taskDateContainer}>
          <Calendar size={12} color={COLORS.textSecondary} />
          <Text style={styles.taskDateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.taskOwner}>Owner: {item.vehicle?.customer_name || 'Unknown'}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const getEfficiencyRating = (score: number) => {
    if (score >= 90) return { label: 'Outstanding', color: COLORS.success };
    if (score >= 75) return { label: 'Above Average', color: COLORS.success };
    if (score >= 60) return { label: 'Satisfactory', color: COLORS.warning };
    return { label: 'Needs Improvement', color: COLORS.danger };
  };

  const renderEfficiencyCircle = () => {
    const score = stats?.efficiency_score || 0;
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <View style={styles.efficiencyCircleContainer}>
        <Svg width="56" height="56" viewBox="0 0 56 56" style={styles.svgRotate}>
          <Circle
            cx="28"
            cy="28"
            r={radius}
            stroke={COLORS.border}
            strokeWidth="4"
            fill="transparent"
          />
          <Circle
            cx="28"
            cy="28"
            r={radius}
            stroke={COLORS.success}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.efficiencyCircleTextContainer}>
          <Text style={styles.efficiencyScoreText}>{score}%</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    const efficiency = getEfficiencyRating(stats?.efficiency_score || 0);

    return (
      <View>
        {/* Top Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerSubtitle}>Technician</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={() => fetchData(true)}>
            <RefreshCw size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Attendance Widget */}
        <View style={styles.widgetContainer}>
          <TouchableOpacity onPress={() => router.push('/attendance')}>
            <LinearGradient
              colors={attendanceStatus?.currentState === 'SHIFT_ACTIVE' ? [COLORS.accent, COLORS.primary] : [COLORS.primaryLight, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.attendanceGradient}
            >
              <View style={styles.attendanceContent}>
                <View>
                  <Text style={styles.workshopStatusLabel}>Workshop Status</Text>
                  <Text style={styles.workshopStatusText}>
                    {attendanceStatus?.currentState === 'SHIFT_ACTIVE' ? 'Working Active' :
                     attendanceStatus?.currentState === 'SHIFT_PAUSED' ? 'On Break' :
                     attendanceStatus?.currentState === 'CHECKED_IN_IDLE' ? 'Logged In' : 'Offline'}
                  </Text>

                  <View style={styles.statusDetailContainer}>
                    {attendanceStatus?.currentState === 'SHIFT_ACTIVE' ? (
                      <>
                        <ShiftTimer startTime={attendanceStatus.currentShiftStartedAt} />
                        <MotiView
                          from={{ opacity: 0.3 }}
                          animate={{ opacity: 1 }}
                          transition={{ loop: true, type: 'timing', duration: 1000 }}
                          style={styles.activeDot}
                        />
                      </>
                    ) : (
                      <View style={styles.idleContainer}>
                        <Clock size={12} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.idleText}>Session Idle</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.qrContainer}>
                  <QrCode size={24} color={COLORS.white} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Scanner */}
          <TouchableOpacity
            style={styles.scannerCard}
            activeOpacity={0.8}
            onPress={() => router.push('/attendance')} // Default to attendance scanner for now
          >
            <View style={styles.scannerContent}>
              <View style={styles.scannerIconContainer}>
                <Scan size={24} color={COLORS.primary} />
              </View>
              <View style={styles.scannerTextContainer}>
                <Text style={styles.scannerLabel}>Scanner</Text>
                <Text style={styles.scannerTitle}>Scan VIN or Ticket</Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>

          {/* Pending */}
          <TouchableOpacity
            style={styles.statsCardSmall}
            onPress={() => router.push({ pathname: '/jobs', params: { status: JobStatus.PENDING } })}
          >
            <Text style={styles.statsLabelSmall}>Pending</Text>
            <Text style={[styles.statsValueSmall, { color: COLORS.warning }]}>{stats?.pending || 0}</Text>
          </TouchableOpacity>

          {/* Active */}
          <TouchableOpacity
            style={styles.statsCardSmall}
            onPress={() => router.push({ pathname: '/jobs', params: { status: JobStatus.IN_PROGRESS } })}
          >
            <View style={styles.statHeaderRow}>
              <Text style={styles.statsLabelSmall}>Active</Text>
              <View style={[styles.pulseDot, { backgroundColor: COLORS.accent }]} />
            </View>
            <Text style={[styles.statsValueSmall, { color: COLORS.accent }]}>{stats?.active || 0}</Text>
          </TouchableOpacity>

          {/* Efficiency Card */}
          <View style={styles.efficiencyCard}>
            <View style={styles.efficiencyContent}>
              {renderEfficiencyCircle()}
              <View style={styles.efficiencyTextContainer}>
                <Text style={styles.efficiencyLabel}>Efficiency</Text>
                <Text style={[styles.efficiencyValue, { color: efficiency.color }]}>{efficiency.label}</Text>
              </View>
            </View>
            <View style={styles.hoursContainer}>
              <Text style={styles.hoursLabel}>Work Hours</Text>
              <Text style={[styles.hoursValue, { color: COLORS.accent }]}>{stats?.hours_worked || 0}h</Text>
            </View>
          </View>
        </View>

        {/* Recent Tasks List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recent Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/jobs')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ClipboardList size={48} color={COLORS.slate500} />
      <Text style={styles.emptyText}>No recent tasks found</Text>
    </View>
  );

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar title="Dashboard" />
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      <TopBar title="Dashboard" />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            item={item}
            onPress={(id: string) => router.push(`/job/${id}`)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={loading ? null : renderEmpty}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.pageBg,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentSurface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  timerText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.accent,
    marginLeft: SPACING.sm,
  },
  taskCard: {
    backgroundColor: 'rgba(30, 64, 175, 0.12)',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.25)',
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  taskModel: {
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  plateBadge: {
    backgroundColor: COLORS.cardBgAlt,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  plateText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: 'monospace',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.families.regular,
    marginBottom: SPACING.md,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  taskDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDateText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
    fontFamily: TYPOGRAPHY.families.regular,
    marginLeft: SPACING.xs,
  },
  taskOwner: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontFamily: TYPOGRAPHY.families.medium,
    color: COLORS.textSecondary,
  },
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.textPrimary,
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  widgetContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  attendanceGradient: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
  attendanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workshopStatusLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
    fontStyle: 'italic',
  },
  workshopStatusText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  statusDetailContainer: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    marginLeft: SPACING.sm,
    width: 8,
    height: 8,
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  idleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  idleText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    color: "rgba(255,255,255,0.8)",
    marginLeft: SPACING.sm,
  },
  qrContainer: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statsGrid: {
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scannerCard: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  scannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scannerIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primarySurface,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTextContainer: {
    marginLeft: SPACING.md,
  },
  scannerLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scannerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.textPrimary,
  },
  statsCardSmall: {
    width: '48%',
    backgroundColor: COLORS.cardBg,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  statsLabelSmall: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsValueSmall: {
    fontSize: 36,
    fontFamily: 'monospace',
    fontWeight: '900',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  efficiencyCard: {
    width: '100%',
    ...SHADOWS.sm,
  },
  efficiencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  efficiencyCircleContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgRotate: {
    transform: [{ rotate: '-90deg' }],
  },
  efficiencyCircleTextContainer: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  efficiencyScoreText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.textSecondary,
  },
  efficiencyTextContainer: {
    marginLeft: SPACING.md,
  },
  efficiencyLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  efficiencyValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.families.bold,
  },
  hoursContainer: {
    alignItems: 'flex-end',
  },
  hoursLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontFamily: TYPOGRAPHY.families.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hoursValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.textPrimary,
  },
  listHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontFamily: TYPOGRAPHY.families.bold,
    color: COLORS.textPrimary,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontFamily: TYPOGRAPHY.families.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    opacity: 0.3,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontFamily: TYPOGRAPHY.families.medium,
  },
});
