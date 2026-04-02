import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Search,
    Filter
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { FlashList } from '@shopify/flash-list';

import { TechnicianAPI } from '../services/api';
import { RequisitionGroup } from '../types';
import { TopBar } from '../components/TopBar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { NotificationSkeleton } from '../components/Skeleton';

export default function Requisitions() {
    const router = useRouter();
    const [requisitions, setRequisitions] = useState<RequisitionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchRequisitions = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const res = await TechnicianAPI.getPartsHistory();
            if (res.data.data) {
                setRequisitions(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching requisitions:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequisitions();
    }, [fetchRequisitions]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'approved': return { color: COLORS.success, bg: COLORS.successBg, border: COLORS.success + '20', icon: <CheckCircle2 color={COLORS.success} size={14} /> };
            case 'rejected': return { color: COLORS.danger, bg: COLORS.dangerBg, border: COLORS.danger + '20', icon: <XCircle color={COLORS.danger} size={14} /> };
            case 'issued': return { color: COLORS.primary, bg: COLORS.primarySurface, border: COLORS.primary + '20', icon: <Package color={COLORS.primary} size={14} /> };
            default: return { color: COLORS.warning, bg: COLORS.warningBg, border: COLORS.warning + '20', icon: <Clock color={COLORS.warning} size={14} /> };
        }
    };

    const filteredRequisitions = useMemo(() => {
        return requisitions.filter(req =>
            req.items?.some(item => item.part_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            req.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [requisitions, searchQuery]);

    const renderItem = ({ item, index }: { item: RequisitionGroup, index: number }) => {
        const styles_type = getStatusStyles(item.status);
        return (
            <MotiView
                from={{ opacity: 0, translateY: 15 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300, delay: index * 50 }}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={styles.iconBg}>
                            <Package size={20} color={COLORS.textTertiary} />
                        </View>
                        <View>
                            <Text style={styles.reqId}>REQ-{item.id.substring(0, 6).toUpperCase()}</Text>
                            <Text style={styles.reqDate}>
                                {new Date(item.created_at).toLocaleDateString(undefined, {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: styles_type.bg, borderColor: styles_type.border }]}>
                        {styles_type.icon}
                        <Text style={[styles.statusText, { color: styles_type.color }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.itemsContainer}>
                    {item.items?.map((p, i) => (
                        <View key={i} style={[styles.partRow, i === 0 && { borderTopWidth: 0 }]}>
                            <Text style={styles.partName}>{p.part_name}</Text>
                            <View style={styles.qtyBadge}>
                                <Text style={styles.qtyText}>Qty: {p.quantity}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </MotiView>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
            <TopBar title="Part Requisitions" showBack onBack={() => router.back()} />

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Search size={18} color={COLORS.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search requisitions..."
                        placeholderTextColor={COLORS.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                {loading && requisitions.length === 0 ? (
                    <NotificationSkeleton />
                ) : (
                    <FlashList
                        data={filteredRequisitions}
                        renderItem={renderItem}
                        // @ts-ignore
                        estimatedItemSize={150}
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Package color={COLORS.borderStrong} size={48} />
                                <Text style={styles.emptyTitle}>No Requisitions Found</Text>
                                <Text style={styles.emptySub}>You haven't submitted any part requisitions yet.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {!loading && (
                <TouchableOpacity
                    onPress={() => fetchRequisitions(true)}
                    style={styles.floatingRefresh}
                    activeOpacity={0.8}
                >
                    <RefreshCw size={20} color={COLORS.white} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    searchSection: { flexDirection: 'row', gap: 12, padding: 16 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingHorizontal: 16, height: 52, ...SHADOWS.sm },
    searchInput: { flex: 1, marginLeft: 12, color: COLORS.textPrimary, fontSize: 14 },
    filterBtn: { backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
    card: { backgroundColor: COLORS.cardBg, borderRadius: 32, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    iconBg: { width: 40, height: 40, backgroundColor: COLORS.cardBgAlt, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
    reqId: { fontSize: 12, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 1 },
    reqDate: { fontSize: 10, color: COLORS.textTertiary, marginTop: 2, fontWeight: 'bold' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
    statusText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    itemsContainer: { gap: 4 },
    partRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.divider },
    partName: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
    qtyBadge: { backgroundColor: COLORS.cardBgAlt, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border },
    qtyText: { color: COLORS.textTertiary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
    emptyTitle: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 16 },
    emptySub: { color: COLORS.textTertiary, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
    floatingRefresh: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 24, right: 24, width: 56, height: 56, backgroundColor: COLORS.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 10 }
});
