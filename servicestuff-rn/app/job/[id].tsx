import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    TextInput,
    Alert,
    Platform,
    StyleSheet,
    Dimensions,
    Modal
} from 'react-native';
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
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import * as ImagePicker from 'expo-image-picker';

import { TechnicianAPI } from '../../services/api';
import { JobCard, ChecklistItem, ServiceCondition, PartsRequest, RoutePath } from '../../types';
import { TopBar } from '../../components/TopBar';
import { PartsSelectionModal } from '../../components/PartsSelectionModal';
import { OfflineService } from '../../services/offline';
import { LocationService } from '../../services/location';
import { MediaService } from '../../services/media';
import { SocketService } from '../../services/socket';
import { DetailSkeleton } from '../../components/Skeleton';

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
                await offlineService.queueAction('update_status', { jobId: job.id, status: newStatus });
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
        <View style={{ flex: 1, backgroundColor: '#020617', paddingTop: 60 }}>
            <DetailSkeleton />
        </View>
    );

    if (!job) return (
        <View style={{ flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white' }}>Job not found.</Text>
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
                    <View style={[styles.statusBadge, getStatusStyle(job.status || 'pending').badge]}>
                        <Text style={[styles.statusText, getStatusStyle(job.status || 'pending').text]}>
                            {job.status === 'in_progress' ? 'Active' : (job.status || 'pending').replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 16, marginTop: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <UserIcon size={16} color="#64748b" />
                        <Text style={styles.infoText}>{job.vehicle?.customer_name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Clock size={16} color="#64748b" />
                        <Text style={styles.infoText}>{new Date(job.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                <View style={styles.detailSection}>
                    <Text style={styles.sectionHeader}><Info size={12} color="#64748b" /> VEHICLE DETAILS</Text>
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
                    <Text style={styles.sectionHeader}><AlertTriangle size={12} color="#f59e0b" /> CUSTOMER ISSUE</Text>
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
                                            <CheckSquare size={20} color={item.is_completed ? '#10b981' : '#475569'} />
                                        </TouchableOpacity>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.checkItemName, item.is_completed && styles.checkItemNameDone]}>
                                                {item.name}
                                            </Text>
                                            {(item as any).photo_url && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                    <Image source={{ uri: (item as any).photo_url }} style={styles.checkItemImage} />
                                                    <Text style={styles.evidenceText}>Evidence Attached</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleChecklistPhoto(item)}
                                        style={[styles.cameraBtn, (item as any).photo_url && styles.cameraBtnActive]}
                                    >
                                        <Camera size={20} color={(item as any).photo_url ? '#3b82f6' : '#64748b'} />
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
        <View style={{ flex: 1, backgroundColor: '#020617' }}>
            <TopBar title={`Job #${job.service_number || id?.slice(0, 8)}`} showBack onBack={() => router.back()} />

            {!isOnline && (
                <View style={styles.offlineBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <WifiOff size={14} color="#f59e0b" />
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
                            <tab.icon size={20} color={activeTab === tab.id ? '#3b82f6' : '#64748b'} />
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
                                <Plus size={14} color="#3b82f6" />
                                <Text style={styles.addPartBtnText}>Add Part</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Issued Parts */}
                        {job.parts?.map(part => (
                            <View key={part.id} style={styles.partItem}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={styles.issuedIcon}><CheckCircle2 size={16} color="#3b82f6" /></View>
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
                                    <View style={[styles.issuedIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}><Clock size={16} color="#f59e0b" /></View>
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
                                <Image source={{ uri: photo.image_url }} style={styles.jobPhoto} />
                                <View style={styles.photoTag}>
                                    <Text style={styles.photoTagText}>{photo.tag}</Text>
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity onPress={handlePhotoUpload} style={styles.addPhotoBtn}>
                            <Camera size={32} color="#475569" />
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
                                placeholderTextColor="#475569"
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
                            <PauseCircle size={24} color="#f59e0b" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleStatusUpdate('qc_pending')} style={styles.primaryAction}>
                            <CheckCircle2 size={20} color="white" />
                            <Text style={styles.actionLabel}>Request QC</Text>
                        </TouchableOpacity>
                    </View>
                ) : job.status === 'qc_pending' ? (
                    <View style={styles.waitingBadge}>
                        <Clock size={20} color="#f59e0b" />
                        <Text style={styles.waitingText}>Awaiting QC Review...</Text>
                    </View>
                ) : job.status === 'qc_passed' ? (
                    <TouchableOpacity onPress={() => handleStatusUpdate('completed')} style={[styles.primaryAction, { backgroundColor: '#10b981' }]}>
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
                                    <View style={styles.modalIcon}><Package size={28} color="#3b82f6" /></View>
                                    <Text style={styles.modalTitle}>{adjustingPart.productName || adjustingPart.part_name}</Text>
                                    <Text style={styles.modalSku}>{productForAdjustment?.sku || 'NO SKU'}</Text>
                                </View>

                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity onPress={() => handleUpdateQuantity(adjustingPart.quantity - 1)} style={styles.qtyBtn}>
                                        <Trash2 size={24} color={adjustingPart.quantity === 1 ? '#f43f5e' : '#475569'} />
                                    </TouchableOpacity>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.qtyValue}>{adjustingPart.quantity}</Text>
                                        <Text style={styles.qtyLabel}>Quantity</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleUpdateQuantity(adjustingPart.quantity + 1)} style={styles.qtyBtn}>
                                        <Plus size={24} color="#475569" />
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
        </View>
    );
}

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'completed':
        case 'qc_passed':
        case 'verified':
            return { badge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }, text: { color: '#10b981' } };
        case 'in_progress':
            return { badge: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }, text: { color: '#3b82f6' } };
        default:
            return { badge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' }, text: { color: '#f59e0b' } };
    }
};

const styles = StyleSheet.create({
    card: { backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.5)' },
    vehicleName: { fontSize: 24, fontWeight: '900', color: 'white', textTransform: 'uppercase' },
    plateNumber: { fontSize: 14, color: '#60a5fa', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginTop: 4 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
    statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    infoText: { fontSize: 14, color: '#94a3b8' },
    detailSection: { marginTop: 24, padding: 16, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16 },
    sectionHeader: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
    label: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' },
    value: { fontSize: 14, color: '#cbd5e1', fontWeight: 'bold', marginTop: 2 },
    issueSection: { marginTop: 16, padding: 16, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16 },
    issueBody: { fontSize: 14, color: '#cbd5e1', lineHeight: 22 },
    offlineBanner: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    offlineText: { color: '#f59e0b', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    offlineSubtext: { color: 'rgba(245, 158, 11, 0.6)', fontSize: 9, fontStyle: 'italic' },
    tabContainer: { height: 60, borderBottomWidth: 1, borderBottomColor: 'rgba(30, 41, 59, 0.5)', backgroundColor: '#0f172a' },
    tabButton: { minWidth: 80, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', gap: 4 },
    tabButtonActive: {},
    tabLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
    tabLabelActive: { color: '#3b82f6' },
    tabIndicator: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, backgroundColor: '#3b82f6' },
    categoryHeader: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: 12, paddingHorizontal: 8, letterSpacing: 2 },
    checkItemCard: { backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 16, borderRadius: 24, marginBottom: 12, gap: 16 },
    checkbox: { padding: 8, borderRadius: 12, backgroundColor: '#0f172a' },
    checkboxActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    checkItemName: { fontSize: 16, fontWeight: 'bold', color: '#e2e8f0' },
    checkItemNameDone: { color: '#64748b', textDecorationLine: 'line-through' },
    checkItemImage: { width: 48, height: 48, borderRadius: 8 },
    evidenceText: { fontSize: 10, color: '#64748b', fontWeight: 'bold' },
    cameraBtn: { padding: 10, borderRadius: 12, backgroundColor: '#0f172a' },
    cameraBtnActive: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
    conditionRow: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 16 },
    conditionBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    conditionText: { fontSize: 10, fontWeight: '900', color: '#475569', textTransform: 'uppercase' },
    conditionTextActive: { color: 'white' },
    conditionBtn_ok: { backgroundColor: '#10b981' },
    conditionBtn_fair: { backgroundColor: '#f59e0b' },
    conditionBtn_bad: { backgroundColor: '#f43f5e' },
    conditionBtn_na: { backgroundColor: '#334155' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    addPartBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
    addPartBtnText: { color: '#3b82f6', fontSize: 12, fontWeight: 'bold' },
    partItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 24, marginBottom: 12 },
    partName: { color: '#f1f5f9', fontWeight: 'bold' },
    partMeta: { fontSize: 10, color: '#64748b', marginTop: 2 },
    partPrice: { color: '#cbd5e1', fontWeight: 'bold' },
    issuedIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignItems: 'center', justifyContent: 'center' },
    reqBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, marginTop: 4 },
    reqBadge_approved: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    reqBadgeText: { fontSize: 8, fontWeight: '900', color: 'white', textTransform: 'uppercase' },
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    photoContainer: { width: (Dimensions.get('window').width - 44) / 2, aspectRatio: 1, borderRadius: 16, overflow: 'hidden' },
    jobPhoto: { width: '100%', height: '100%' },
    photoTag: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    photoTagText: { color: 'white', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    addPhotoBtn: { width: (Dimensions.get('window').width - 44) / 2, aspectRatio: 1, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
    addPhotoText: { color: '#64748b', fontSize: 12, marginTop: 8 },
    notesCard: { backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
    notesBody: { color: '#cbd5e1', fontSize: 14, lineHeight: 22 },
    noteInputContainer: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
    noteInput: { flex: 1, backgroundColor: '#0f172a', borderRadius: 16, padding: 12, color: 'white', fontSize: 14, minHeight: 50 },
    sendNoteBtn: { backgroundColor: '#2563eb', width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    actionBar: { position: 'absolute', bottom: 24, left: 16, right: 16, height: 70 },
    primaryAction: { flex: 1, backgroundColor: '#2563eb', borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    pauseAction: { width: 70, height: 70, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
    actionLabel: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    waitingBadge: { flex: 1, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
    waitingText: { color: '#f59e0b', fontWeight: 'bold', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    quickAdjustModal: { backgroundColor: '#0f172a', padding: 32, borderTopLeftRadius: 40, borderTopRightRadius: 40, alignItems: 'center' },
    modalHeader: { alignItems: 'center', marginBottom: 24 },
    modalIcon: { width: 64, height: 64, backgroundColor: '#020617', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    modalSku: { color: '#64748b', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 40, marginBottom: 32 },
    qtyBtn: { width: 56, height: 56, backgroundColor: '#020617', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    qtyValue: { fontSize: 48, fontWeight: '900', color: 'white' },
    qtyLabel: { color: '#64748b', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    modalDoneBtn: { backgroundColor: '#020617', width: '100%', padding: 20, borderRadius: 24, alignItems: 'center' },
    modalDoneText: { color: 'white', fontWeight: '900', letterSpacing: 2 }
});
