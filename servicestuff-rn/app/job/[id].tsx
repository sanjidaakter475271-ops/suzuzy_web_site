import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Platform,
    StyleSheet,
    Dimensions,
    Modal,
    ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ChevronLeft,
    Plus,
    Trash2,
    CheckCircle2,
    Package,
    Info,
    Clock,
    User as UserIcon,
    Tag,
    Camera,
    FileText,
    ListChecks,
    AlertTriangle,
    PlayCircle,
    PauseCircle,
    CheckSquare,
    Sparkles,
    WifiOff,
    X
} from '@/components/icons';
import { MotiView, AnimatePresence } from 'moti';
import * as ImagePicker from 'expo-image-picker';

import { TechnicianAPI } from '@/lib/api';
import { JobCard, ChecklistItem, ServiceCondition, PartsRequest } from '@/types';
import { TopBar } from '@/components/layout/TopBar';
import { PartsSelectionModal } from '@/features/parts/components/PartsSelectionModal';
import { OfflineService } from '@/lib/offline';
import { LocationService } from '@/lib/location';
import { MediaService } from '@/lib/media';
import { SocketService } from '@/lib/socket';
import { DetailSkeleton } from '@/components/ui/Skeleton';
import { diagnoseIssue } from '@/lib/geminiService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MaterialCircularProgress } from '@/components/ui/Loading';
import { JobStatus } from '@/types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

type Tab = 'summary' | 'checklist' | 'parts' | 'photos' | 'notes';

