import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Clock, CheckCircle, AlertCircle, PauseCircle, ChevronRight, Briefcase, WifiOff } from '@/components/icons';
import { MotiView, AnimatePresence } from 'moti';
import { FlashList } from '@shopify/flash-list';
import NetInfo from '@react-native-community/netinfo';

import { TopBar } from '@/components/layout/TopBar';
import MyJobCard from '@/features/jobs/components/MyJobCard';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { useJobStore } from '@/stores/jobStore';
import { JobCard, JobStatus } from '@/types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

export default function MyJobs() {
    const router = useRouter();
    const params = useLocalSearchParams<{ status?: string }>();
    const { jobs, loading, refreshing, fetchJobs, setRefreshing } = useJobStore();
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isOnline, setIsOnline] = useState(true);

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (params.status) {
            setActiveTab(params.status);
        }
    }, [params.status]);

    useEffect(() => {
        fetchJobs();

        const socket = SocketService.getInstance();
        const handleSync = () => {
            console.log("[JOBS] Synchronizing list via remote signal...");
            fetchJobs();
        };

        socket.on('job_cards:changed', handleSync);
        socket.on('notification:new', handleSync);

        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected ?? true);
        });

        return () => {
            unsubscribe();
            socket.off('job_cards:changed', handleSync);
            socket.off('notification:new', handleSync);
        };
    }, [fetchJobs]);

    // Search Debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const filteredJobs = useMemo(() => {
        return jobs.filter((job: JobCard) => {
            const matchesSearch =
                job.vehicle?.model_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                job.vehicle?.license_plate?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                job.ticket?.ticket_number?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

            if (activeTab === 'all') return matchesSearch;
            return matchesSearch && job.status === activeTab;
        });
    }, [jobs, debouncedSearchQuery, activeTab]);

    const tabs = [
        { id: 'all', label: 'All' },
        { id: JobStatus.PENDING, label: 'Pending' },
        { id: JobStatus.IN_PROGRESS, label: 'Active' },
        { id: JobStatus.COMPLETED, label: 'Done' }
    ];

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchJobs();
    }, [fetchJobs, setRefreshing]);

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
            <TopBar title="My Jobs" />

            <AnimatePresence>
                {!isOnline && (
                    <MotiView
                        from={{ height: 0, opacity: 0 }}
                        animate={{ height: 40, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ backgroundColor: COLORS.warningBg, borderBottomWidth: 1, borderBottomColor: COLORS.warning + '20', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <WifiOff size={14} color={COLORS.warning} />
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: COLORS.warning, textTransform: 'uppercase', letterSpacing: 1 }}>Offline Mode - Showing Cached Data</Text>
                    </MotiView>
                )}
            </AnimatePresence>

            <View style={{ padding: 16, gap: 16 }}>
                {/* Search Bar */}
                <View style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: 12, top: 14, zIndex: 10 }} size={18} color={COLORS.textTertiary} />
                    <TextInput
                        placeholder="Search by model, plate, or ticket..."
                        placeholderTextColor={COLORS.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{
                            backgroundColor: COLORS.inputBg,
                            borderWidth: 1,
                            borderColor: COLORS.border,
                            borderRadius: 12,
                            paddingVertical: 12,
                            paddingLeft: 40,
                            paddingRight: 16,
                            color: COLORS.textPrimary,
                            fontSize: 14
                        }}
                    />
                </View>

                {/* Tabs */}
                <View style={{ flexDirection: 'row', backgroundColor: COLORS.cardBg, padding: 4, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm }}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                paddingVertical: 8,
                                alignItems: 'center',
                                borderRadius: 8,
                                backgroundColor: activeTab === tab.id ? COLORS.primary : 'transparent',
                            }}
                        >
                            <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: activeTab === tab.id ? COLORS.white : COLORS.textTertiary }}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                {loading && jobs.length === 0 ? (
                    <View style={{ gap: 16, paddingTop: 16 }}>
                        <JobCardSkeleton />
                        <JobCardSkeleton />
                        <JobCardSkeleton />
                    </View>
                ) : (
                    <FlashList
                        data={filteredJobs}
                        renderItem={({ item }: { item: JobCard }) => {
                            return (
                                <MyJobCard
                                    job={item}
                                    isInitialMount={isInitialMount.current}
                                    onClick={(id: string) => router.push(`/job/${id}`)}
                                />
                            );
                        }}
                        // @ts-ignore
                        estimatedItemSize={140}
                        keyExtractor={(item: JobCard) => item.id}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                        }
                        ListEmptyComponent={
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 }}>
                                <View style={{ width: 64, height: 64, backgroundColor: COLORS.cardBgAlt, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border }}>
                                    <Briefcase size={32} color={COLORS.textTertiary} />
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 16 }}>No Jobs Found</Text>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 40, marginTop: 4 }}>
                                        {searchQuery ? "No jobs match your search criteria." : "You don't have any jobs assigned to you yet."}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => { setSearchQuery(''); setActiveTab('all'); }}>
                                    <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: 'bold' }}>Clear filters</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}
