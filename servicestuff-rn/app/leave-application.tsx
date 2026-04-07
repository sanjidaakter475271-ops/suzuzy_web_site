import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions,
    Platform,
    Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    Calendar as CalendarIcon,
    User,
    Phone,
    MapPin,
    FileText,
    ChevronLeft,
    CheckCircle,
    X
} from '@/components/icons';
import { MotiView, AnimatePresence } from 'moti';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { TopBar } from '@/components/layout/TopBar';
import { TechnicianAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const { width } = Dimensions.get('window');

type LeaveType = 'Casual Leave' | 'Sick Leave';

export default function LeaveApplication() {
    const router = useRouter();
    const { user } = useAuthStore();

    // Form State
    const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
    const [hometown, setHometown] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectingDateType, setSelectingDateType] = useState<'start' | 'end'>('start');

    // Calendar Helper
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        // Shift start day to Saturday: (standard getDay() + 1) % 7
        const firstDay = (new Date(year, month, 1).getDay() + 1) % 7;
        const totalDays = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= totalDays; i++) days.push(i);
        return days;
    }, [currentMonth]);

    const handleDateSelect = (day: number) => {
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (selectingDateType === 'start') {
            setStartDate(selected);
            if (endDate && selected > endDate) setEndDate(null);
        } else {
            if (startDate && selected < startDate) {
                Alert.alert("Invalid Date", "End date cannot be before start date.");
                return;
            }
            setEndDate(selected);
        }
        setShowCalendar(false);
    };

    const handleSubmit = async () => {
        if (!startDate || !endDate || !reason.trim()) {
            Alert.alert("Missing Information", "Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await TechnicianAPI.applyForLeave({
                leaveType,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                reason,
                hometown,
                phoneNumber
            });

            if (res.data.success) {
                Alert.alert(
                    "Success",
                    "Your leave application has been submitted successfully.",
                    [{ text: "OK", onPress: () => router.back() }]
                );
            }
        } catch (err: any) {
            Alert.alert("Error", err.response?.data?.error || "Failed to submit leave application");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select Date';
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <View style={styles.container}>
            <TopBar title="Leave Application" showBack onBack={() => router.back()} />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollPadding}
                showsVerticalScrollIndicator={false}
            >
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    {/* Leave Type Selector */}
                    <Text style={styles.sectionLabel}>LEAVE TYPE</Text>
                    <View style={styles.typeSelector}>
                        {(['Casual Leave', 'Sick Leave'] as LeaveType[]).map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setLeaveType(type)}
                                style={[
                                    styles.typeBtn,
                                    leaveType === type && styles.typeBtnActive
                                ]}
                            >
                                <Text style={[
                                    styles.typeBtnText,
                                    leaveType === type && styles.typeBtnTextActive
                                ]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Basic Info */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <User size={18} color={COLORS.textTertiary} />
                            <TextInput
                                style={[styles.input, styles.readOnly]}
                                value={user?.name || 'Technician'}
                                editable={false}
                            />
                        </View>
                    </View>

                    <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Hometown</Text>
                            <View style={styles.inputContainer}>
                                <MapPin size={18} color={COLORS.textTertiary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Your address"
                                    placeholderTextColor={COLORS.textTertiary}
                                    value={hometown}
                                    onChangeText={setHometown}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Emergency Phone</Text>
                        <View style={styles.inputContainer}>
                            <Phone size={18} color={COLORS.textTertiary} />
                            <TextInput
                                style={styles.input}
                                placeholder="Contact number"
                                placeholderTextColor={COLORS.textTertiary}
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                            />
                        </View>
                    </View>

                    {/* Date Range Selection */}
                    <Text style={styles.sectionLabel}>DURATION</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity
                            onPress={() => { setSelectingDateType('start'); setShowCalendar(true); }}
                            style={styles.dateInput}
                        >
                            <Text style={styles.dateLabel}>Start Date</Text>
                            <View style={styles.dateValueContainer}>
                                <CalendarIcon size={16} color={COLORS.primary} />
                                <Text style={[styles.dateValue, !startDate && styles.datePlaceholder]}>
                                    {formatDate(startDate)}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.dateArrow}>
                            <FileText size={14} color={COLORS.textTertiary} />
                        </View>

                        <TouchableOpacity
                            onPress={() => { setSelectingDateType('end'); setShowCalendar(true); }}
                            style={styles.dateInput}
                        >
                            <Text style={styles.dateLabel}>End Date</Text>
                            <View style={styles.dateValueContainer}>
                                <CalendarIcon size={16} color={COLORS.primary} />
                                <Text style={[styles.dateValue, !endDate && styles.datePlaceholder]}>
                                    {formatDate(endDate)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Reason/Details */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Details / Reason</Text>
                        <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingVertical: 12 }]}>
                            <FileText size={18} color={COLORS.textTertiary} style={{ marginTop: 2 }} />
                            <TextInput
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                placeholder="Explain why you need leave..."
                                placeholderTextColor={COLORS.textTertiary}
                                multiline
                                value={reason}
                                onChangeText={setReason}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? (
                            <Text style={styles.submitBtnText}>Submitting...</Text>
                        ) : (
                            <>
                                <CheckCircle size={20} color="white" />
                                <Text style={styles.submitBtnText}>Submit Application</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </MotiView>
            </ScrollView>

            {/* Visual Calendar Modal */}
            <Modal transparent visible={showCalendar} animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowCalendar(false)} />
                    <MotiView
                        from={{ translateY: 100, opacity: 0 }}
                        animate={{ translateY: 0, opacity: 1 }}
                        style={styles.calendarModal}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Select {selectingDateType === 'start' ? 'Start' : 'End'} Date
                            </Text>
                            <TouchableOpacity onPress={() => setShowCalendar(false)}>
                                <X size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.monthNav}>
                            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                                <ChevronLeft size={24} color={COLORS.primary} />
                            </TouchableOpacity>
                            <Text style={styles.monthName}>
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </Text>
                            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                                <ChevronLeft size={24} color={COLORS.primary} style={{ transform: [{ rotate: '180deg' }] }} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.calendarHeader}>
                            {['S', 'S', 'M', 'T', 'W', 'T', 'F'].map((d, i) => (
                                <Text key={i} style={styles.calendarDayHeader}>{d}</Text>
                            ))}
                        </View>

                        <View style={styles.calendarGrid}>
                            {daysInMonth.map((day, idx) => {
                                const isFriday = (idx + 1) % 7 === 0;
                                const isSelected = day && (
                                    (selectingDateType === 'start' && startDate?.getDate() === day && startDate?.getMonth() === currentMonth.getMonth()) ||
                                    (selectingDateType === 'end' && endDate?.getDate() === day && endDate?.getMonth() === currentMonth.getMonth())
                                );

                                return (
                                    <View key={idx} style={styles.calendarCell}>
                                        {day && (
                                            <TouchableOpacity
                                                onPress={() => handleDateSelect(day)}
                                                style={[
                                                    styles.calendarDay,
                                                    isFriday && styles.calendarFriday,
                                                    isSelected && styles.calendarSelectedDay
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.calendarDayText,
                                                    (isFriday || isSelected) && { color: 'white' }
                                                ]}>
                                                    {day}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </MotiView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.pageBg,
    },
    content: {
        flex: 1,
    },
    scrollPadding: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    sectionLabel: {
        fontSize: 10,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.primary,
        letterSpacing: 2,
        marginBottom: 16,
        marginTop: 8,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    typeBtnActive: {
        backgroundColor: COLORS.primarySurface,
        borderColor: COLORS.primary,
    },
    typeBtnText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textSecondary,
    },
    typeBtnTextActive: {
        color: COLORS.primary,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontFamily: TYPOGRAPHY.families.medium,
        color: COLORS.textTertiary,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        height: 52,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.families.regular,
        fontSize: TYPOGRAPHY.sizes.md,
        marginLeft: 12,
    },
    readOnly: {
        color: COLORS.textSecondary,
    },
    formRow: {
        flexDirection: 'row',
        gap: 16,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
    },
    dateInput: {
        flex: 1,
        backgroundColor: COLORS.cardBg,
        borderRadius: BORDER_RADIUS.lg,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dateLabel: {
        fontSize: 9,
        color: COLORS.textTertiary,
        fontFamily: TYPOGRAPHY.families.bold,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    dateValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateValue: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.families.bold,
    },
    datePlaceholder: {
        color: COLORS.textTertiary,
        fontFamily: TYPOGRAPHY.families.regular,
    },
    dateArrow: {
        marginTop: 18,
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.xl,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 16,
        ...SHADOWS.md,
    },
    submitBtnText: {
        color: 'white',
        fontSize: TYPOGRAPHY.sizes.md,
        fontFamily: TYPOGRAPHY.families.bold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
        justifyContent: 'flex-end',
    },
    calendarModal: {
        backgroundColor: COLORS.cardBg,
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderStrong,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textPrimary,
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: COLORS.pageBg,
        padding: 8,
        borderRadius: BORDER_RADIUS.md,
    },
    monthName: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textPrimary,
    },
    calendarHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    calendarDayHeader: {
        flex: 1,
        textAlign: 'center',
        fontSize: 10,
        fontFamily: TYPOGRAPHY.families.bold,
        color: COLORS.textTertiary,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        padding: 4,
    },
    calendarDay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.pageBg,
    },
    calendarDayText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontFamily: TYPOGRAPHY.families.medium,
        color: COLORS.textSecondary,
    },
    calendarFriday: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    calendarSelectedDay: {
        backgroundColor: COLORS.primary,
    }
});