export default function JobCardDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [job, setJob] = useState<JobCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    const offlineService = OfflineService.getInstance();
    const [isOnline, setIsOnline] = useState(true);

    // Parts State
    const [showPartsSelector, setShowPartsSelector] = useState(false);
    const [requisitions, setRequisitions] = useState<PartsRequest[]>([]);
    const [adjustingPart, setAdjustingPart] = useState<any>(null);
    const [productForAdjustment, setProductForAdjustment] = useState<any>(null);

    // Note State
    const [newNote, setNewNote] = useState('');
    const syncTimeout = useRef<NodeJS.Timeout | null>(null);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // AI Diagnosis State
    const [diagnosis, setDiagnosis] = useState<string | null>(null);
    const [diagnosisLoading, setDiagnosisLoading] = useState(false);
    const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);

    const debouncedFetchJobs = React.useCallback(() => {
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => {
            fetchJobDetails();
        }, 300);
    }, [id]);

    const debouncedFetchRequisitions = React.useCallback(() => {
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(() => {
            fetchRequisitions();
        }, 300);
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchJobDetails();
            fetchRequisitions();
        }

        // Listen for realtime updates
        const socket = SocketService.getInstance();
        const handleUpdate = (data: any) => {
            if (data?.jobId === id || data?.id === id || !data?.id) {
                debouncedFetchJobs();
            }
        };

        socket.on('order:update', handleUpdate);
        socket.on('job_cards:changed', handleUpdate);
        socket.on('requisition:created', debouncedFetchRequisitions);
        socket.on('requisition:approved', debouncedFetchRequisitions);
        socket.on('requisition:rejected', debouncedFetchRequisitions);

        return () => {
            socket.off('order:update', handleUpdate);
            socket.off('job_cards:changed', handleUpdate);
            socket.off('requisition:created', debouncedFetchRequisitions);
            socket.off('requisition:approved', debouncedFetchRequisitions);
            socket.off('requisition:rejected', debouncedFetchRequisitions);
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        };
    }, [id]);

    const fetchJobDetails = async () => {
        setLoading(true);
        try {
            if (!id) return;

            const isCurrentOnline = offlineService.getOnlineStatus();
            setIsOnline(isCurrentOnline);

            if (!isCurrentOnline) {
                const cached = await offlineService.getCachedJobDetail(id);
                if (cached) {
                    setJob(cached);
                    setLoading(false);
                    return;
                }
            }

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

            setJob(sanitizedJob);
            await offlineService.cacheJobDetail(id, sanitizedJob);
        } catch (err) {
            console.error("Error fetching job:", err);
            if (id) {
                const cached = await offlineService.getCachedJobDetail(id);
                if (cached) setJob(cached);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRequisitions = async () => {
        if (!id) return;
        try {
            const res = await TechnicianAPI.getPartsHistory();
            if (res.data?.data) {
                const allItems = res.data.data
                    .filter((g: any) => g.job_card_id === id)
                    .flatMap((g: any) => g.items || []);
                setRequisitions(allItems);
            }
        } catch (err) {
            console.error('Error fetching requisitions:', err);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!job) return;
        const prevStatus = job.status;
        let location = null;

        // Optimistic Update
        setJob({ ...job, status: newStatus as any });

        try {
            try {
                location = await LocationService.getInstance().getCurrentLocation();
            } catch (le) {
                console.warn("Location fetch failed");
            }

            if (!isOnline) {
                await offlineService.queueAction('update_status', { jobId: job.id, status: newStatus, location });
                if (newStatus === 'completed') router.replace('/(tabs)');
                return;
            }

            await TechnicianAPI.updateJobStatus(job.id, newStatus, location || undefined);
            if (newStatus === 'completed') {
                router.replace('/(tabs)');
            } else {
                fetchJobDetails();
            }
        } catch (err) {
            setJob({ ...job, status: prevStatus });
            Alert.alert("Error", "Failed to update status");
        }
    };

    const handleChecklistUpdate = async (itemId: string, completed: boolean, condition: ServiceCondition, photoUrl?: string) => {
        if (!job) return;

        const updatedChecklist = job.checklist?.map(c =>
            c.id === itemId ? { ...c, condition, is_completed: completed, photo_url: photoUrl } : c
        );
        setJob({ ...job, checklist: updatedChecklist });

        try {
            if (!isOnline) {
                await offlineService.queueAction('update_checklist', { jobId: job.id, itemId, condition, completed, photoUrl });
                return;
            }

            await TechnicianAPI.updateChecklist(job.id, [{
                id: itemId,
                condition: condition,
                completed: completed,
                photoUrl: photoUrl
            }]);
            fetchJobDetails();
        } catch (error) {
            console.error("Failed to update checklist item:", error);
            fetchJobDetails();
        }
    };

    const handleChecklistToggle = (item: ChecklistItem) => {
        handleChecklistUpdate(item.id, !item.is_completed, item.condition, (item as any).photo_url);
    };

    const handleChecklistPhoto = async (item: ChecklistItem) => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0].uri) {
            setLoading(true);
            try {
                const url = await MediaService.uploadImage(result.assets[0].uri, 'service-docs', `checklist/${job?.id}`);
                await handleChecklistUpdate(item.id, true, item.condition, url);
            } catch (err) {
                Alert.alert("Upload failed", "Could not upload photo.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAddNote = async () => {
        if (!job || !newNote.trim()) return;
        try {
            if (!isOnline) {
                await offlineService.queueAction('add_note', { jobId: job.id, note: newNote });
                setNewNote('');
                return;
            }
            await TechnicianAPI.addNote(job.id, newNote);
            setNewNote('');
            fetchJobDetails();
        } catch (err) {
            console.error("Error adding note:", err);
        }
    };

    const handleDiagnose = async () => {
        if (!job?.vehicle?.issue_description) {
            Alert.alert("No Description", "Please provide an issue description first.");
            return;
        }

        setDiagnosisLoading(true);
        setShowDiagnosisModal(true);
        try {
            const result = await diagnoseIssue(job.vehicle.issue_description);
            setDiagnosis(result);
        } catch (err) {
            setDiagnosis("Failed to get diagnosis.");
        } finally {
            setDiagnosisLoading(false);
        }
    };

    const handlePhotoUpload = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0].uri && job) {
            setLoading(true);
            try {
                const publicUrl = await MediaService.uploadImage(result.assets[0].uri, 'service-docs', `jobs/${job.id}`);
                await TechnicianAPI.uploadPhoto(job.id, {
                    url: publicUrl,
                    tag: 'during',
                    caption: `Uploaded from native app`
                });
                fetchJobDetails();
            } catch (err) {
                Alert.alert("Upload failed", "Could not upload job photo.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleOpenQuickAdjust = async (req: any) => {
        setAdjustingPart(req);
        setProductForAdjustment(null);
        try {
            const res = await TechnicianAPI.getProductDetail(req.product_id);
            if (res.data?.success) {
                setProductForAdjustment(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching product detail:", err);
        }
    };

    const handleUpdateQuantity = (newQty: number) => {
        if (!adjustingPart) return;

        const sanitizedQty = Math.max(0, newQty);
        setAdjustingPart({ ...adjustingPart, quantity: sanitizedQty });

        // Optimistic update for the list
        setRequisitions(prev => prev.map(r => r.id === adjustingPart.id ? { ...r, quantity: sanitizedQty } : r));

        if (syncTimeout.current) clearTimeout(syncTimeout.current);

        syncTimeout.current = setTimeout(async () => {
            try {
                if (sanitizedQty <= 0) {
                    await TechnicianAPI.deleteRequisition(adjustingPart.id);
                    setAdjustingPart(null);
                    fetchRequisitions();
                } else {
                    await TechnicianAPI.updateRequisition(adjustingPart.id, sanitizedQty);
                }
            } catch (err) {
                console.error("Sync failed:", err);
                fetchRequisitions();
            }
        }, 500);
    };

    if (loading && !job) return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg, paddingTop: 60 }}>
            <DetailSkeleton />
        </View>
    );

    if (!job) return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: COLORS.textPrimary }}>Job not found.</Text>
        </View>
    );

    const tabs = [
        { id: 'summary', icon: Info, label: 'Info' },
        { id: 'checklist', icon: ListChecks, label: 'Tasks' },
        { id: 'parts', icon: Package, label: 'Parts' },
        { id: 'photos', icon: Camera, label: 'Photos' },
        { id: 'notes', icon: FileText, label: 'Notes' },
    ];

    const renderSummaryTab = () => (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
            <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <View>
                        <Text style={styles.vehicleName}>{job.vehicle?.model_name || 'Generic Bike'}</Text>
                        <Text style={styles.plateNumber}>{job.vehicle?.license_plate || 'WP-8899'}</Text>
                    </View>
                    <StatusBadge status={job.status || JobStatus.PENDING} />
                </View>

                <View style={{ flexDirection: 'row', gap: 16, marginTop: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <UserIcon size={16} color={COLORS.textSecondary} />
                        <Text style={styles.infoText}>{job.vehicle?.customer_name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Clock size={16} color={COLORS.textSecondary} />
                        <Text style={styles.infoText}>{new Date(job.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                <View style={styles.detailSection}>
                    <Text style={styles.sectionHeader}><Info size={12} color={COLORS.textTertiary} /> VEHICLE DETAILS</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <View style={{ width: '50%', marginBottom: 12 }}>
                            <Text style={styles.label}>Engine</Text>
                            <Text style={styles.value}>{job.vehicle?.engine_number || '---'}</Text>
                        </View>
                        <View style={{ width: '50%', marginBottom: 12 }}>
                            <Text style={styles.label}>Chassis</Text>
                            <Text style={styles.value}>{job.vehicle?.chassis_number || '---'}</Text>
                        </View>
                        <View style={{ width: '50%' }}>
                            <Text style={styles.label}>Mileage</Text>
                            <Text style={styles.value}>{job.vehicle?.mileage ? `${job.vehicle.mileage} KM` : '---'}</Text>
                        </View>
                        <View style={{ width: '50%' }}>
                            <Text style={styles.label}>Color</Text>
                            <Text style={styles.value}>{job.vehicle?.color || '---'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.issueSection}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={styles.sectionHeader}><AlertTriangle size={12} color={COLORS.warning} /> CUSTOMER ISSUE</Text>

                        {process.env.EXPO_PUBLIC_GEMINI_API_KEY &&
                         process.env.EXPO_PUBLIC_GEMINI_API_KEY !== 'PLACEHOLDER_API_KEY' && (
                            <TouchableOpacity
                                onPress={handleDiagnose}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                    backgroundColor: COLORS.primarySurface,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: BORDER_RADIUS.md
                                }}
                            >
                                <Sparkles size={14} color={COLORS.primary} />
                                <Text style={{ color: COLORS.primary, fontSize: 10, fontFamily: TYPOGRAPHY.families.bold }}>AI DIAGNOSIS</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.issueBody}>{job.vehicle?.issue_description || 'General maintenance and checkup.'}</Text>
                </View>
            </View>
        </MotiView>
    );

    const renderChecklistTab = () => {
        const categories = job.checklist?.reduce((acc, item) => {
            const cat = item.category || 'General';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {} as Record<string, ChecklistItem[]>) || {};

        return (
            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} style={{ paddingBottom: 100 }}>
                {Object.entries(categories).map(([category, items]) => (
                    <View key={category} style={{ marginBottom: 24 }}>
                        <Text style={styles.categoryHeader}>{category}</Text>
                        {items.map(item => (
                            <View key={item.id} style={styles.checkItemCard}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                        <TouchableOpacity
                                            onPress={() => handleChecklistToggle(item)}
                                            style={[styles.checkbox, item.is_completed && styles.checkboxActive]}
                                        >
                                            <CheckSquare size={20} color={item.is_completed ? COLORS.success : COLORS.textTertiary} />
                                        </TouchableOpacity>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.checkItemName, item.is_completed && styles.checkItemNameDone]}>
                                                {item.name}
                                            </Text>
                                            {(item as any).photo_url && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                    <Image
                                                        source={{ uri: (item as any).photo_url }}
                                                        style={styles.checkItemImage}
                                                        contentFit="cover"
                                                        transition={200}
                                                    />
                                                    <Text style={styles.evidenceText}>Evidence Attached</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleChecklistPhoto(item)}
                                        style={[styles.cameraBtn, (item as any).photo_url && styles.cameraBtnActive]}
                                    >
                                        <Camera size={20} color={(item as any).photo_url ? COLORS.primary : COLORS.textTertiary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.conditionRow}>
                                    {(['ok', 'fair', 'bad', 'na'] as ServiceCondition[]).map((cond) => (
                                        <TouchableOpacity
                                            key={cond}
                                            onPress={() => handleChecklistUpdate(item.id, item.is_completed, cond, (item as any).photo_url)}
                                            style={[
                                                styles.conditionBtn,
                                                item.condition === cond && styles[`conditionBtn_${cond}`]
                                            ]}
                                        >
                                            <Text style={[styles.conditionText, item.condition === cond && styles.conditionTextActive]}>
                                                {cond}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </MotiView>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
            <TopBar title={`Job #${job.service_number || id?.slice(0, 8)}`} showBack onBack={() => router.back()} />

            {!isOnline && (
                <View style={styles.offlineBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <WifiOff size={14} color={COLORS.warning} />
                        <Text style={styles.offlineText}>Offline Mode</Text>
                    </View>
                    <Text style={styles.offlineSubtext}>Changes will sync when online</Text>
                </View>
            )}

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id as Tab)}
                            style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
                        >
                            <tab.icon size={20} color={activeTab === tab.id ? COLORS.primary : COLORS.textTertiary} />
                            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
                            {activeTab === tab.id && <MotiView style={styles.tabIndicator} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                {activeTab === 'summary' && renderSummaryTab()}
                {activeTab === 'checklist' && renderChecklistTab()}
                {/* Other tabs follow similar porting pattern */}
                {activeTab === 'parts' && (
                    <View style={{ paddingBottom: 100 }}>
                         <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={styles.sectionTitle}>Parts & Requisitions</Text>
                            <TouchableOpacity onPress={() => setShowPartsSelector(true)} style={styles.addPartBtn}>
                                <Plus size={14} color={COLORS.primary} />
                                <Text style={styles.addPartBtnText}>Add Part</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Issued Parts */}
                        {job.parts?.map(part => (
                            <View key={part.id} style={styles.partItem}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={styles.issuedIcon}><CheckCircle2 size={16} color={COLORS.primary} /></View>
                                    <View>
                                        <Text style={styles.partName}>{part.part_name || 'Generic Part'}</Text>
                                        <Text style={styles.partMeta}>Quantity: {part.quantity} • Issued</Text>
                                    </View>
                                </View>
                                <Text style={styles.partPrice}>৳{part.price?.toLocaleString()}</Text>
                            </View>
                        ))}

                        {/* Requisitions */}
                        {requisitions.map(req => (
                            <TouchableOpacity key={req.id} onPress={() => handleOpenQuickAdjust(req)} style={styles.partItem}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={[styles.issuedIcon, { backgroundColor: COLORS.warningBg }]}><Clock size={16} color={COLORS.warning} /></View>
                                    <View>
                                        <Text style={styles.partName}>{req.productName || 'Generic Part'}</Text>
                                        <Text style={styles.partMeta}>Quantity: {req.quantity} • {req.status}</Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.partPrice}>৳{req.unit_price?.toLocaleString()}</Text>
                                    <View style={[styles.reqBadge, (styles as any)[`reqBadge_${req.status}`]]}>
                                        <Text style={styles.reqBadgeText}>{req.status}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {activeTab === 'photos' && (
                    <View style={styles.photoGrid}>
                        {job.photos?.map(photo => (
                            <View key={photo.id} style={styles.photoContainer}>
                                <Image
                                    source={{ uri: photo.image_url }}
                                    style={styles.jobPhoto}
                                    contentFit="cover"
                                    transition={300}
                                />
                                <View style={styles.photoTag}>
                                    <Text style={styles.photoTagText}>{photo.tag}</Text>
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity onPress={handlePhotoUpload} style={styles.addPhotoBtn}>
                            <Camera size={32} color={COLORS.textTertiary} />
                            <Text style={styles.addPhotoText}>Add Photo</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {activeTab === 'notes' && (
                    <View style={{ gap: 16 }}>
                        {job.notes && (
                            <View style={styles.notesCard}>
                                <Text style={styles.notesBody}>{job.notes}</Text>
                            </View>
                        )}
                        <View style={styles.noteInputContainer}>
                            <TextInput
                                style={styles.noteInput}
                                placeholder="Add a note..."
                                placeholderTextColor={COLORS.textTertiary}
                                value={newNote}
                                onChangeText={setNewNote}
                                multiline
                            />
                            <TouchableOpacity onPress={handleAddNote} style={styles.sendNoteBtn}>
                                <Plus size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Fixed Action Bar */}
            <View style={styles.actionBar}>
                {job.status === 'pending' || job.status === 'paused' ? (
                    <TouchableOpacity onPress={() => handleStatusUpdate('in_progress')} style={styles.primaryAction}>
                        <PlayCircle size={20} color="white" />
                        <Text style={styles.actionLabel}>{job.status === 'paused' ? 'Resume Job' : 'Start Job'}</Text>
                    </TouchableOpacity>
                ) : job.status === 'in_progress' ? (
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={() => handleStatusUpdate('paused')} style={styles.pauseAction}>
                            <PauseCircle size={24} color={COLORS.warning} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleStatusUpdate('qc_pending')} style={styles.primaryAction}>
                            <CheckCircle2 size={20} color="white" />
                            <Text style={styles.actionLabel}>Request QC</Text>
                        </TouchableOpacity>
                    </View>
                ) : job.status === 'qc_pending' ? (
                    <View style={styles.waitingBadge}>
                        <Clock size={20} color={COLORS.warning} />
                        <Text style={styles.waitingText}>Awaiting QC Review...</Text>
                    </View>
                ) : job.status === 'qc_passed' ? (
                    <TouchableOpacity onPress={() => handleStatusUpdate('completed')} style={[styles.primaryAction, { backgroundColor: COLORS.success }]}>
                        <CheckCircle2 size={20} color="white" />
                        <Text style={styles.actionLabel}>Mark Complete</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Modals */}
            <AnimatePresence>
                {adjustingPart && (
                    <Modal transparent animationType="fade" visible={!!adjustingPart}>
                        <View style={styles.modalOverlay}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => setAdjustingPart(null)} />
                            <MotiView from={{ translateY: 100, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} style={styles.quickAdjustModal}>
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalIcon}><Package size={28} color={COLORS.primary} /></View>
                                    <Text style={styles.modalTitle}>{adjustingPart.productName || adjustingPart.part_name}</Text>
                                    <Text style={styles.modalSku}>{productForAdjustment?.sku || 'NO SKU'}</Text>
                                </View>

                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity onPress={() => handleUpdateQuantity(adjustingPart.quantity - 1)} style={styles.qtyBtn}>
                                        <Trash2 size={24} color={adjustingPart.quantity === 1 ? COLORS.danger : COLORS.textTertiary} />
                                    </TouchableOpacity>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.qtyValue}>{adjustingPart.quantity}</Text>
                                        <Text style={styles.qtyLabel}>Quantity</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleUpdateQuantity(adjustingPart.quantity + 1)} style={styles.qtyBtn}>
                                        <Plus size={24} color={COLORS.textTertiary} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={() => setAdjustingPart(null)} style={styles.modalDoneBtn}>
                                    <Text style={styles.modalDoneText}>DONE</Text>
                                </TouchableOpacity>
                            </MotiView>
                        </View>
                    </Modal>
                )}
            </AnimatePresence>

            {showPartsSelector && id && (
                <PartsSelectionModal
                    jobId={id}
                    onClose={() => setShowPartsSelector(false)}
                    onSuccess={() => { fetchJobDetails(); fetchRequisitions(); }}
                />
            )}

            {/* AI Diagnosis Modal */}
            <Modal transparent visible={showDiagnosisModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDiagnosisModal(false)} />
                    <MotiView
                        from={{ translateY: 100, opacity: 0 }}
                        animate={{ translateY: 0, opacity: 1 }}
                        style={[styles.quickAdjustModal, { minHeight: 400, alignItems: 'stretch' }]}
                    >
                        <View style={styles.modalBar} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ padding: 10, backgroundColor: COLORS.primarySurface, borderRadius: 12 }}>
                                    <Sparkles size={24} color={COLORS.primary} />
                                </View>
                                <View>
                                    <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' }}>AI Smart Diagnosis</Text>
                                    <Text style={{ color: COLORS.textTertiary, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Powered by Gemini</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setShowDiagnosisModal(false)} style={styles.modalClose}>
                                <X size={20} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 400 }}>
                            {diagnosisLoading ? (
                                <View style={{ paddingVertical: 40, alignItems: 'center', gap: 16 }}>
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' }}>Analyzing issue symptoms...</Text>
                                </View>
                            ) : (
                                <View style={{ backgroundColor: COLORS.cardBgAlt, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border }}>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 }}>
                                        {diagnosis}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        {!diagnosisLoading && (
                            <TouchableOpacity
                                onPress={() => setShowDiagnosisModal(false)}
                                style={[styles.modalDoneBtn, { marginTop: 24 }]}
                            >
                                <Text style={styles.modalDoneText}>CLOSE</Text>
                            </TouchableOpacity>
                        )}
                    </MotiView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
    vehicleName: { fontSize: TYPOGRAPHY.sizes.xxl, fontFamily: TYPOGRAPHY.families.black, color: COLORS.textPrimary, textTransform: 'uppercase' },
    plateNumber: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.primary, fontFamily: 'monospace', marginTop: SPACING.xs },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
    statusText: { fontSize: 10, fontFamily: TYPOGRAPHY.families.black, textTransform: 'uppercase' },
    infoText: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.families.regular },
    detailSection: { marginTop: SPACING.xl, padding: SPACING.md, backgroundColor: COLORS.cardBgAlt, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
    sectionHeader: { fontSize: TYPOGRAPHY.sizes.xxs, fontFamily: TYPOGRAPHY.families.bold, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: SPACING.md, letterSpacing: 1 },
    label: { fontSize: TYPOGRAPHY.sizes.xxs, color: COLORS.textTertiary, textTransform: 'uppercase', fontFamily: TYPOGRAPHY.families.bold },
    value: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.families.bold, marginTop: 2 },
    issueSection: { marginTop: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.cardBgAlt, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
    issueBody: { fontSize: TYPOGRAPHY.sizes.md, color: COLORS.textSecondary, lineHeight: 22, fontFamily: TYPOGRAPHY.families.regular },
    offlineBanner: { backgroundColor: COLORS.warningBg, paddingVertical: 8, paddingHorizontal: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    offlineText: { color: COLORS.warning, fontSize: TYPOGRAPHY.sizes.xxs, fontFamily: TYPOGRAPHY.families.bold, textTransform: 'uppercase' },
    offlineSubtext: { color: 'rgba(217, 119, 6, 0.6)', fontSize: 9, fontStyle: 'italic', fontFamily: TYPOGRAPHY.families.medium },
    tabContainer: { height: 60, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.cardBg },
    tabButton: { minWidth: 80, paddingHorizontal: SPACING.md, justifyContent: 'center', alignItems: 'center', gap: 4 },
    tabButtonActive: {},
    tabLabel: { fontSize: TYPOGRAPHY.sizes.xxs, fontFamily: TYPOGRAPHY.families.bold, color: COLORS.textTertiary },
    tabLabelActive: { color: COLORS.primary },
    tabIndicator: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, backgroundColor: COLORS.primary },
    categoryHeader: { fontSize: TYPOGRAPHY.sizes.xxs, fontFamily: TYPOGRAPHY.families.black, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: SPACING.md, paddingHorizontal: SPACING.sm, letterSpacing: 2 },
    searchResult: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 64, 175, 0.15)', padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: 'rgba(30, 64, 175, 0.3)' },
    checkItemCard: { backgroundColor: COLORS.cardBg, padding: SPACING.md, borderRadius: BORDER_RADIUS.xl, marginBottom: SPACING.sm, gap: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
    checkbox: { padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.cardBgAlt, borderWidth: 1, borderColor: COLORS.border },
    checkboxActive: { backgroundColor: COLORS.successBg, borderColor: COLORS.success + '20' },
    checkItemName: { fontSize: TYPOGRAPHY.sizes.lg, fontFamily: TYPOGRAPHY.families.bold, color: COLORS.textPrimary },
    checkItemNameDone: { color: COLORS.textTertiary, textDecorationLine: 'line-through' },
    checkItemImage: { width: 48, height: 48, borderRadius: BORDER_RADIUS.sm },
    evidenceText: { fontSize: TYPOGRAPHY.sizes.xxs, color: COLORS.textTertiary, fontFamily: TYPOGRAPHY.families.bold },
    cameraBtn: { padding: 10, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.cardBgAlt, borderWidth: 1, borderColor: COLORS.border },
    cameraBtnActive: { backgroundColor: COLORS.primarySurface, borderColor: COLORS.primary + '20' },
    conditionRow: { flexDirection: 'row', gap: SPACING.sm, backgroundColor: COLORS.pageBg, padding: 4, borderRadius: BORDER_RADIUS.lg },
    conditionBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BORDER_RADIUS.md },
    conditionText: { fontSize: TYPOGRAPHY.sizes.xxs, fontFamily: TYPOGRAPHY.families.black, color: COLORS.textTertiary, textTransform: 'uppercase' },
    conditionTextActive: { color: COLORS.white },
    conditionBtn_ok: { backgroundColor: COLORS.success },
    conditionBtn_fair: { backgroundColor: COLORS.warning },
    conditionBtn_bad: { backgroundColor: COLORS.danger },
    conditionBtn_na: { backgroundColor: COLORS.slate400 },
    sectionTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontFamily: TYPOGRAPHY.families.bold, color: COLORS.textPrimary },
    addPartBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primarySurface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
    addPartBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.xs, fontFamily: TYPOGRAPHY.families.bold },
    partItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.primarySurface, borderRadius: BORDER_RADIUS.xl, marginBottom: SPACING.sm, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', ...SHADOWS.sm },
    partName: { color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.families.bold, fontSize: TYPOGRAPHY.sizes.sm },
    partMeta: { fontSize: TYPOGRAPHY.sizes.xxs, color: COLORS.textSecondary, marginTop: 2, fontFamily: TYPOGRAPHY.families.medium },
    partPrice: { color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.families.bold },
    issuedIcon: { width: 32, height: 32, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center' },
    reqBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.full, marginTop: 4 },
    reqBadge_approved: { backgroundColor: COLORS.successBg },
    reqBadgeText: { fontSize: 8, fontFamily: TYPOGRAPHY.families.black, color: COLORS.textPrimary, textTransform: 'uppercase' },
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    photoContainer: { width: (Dimensions.get('window').width - 44) / 2, aspectRatio: 1, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    jobPhoto: { width: '100%', height: '100%' },
    photoTag: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.xs },
    photoTagText: { color: COLORS.white, fontSize: 10, fontFamily: TYPOGRAPHY.families.bold, textTransform: 'uppercase' },
    addPhotoBtn: { width: (Dimensions.get('window').width - 44) / 2, aspectRatio: 1, borderRadius: BORDER_RADIUS.lg, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.borderStrong, alignItems: 'center', justifyContent: 'center' },
    addPhotoText: { color: COLORS.textTertiary, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 8, fontFamily: TYPOGRAPHY.families.medium },
    notesCard: { backgroundColor: COLORS.cardBg, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
    notesBody: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.md, lineHeight: 22, fontFamily: TYPOGRAPHY.families.regular },
    noteInputContainer: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
    noteInput: { flex: 1, backgroundColor: COLORS.inputBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.md, minHeight: 50, fontFamily: TYPOGRAPHY.families.regular, borderWidth: 1, borderColor: COLORS.border },
    sendNoteBtn: { backgroundColor: COLORS.primary, width: 50, height: 50, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
    actionBar: { position: 'absolute', bottom: 24, left: 16, right: 16, height: 70 },
    primaryAction: { flex: 1, backgroundColor: COLORS.accent, borderRadius: BORDER_RADIUS.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOWS.md },
    pauseAction: { width: 70, height: 70, backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.xl, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
    actionLabel: { color: COLORS.white, fontFamily: TYPOGRAPHY.families.bold, fontSize: TYPOGRAPHY.sizes.lg },
    waitingBadge: { flex: 1, backgroundColor: COLORS.warningBg, borderRadius: BORDER_RADIUS.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.warning + '20' },
    waitingText: { color: COLORS.warning, fontFamily: TYPOGRAPHY.families.bold, fontSize: TYPOGRAPHY.sizes.lg },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'flex-end' },
    quickAdjustModal: { backgroundColor: '#0f1c3d', padding: SPACING.xl, borderTopLeftRadius: BORDER_RADIUS.xxl, borderTopRightRadius: BORDER_RADIUS.xxl, alignItems: 'center', borderWidth: 1, borderTopColor: 'rgba(59, 130, 246, 0.5)' },
    modalHeader: { alignItems: 'center', marginBottom: SPACING.xl },
    modalIcon: { width: 64, height: 64, backgroundColor: COLORS.cardBgAlt, borderRadius: BORDER_RADIUS.xl, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
    modalTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.xl, fontFamily: TYPOGRAPHY.families.bold },
    modalSku: { color: COLORS.textTertiary, fontSize: TYPOGRAPHY.sizes.xs, fontFamily: TYPOGRAPHY.families.bold, marginTop: 4 },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 40, marginBottom: SPACING.xl },
    qtyBtn: { width: 56, height: 56, backgroundColor: COLORS.cardBgAlt, borderRadius: BORDER_RADIUS.xl, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
    qtyValue: { fontSize: 48, fontFamily: TYPOGRAPHY.families.black, color: COLORS.textPrimary },
    qtyLabel: { color: COLORS.textTertiary, fontSize: TYPOGRAPHY.sizes.xxs, fontFamily: TYPOGRAPHY.families.bold, textTransform: 'uppercase' },
    modalDoneBtn: { backgroundColor: COLORS.primary, width: '100%', padding: 20, borderRadius: BORDER_RADIUS.xl, alignItems: 'center' },
    modalDoneText: { color: COLORS.white, fontFamily: TYPOGRAPHY.families.bold, letterSpacing: 2 },
    modalBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: COLORS.primary },
    modalClose: { padding: 10, backgroundColor: COLORS.cardBgAlt, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border }
});
