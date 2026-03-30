import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    Dimensions,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    Clock,
    PlayCircle,
    StopCircle,
    Calendar as CalendarIcon,
    MapPin,
    RefreshCw,
    History,
    Timer,
    ChevronLeft,
    X,
    QrCode,
    Coffee,
    Zap,
    LogOut
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';

import { TechnicianAPI } from '../../services/api';
import { LocationService } from '../../services/location';
import { TechnicianAttendance, AttendanceStatus } from '../../types';
import { TopBar } from '../../components/TopBar';
import { BarcodeScannerComponent } from '../../components/BarcodeScanner';

export default function Attendance() {
    const router = useRouter();
    const [history, setHistory] = useState<TechnicianAttendance[]>([]);
    const [status, setStatus] = useState<AttendanceStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [scanPurpose, setScanPurpose] = useState<'clock_in' | 'clock_out' | null>(null);
    const [operationLoading, setOperationLoading] = useState(false);

    // Live Timer State
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchStatus = async () => {
        try {
            const res = await TechnicianAPI.getAttendanceStatus();
            setStatus(res.data.data);

            const historyRes = await TechnicianAPI.getAttendanceHistory();
            setHistory(historyRes.data.data || []);
        } catch (err) {
            console.error("Status fetch error:", err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        await fetchStatus();
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Live Timer Effect
    useEffect(() => {
        if (status?.currentState === 'SHIFT_ACTIVE' && status.currentShiftStartedAt) {
            const startTime = new Date(status.currentShiftStartedAt).getTime();

            const updateTimer = () => {
                const now = new Date().getTime();
                setElapsedTime(now - startTime);
            };

            updateTimer();
            timerRef.current = setInterval(updateTimer, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setElapsedTime(0);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status?.currentState, status?.currentShiftStartedAt]);

    const formatElapsedTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    };

    const handleClockInClick = () => {
        setScanPurpose('clock_in');
        setIsScanning(true);
    };

    const handleClockOutClick = () => {
        setScanPurpose('clock_out');
        setIsScanning(true);
    };

    const handleStartShift = async () => {
        setOperationLoading(true);
        try {
            await TechnicianAPI.startShift();
            await fetchStatus();
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.error || "Failed to start work");
        } finally {
            setOperationLoading(false);
        }
    };

    const handleEndShift = async () => {
        setOperationLoading(true);
        try {
            await TechnicianAPI.endShift();
            await fetchStatus();
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.error || "Failed to stop work");
        } finally {
            setOperationLoading(false);
        }
    };

    const handleScan = async (result: string) => {
        setIsScanning(false);
        const purpose = scanPurpose;
        setScanPurpose(null);

        setOperationLoading(true);
        try {
            const location = await LocationService.getInstance().getCurrentLocation();
            if (purpose === 'clock_in') {
                await TechnicianAPI.clockIn(location, result);
            } else if (purpose === 'clock_out') {
                await TechnicianAPI.clockOut(location, result);
            }
            await fetchStatus();
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.error || "Failed to process QR code");
        } finally {
            setOperationLoading(false);
        }
    };

    // Calendar logic
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dayStats, setDayStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    const fetchDateStats = async (day: number) => {
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${formattedDay}`;

        setSelectedDate(dateStr);
        setStatsLoading(true);
        try {
            const res = await TechnicianAPI.getDateStats(dateStr);
            setDayStats(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    };

    const getDayStatus = (day: number) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const records = history.filter(a => a.clockIn.startsWith(dateStr));
        if (records.length === 0) return null;
        if (records.some(a => a.status === 'sick_leave')) return 'sick_leave';
        if (records.some(a => a.status === 'leave')) return 'leave';
        return 'present';
    };

    const renderActionButtons = () => {
        if (!status) return null;

        switch (status.currentState) {
            case 'NOT_CHECKED_IN':
                return (
                    <TouchableOpacity
                        onPress={handleClockInClick}
                        style={styles.largeButtonOrange}
                    >
                        <QrCode size={32} color="white" />
                        <View>
                            <Text style={styles.btnLabel}>Workspace Arrival</Text>
                            <Text style={styles.btnTitle}>Scan QR to Login</Text>
                        </View>
                    </TouchableOpacity>
                );
            case 'CHECKED_IN_IDLE':
            case 'SHIFT_PAUSED':
                return (
                    <View style={{ width: '100%', gap: 16 }}>
                        <TouchableOpacity
                            onPress={handleStartShift}
                            disabled={operationLoading}
                            style={styles.largeButtonBlue}
                        >
                            <Zap size={32} color="white" />
                            <View>
                                <Text style={styles.btnLabel}>Work Status</Text>
                                <Text style={styles.btnTitle}>Start Active Shift</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleClockOutClick}
                            style={styles.secondaryBtn}
                        >
                            <LogOut size={16} color="#64748b" />
                            <Text style={styles.secondaryBtnText}>Finish Day & Logout</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'SHIFT_ACTIVE':
                return (
                    <View style={{ width: '100%', gap: 16, alignItems: 'center' }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={styles.timerSub}>Active Work Duration</Text>
                            <Text style={styles.timerMain}>{formatElapsedTime(elapsedTime)}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleEndShift}
                            disabled={operationLoading}
                            style={styles.largeButtonDark}
                        >
                            <Coffee size={32} color="white" />
                            <View>
                                <Text style={styles.btnLabel}>Work Status</Text>
                                <Text style={styles.btnTitle}>Take a Break</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                );
            case 'CHECKED_OUT':
                return (
                    <View style={{ alignItems: 'center', gap: 24 }}>
                        <View style={{ alignItems: 'center' }}>
                            <View style={styles.successIconBg}><Clock size={32} color="#10b981" /></View>
                            <Text style={styles.endedTitle}>Work Ended</Text>
                            <Text style={styles.endedSub}>Great job today! See you tomorrow.</Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleClockInClick}
                            style={styles.largeButtonOrange}
                        >
                            <QrCode size={32} color="white" />
                            <View>
                                <Text style={styles.btnLabel}>Workspace Re-entry</Text>
                                <Text style={styles.btnTitle}>Scan QR to Login</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    if (loading) return (
        <View style={{ flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#3b82f6" />
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#020617' }}>
            {isScanning && (
                <BarcodeScannerComponent
                    onScan={handleScan}
                    onClose={() => { setIsScanning(false); setScanPurpose(null); }}
                    message={`Scan Workshop QR to ${scanPurpose === 'clock_in' ? 'Clock In' : 'Clock Out'}`}
                />
            )}
            <TopBar title="Attendance" />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                {/* Main Action Card */}
                <View style={styles.actionCard}>
                    <View style={styles.accentGlow} />
                    <View style={{ position: 'relative', zIndex: 10 }}>
                        {renderActionButtons()}
                    </View>
                </View>

                {/* Daily Total Mini Stats */}
                {status && status.totalWorkTimeMs > 0 && (
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 24 }}>
                        <View style={styles.miniStatCard}>
                            <Text style={styles.miniStatLabel}>Worked Today</Text>
                            <Text style={styles.miniStatValue}>
                                {Math.floor(status.totalWorkTimeMs / (1000 * 60 * 60))}h {Math.floor((status.totalWorkTimeMs % (1000 * 60 * 60)) / (1000 * 60))}m
                            </Text>
                        </View>
                        <View style={styles.miniStatCard}>
                            <Text style={styles.miniStatLabel}>Sessions</Text>
                            <Text style={styles.miniStatValue}>{status.sessions.length}</Text>
                        </View>
                    </View>
                )}

                {/* Calendar Section */}
                <View style={{ marginTop: 32 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <View>
                            <Text style={styles.sectionHeader}>ACTIVITY HISTORY</Text>
                            <Text style={styles.monthTitle}>
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                        <View style={styles.monthNav}>
                            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} style={styles.navBtn}><ChevronLeft size={18} color="white" /></TouchableOpacity>
                            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} style={[styles.navBtn, { transform: [{ rotate: '180deg' }] }]}><ChevronLeft size={18} color="white" /></TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.calendarCard}>
                        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <Text key={`${d}-${i}`} style={styles.dayHeader}>{d}</Text>
                            ))}
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {getDaysInMonth(currentMonth).map((day, idx) => {
                                const dayStatus = day ? getDayStatus(day) : null;
                                return (
                                    <View key={idx} style={{ width: (Dimensions.get('window').width - 100) / 7, aspectRatio: 1 }}>
                                        {day && (
                                            <TouchableOpacity
                                                onPress={() => fetchDateStats(day)}
                                                style={[
                                                    styles.dayBtn,
                                                    dayStatus === 'present' && styles.dayBtnPresent,
                                                    dayStatus === 'leave' && styles.dayBtnLeave,
                                                    dayStatus === 'sick_leave' && styles.dayBtnSick
                                                ]}
                                            >
                                                <Text style={[styles.dayText, dayStatus && styles.dayTextActive]}>{day}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* Legend */}
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#f97316' }]} /><Text style={styles.legendText}>Attended</Text></View>
                    <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#3b82f6' }]} /><Text style={styles.legendText}>Leave</Text></View>
                    <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#eab308' }]} /><Text style={styles.legendText}>Sick Leave</Text></View>
                    <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#1e293b' }]} /><Text style={styles.legendText}>Off Day</Text></View>
                </View>
            </ScrollView>

            {/* Summary Modal */}
            <Modal transparent visible={!!selectedDate} animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelectedDate(null)} />
                    <AnimatePresence>
                        {selectedDate && (
                            <MotiView
                                from={{ scale: 0.9, opacity: 0, translateY: 30 }}
                                animate={{ scale: 1, opacity: 1, translateY: 0 }}
                                style={styles.summaryModal}
                            >
                                <View style={styles.modalBar} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                                    <View>
                                        <Text style={styles.modalLabel}>Daily Activity Report</Text>
                                        <Text style={styles.modalDate}>
                                            {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.modalClose}>
                                        <X size={24} color="white" />
                                    </TouchableOpacity>
                                </View>

                                {statsLoading ? (
                                    <View style={{ paddingVertical: 60, alignItems: 'center', gap: 24 }}>
                                        <ActivityIndicator size="large" color="#f97316" />
                                        <Text style={styles.modalSyncText}>Syncing Data...</Text>
                                    </View>
                                ) : dayStats ? (
                                    <View style={{ gap: 32 }}>
                                        <View style={{ flexDirection: 'row', gap: 24 }}>
                                            <View style={styles.modalStatItem}>
                                                <Text style={styles.statLabel}>Hrs Worked</Text>
                                                <Text style={styles.statValue}>{dayStats.hoursWorked}<Text style={{ fontSize: 12, color: '#64748b' }}>h</Text></Text>
                                            </View>
                                            <View style={styles.modalStatItem}>
                                                <Text style={styles.statLabel}>Jobs Closed</Text>
                                                <Text style={styles.statValue}>{dayStats.completedJobs}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.qualityCard}>
                                            <Text style={styles.qualityLabel}>Service Quality</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                                                <Text style={styles.qualityValue}>{dayStats.averageRating}</Text>
                                                <Text style={styles.qualityTotal}>/ 5.0</Text>
                                            </View>
                                        </View>

                                        <Text style={styles.verifiedText}>Verified activity from authorized workshop session.</Text>
                                    </View>
                                ) : (
                                    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                                        <History size={48} color="#1e293b" />
                                        <Text style={styles.noRecordsText}>No records found</Text>
                                    </View>
                                )}
                            </MotiView>
                        )}
                    </AnimatePresence>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    actionCard: { backgroundColor: '#0f172a', padding: 32, borderRadius: 48, borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
    accentGlow: { position: 'absolute', top: -100, right: -100, width: 250, height: 250, backgroundColor: 'rgba(249, 115, 22, 0.05)', borderRadius: 999 },
    largeButtonOrange: { width: '100%', paddingVertical: 24, paddingHorizontal: 32, borderRadius: 40, backgroundColor: '#ea580c', flexDirection: 'row', alignItems: 'center', gap: 16 },
    largeButtonBlue: { width: '100%', paddingVertical: 24, paddingHorizontal: 32, borderRadius: 40, backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', gap: 16 },
    largeButtonDark: { width: '100%', paddingVertical: 24, paddingHorizontal: 32, borderRadius: 40, backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', gap: 16 },
    btnLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    btnTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    secondaryBtn: { width: '100%', paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    secondaryBtnText: { color: '#64748b', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
    timerSub: { fontSize: 10, fontWeight: '900', color: '#f97316', textTransform: 'uppercase', letterSpacing: 1, fontStyle: 'italic', marginBottom: 4 },
    timerMain: { fontSize: 56, fontWeight: '900', color: 'white', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    successIconBg: { width: 64, height: 64, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    endedTitle: { fontSize: 20, fontWeight: '900', color: 'white', textTransform: 'uppercase' },
    endedSub: { color: '#64748b', fontWeight: 'bold', fontSize: 14, marginTop: 4 },
    miniStatCard: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    miniStatLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    miniStatValue: { fontSize: 20, fontWeight: 'bold', color: 'white', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    sectionHeader: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic', marginBottom: 4 },
    monthTitle: { fontSize: 18, fontWeight: '900', color: 'white' },
    monthNav: { flexDirection: 'row', backgroundColor: '#0f172a', padding: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    navBtn: { padding: 8, borderRadius: 8 },
    calendarCard: { backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 24, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    dayHeader: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '900', color: '#475569' },
    dayBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    dayBtnPresent: { backgroundColor: '#ea580c' },
    dayBtnLeave: { backgroundColor: '#2563eb' },
    dayBtnSick: { backgroundColor: '#eab308' },
    dayText: { fontSize: 12, fontWeight: '900', color: '#475569' },
    dayTextActive: { color: 'white' },
    legendContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, backgroundColor: 'rgba(15, 23, 42, 0.3)', padding: 20, borderRadius: 24, marginTop: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 8, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
    summaryModal: { backgroundColor: '#0f172a', padding: 32, borderTopLeftRadius: 48, borderTopRightRadius: 48, overflow: 'hidden' },
    modalBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 6, backgroundColor: '#ea580c' },
    modalLabel: { fontSize: 10, fontWeight: '900', color: '#f97316', textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic', marginBottom: 4 },
    modalDate: { fontSize: 32, fontWeight: '900', color: 'white' },
    modalClose: { padding: 12, backgroundColor: '#1e293b', borderRadius: 999 },
    modalSyncText: { fontSize: 10, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 3 },
    modalStatItem: { flex: 1, backgroundColor: '#1e293b', padding: 24, borderRadius: 32 },
    statLabel: { fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 },
    statValue: { fontSize: 28, fontWeight: '900', color: 'white', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    qualityCard: { backgroundColor: 'rgba(234, 88, 12, 0.05)', padding: 24, borderRadius: 40, borderWidth: 1, borderColor: 'rgba(234, 88, 12, 0.1)', alignItems: 'center', gap: 8 },
    qualityLabel: { fontSize: 10, color: '#f97316', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
    qualityValue: { fontSize: 48, fontWeight: '900', color: '#f97316' },
    qualityTotal: { fontSize: 14, fontWeight: '900', color: 'rgba(234, 88, 12, 0.3)' },
    verifiedText: { fontSize: 9, color: '#475569', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 18 },
    noRecordsText: { fontSize: 12, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginTop: 16 }
});
