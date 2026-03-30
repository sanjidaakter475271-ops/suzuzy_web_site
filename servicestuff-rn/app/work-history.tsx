import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
    Search,
    ChevronRight,
    Briefcase,
    History,
    Filter,
    Timer
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { FlashList } from '@shopify/flash-list';

import { TechnicianAPI } from '../services/api';
import { JobCard, JobStatus } from '../types';
import { TopBar } from '../components/TopBar';

const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const HistoryCard = React.memo(({ job, onClick, isInitialMount }: {
    job: JobCard;
    onClick: (id: string) => void;
    isInitialMount: boolean;
}) => (
    <MotiView
        from={isInitialMount ? { opacity: 0, translateY: 15 } : false}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
    >
        <TouchableOpacity
            onPress={() => onClick(job.id)}
            style={styles.historyCard}
            activeOpacity={0.8}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
                <View style={styles.briefcaseBg}>
                    <Briefcase size={22} color="#475569" />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <View style={styles.ticketBadge}>
                            <Text style={styles.ticketText}>{job.ticket?.ticket_number}</Text>
                        </View>
                        <View style={styles.dot} />
                        <Text style={styles.dateText}>{formatDate(job.service_end_time || job.created_at)}</Text>
                    </View>
                    <Text style={styles.modelName} numberOfLines={1}>{job.vehicle?.model_name || 'General Service'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                        <View style={styles.verifiedBadge}>
                            <View style={styles.verifiedDot} />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Timer size={12} color="#334155" />
                            <Text style={styles.taskCountText}>{job.tasks?.length || 0} Tasks</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.arrowBg}>
                <ChevronRight size={18} color="#3b82f6" />
            </View>
        </TouchableOpacity>
    </MotiView>
));

HistoryCard.displayName = 'HistoryCard';

export default function WorkHistory() {
    const router = useRouter();
    const [jobs, setJobs] = useState<JobCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const isInitialMount = useRef(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await TechnicianAPI.getJobs({
                    status: JobStatus.COMPLETED,
                    limit: 50
                });

                if (res.data.success) {
                    setJobs(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
                isInitialMount.current = false;
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredJobs = useMemo(() => {
        return jobs.filter(job =>
            job.vehicle?.model_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            job.ticket?.ticket_number?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [jobs, debouncedSearchTerm]);

    return (
        <View style={{ flex: 1, backgroundColor: '#020617' }}>
            <TopBar title="Work History" showBack onBack={() => router.back()} />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={18} color="#64748b" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search ticket or vehicle model..."
                        placeholderTextColor="#475569"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>

                {/* Performance Summary Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerGlow} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, position: 'relative', zIndex: 10 }}>
                        <View style={styles.historyIconBg}>
                            <History size={24} color="white" />
                        </View>
                        <View>
                            <Text style={styles.bannerLabel}>Lifetime Experience</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                                <Text style={styles.bannerValue}>{jobs.length}</Text>
                                <Text style={styles.bannerSubLabel}>Completed Jobs</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* List Header */}
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Execution Logs</Text>
                    <Filter size={14} color="#334155" />
                </View>

                {/* List Content */}
                <View style={{ minHeight: 400 }}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={styles.loadingText}>Synchronizing Archive...</Text>
                        </View>
                    ) : (
                        <FlashList
                            data={filteredJobs}
                            renderItem={({ item }) => (
                                <HistoryCard
                                    job={item}
                                    isInitialMount={isInitialMount.current}
                                    onClick={(id) => router.push(`/job/${id}`)}
                                />
                            )}
                            // @ts-ignore
                            estimatedItemSize={120}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <View style={styles.emptyIconBg}>
                                        <Briefcase size={40} color="#1e293b" />
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.emptyTitle}>No Records Found</Text>
                                        <Text style={styles.emptySub}>Completed jobs will appear here.</Text>
                                    </View>
                                </View>
                            }
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 20, borderWidth: 1, borderColor: '#1e293b', paddingHorizontal: 16, height: 56, marginBottom: 16 },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, color: 'white', fontSize: 14 },
    banner: { backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: 32, padding: 24, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    bannerGlow: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 999 },
    historyIconBg: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
    bannerLabel: { fontSize: 10, fontWeight: '900', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
    bannerValue: { fontSize: 32, fontWeight: '900', color: 'white', fontStyle: 'italic' },
    bannerSubLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: 16 },
    listTitle: { fontSize: 10, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 3 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: 16 },
    loadingText: { fontSize: 10, fontWeight: '900', color: 'rgba(59, 130, 246, 0.5)', textTransform: 'uppercase', letterSpacing: 2 },
    historyCard: { backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 28, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    briefcaseBg: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1e293b' },
    ticketBadge: { backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.1)' },
    ticketText: { fontSize: 10, fontWeight: 'bold', color: '#3b82f6', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#334155' },
    dateText: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
    modelName: { fontSize: 16, fontWeight: '900', color: 'white' },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.1)' },
    verifiedDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#10b981' },
    verifiedText: { fontSize: 9, fontWeight: '900', color: '#10b981', textTransform: 'uppercase' },
    taskCountText: { fontSize: 9, fontWeight: '900', color: '#475569', textTransform: 'uppercase' },
    arrowBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, opacity: 0.3 },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#1e293b' },
    emptyTitle: { fontSize: 12, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 2 },
    emptySub: { fontSize: 11, color: '#475569', marginTop: 4 }
});
