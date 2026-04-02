import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Clock, CheckCircle, AlertCircle, PauseCircle, ChevronRight, Briefcase, WifiOff } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { FlashList } from '@shopify/flash-list';
import NetInfo from '@react-native-community/netinfo';

import { TopBar } from '../../components/TopBar';
import MyJobCard from '../../components/MyJobCard';
import { JobCardSkeleton } from '../../components/Skeleton';
import { TechnicianAPI } from '../../services/api';
import { JobCard, JobStatus, RoutePath } from '../../types';
import { OfflineService } from '../../services/offline';
import { SocketService } from '../../services/socket';

export default function MyJobs() {
    const router = useRouter();
    const params = useLocalSearchParams<{ status?: string }>();
    const [jobs, setJobs] = useState<JobCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isOnline, setIsOnline] = useState(true);

    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);
    const offlineService = OfflineService.getInstance();

    useEffect(() => {
        if (params.status) {
            setActiveTab(params.status);
        }
    }, [params.status]);

    const fetchJobs = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const state = await NetInfo.fetch();
            if (!state.isConnected) {
                const cached = await offlineService.getCachedJobs();
                if (cached.length > 0) {
                    setJobs(cached);
                    setLoading(false);
                    setRefreshing(false);
                    return;
                }
            }

            const res = await TechnicianAPI.getJobs();
            setJobs(res.data.data);
            await offlineService.cacheJobs(res.data.data);
        } catch (err) {
            console.error("Error fetching jobs:", err);
            const cached = await offlineService.getCachedJobs();
            if (cached.length > 0) setJobs(cached);
        } finally {
            setLoading(false);
            setRefreshing(false);
            isInitialMount.current = false;
        }
    }, []);

    useEffect(() => {
        fetchJobs();

        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected ?? true);
        });

        const socket = SocketService.getInstance();
        const handleUpdate = () => {
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = setTimeout(() => fetchJobs(false), 300);
        };

        socket.on('order:update', handleUpdate);
        socket.on('job_cards:changed', handleUpdate);
        socket.on('inventory:changed', handleUpdate);

        return () => {
            unsubscribe();
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
            socket.off('order:update', handleUpdate);
            socket.off('job_cards:changed', handleUpdate);
            socket.off('inventory:changed', handleUpdate);
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
        return jobs.filter(job => {
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
        fetchJobs(false);
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#020617' }}>
            <TopBar title="My Jobs" />

            <AnimatePresence>
                {!isOnline && (
                    <MotiView
                        from={{ height: 0, opacity: 0 }}
                        animate={{ height: 40, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderBottomWidth: 1, borderBottomColor: 'rgba(245, 158, 11, 0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <WifiOff size={14} color="#f59e0b" />
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1 }}>Offline Mode - Showing Cached Data</Text>
                    </MotiView>
                )}
            </AnimatePresence>

            <View style={{ padding: 16, gap: 16 }}>
                {/* Search Bar */}
                <View style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: 12, top: 14, zIndex: 10 }} size={18} color="#64748b" />
                    <TextInput
                        placeholder="Search by model, plate, or ticket..."
                        placeholderTextColor="#475569"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{
                            backgroundColor: '#0f172a',
                            borderWidth: 1,
                            borderColor: 'rgba(30, 41, 59, 0.5)',
                            borderRadius: 12,
                            paddingVertical: 12,
                            paddingLeft: 40,
                            paddingRight: 16,
                            color: 'white',
                            fontSize: 14
                        }}
                    />
                </View>

                {/* Tabs */}
                <View style={{ flexDirection: 'row', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.5)' }}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                paddingVertical: 8,
                                alignItems: 'center',
                                borderRadius: 8,
                                backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
                            }}
                        >
                            <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: activeTab === tab.id ? 'white' : '#64748b' }}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                {loading ? (
                    <View style={{ gap: 16, paddingTop: 16 }}>
                        <JobCardSkeleton />
                        <JobCardSkeleton />
                        <JobCardSkeleton />
                    </View>
                ) : (
                    <FlashList
                        data={filteredJobs}
                        renderItem={({ item }) => {
                            return (
                                <MyJobCard
                                    job={item}
                                    isInitialMount={isInitialMount.current}
                                    onClick={(id) => router.push(`/job/${id}`)}
                                />
                            );
                        }}
                        // @ts-ignore
                        estimatedItemSize={140}
                        keyExtractor={(item) => item.id}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                        }
                        ListEmptyComponent={
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 }}>
                                <View style={{ width: 64, height: 64, backgroundColor: '#0f172a', borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1e293b' }}>
                                    <Briefcase size={32} color="#334155" />
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: 16 }}>No Jobs Found</Text>
                                    <Text style={{ color: '#64748b', fontSize: 14, textAlign: 'center', paddingHorizontal: 40, marginTop: 4 }}>
                                        {searchQuery ? "No jobs match your search criteria." : "You don't have any jobs assigned to you yet."}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => { setSearchQuery(''); setActiveTab('all'); }}>
                                    <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: 'bold' }}>Clear filters</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}
