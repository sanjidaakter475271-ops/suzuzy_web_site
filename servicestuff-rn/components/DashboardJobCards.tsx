import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Calendar, Clock, CheckCircle, AlertCircle, X } from 'lucide-react-native';
import { JobCard } from '../types';
import { FlashList } from '@shopify/flash-list';

interface DashboardJobCardsProps {
    tasks: JobCard[];
    onCardClick: (id: string) => void;
}

const TaskCard = React.memo(({ task, onCardClick }: { task: JobCard, onCardClick: (id: string) => void }) => {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed':
            case 'qc_passed':
            case 'verified':
                return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: '#10b981', icon: <CheckCircle size={14} color="#10b981" /> };
            case 'in_progress':
                return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6', icon: <Clock size={14} color="#3b82f6" /> };
            case 'qc_pending':
                return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b', icon: <AlertCircle size={14} color="#f59e0b" /> };
            case 'qc_failed':
                return { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.2)', text: '#f43f5e', icon: <X size={14} color="#f43f5e" /> };
            default:
                return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b', icon: <AlertCircle size={14} color="#f59e0b" /> };
        }
    };

    const style = getStatusStyle(task.status);

    return (
        <TouchableOpacity
            onPress={() => onCardClick(task.id)}
            style={{
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                padding: 20,
                borderRadius: 32,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.05)',
                marginBottom: 16
            }}
            activeOpacity={0.8}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{task.vehicle?.model_name || 'Unknown Model'}</Text>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderWidth: 1,
                    backgroundColor: style.bg,
                    borderColor: style.border
                }}>
                    {style.icon}
                    <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 4, color: style.text }}>
                        {task.status === 'in_progress' ? 'Active' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Text>
                </View>
            </View>

            <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 }}>
                <Text style={{ fontSize: 10, color: '#64748b', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1 }}>
                    {task.vehicle?.license_plate || 'N/A'}
                </Text>
            </View>

            <Text numberOfLines={2} style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                {task.vehicle?.issue_description || 'No Description'}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Calendar size={12} color="#475569" />
                    <Text style={{ fontSize: 11, color: '#475569' }}>{new Date(task.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#64748b' }}>Owner: {task.vehicle?.customer_name || 'Unknown'}</Text>
            </View>
        </TouchableOpacity>
    );
});

TaskCard.displayName = 'TaskCard';

export default function DashboardJobCards({ tasks, onCardClick }: DashboardJobCardsProps) {
    return (
        <FlashList
            data={tasks}
            renderItem={({ item }) => (
                <TaskCard
                    task={item}
                    onCardClick={onCardClick}
                />
            )}
            // @ts-ignore
            estimatedItemSize={160}
            scrollEnabled={false}
        />
    );
}
