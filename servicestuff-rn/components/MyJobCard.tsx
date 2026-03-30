import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { MotiView } from 'moti';
import { JobCard } from '../types';

interface MyJobCardProps {
    job: JobCard;
    onClick: (id: string) => void;
    color: string;
    icon: React.ReactNode;
    label: string;
    isInitialMount: boolean;
}

const MyJobCard = React.memo(({ job, onClick, color, icon, label, isInitialMount }: MyJobCardProps) => (
    <MotiView
        from={isInitialMount ? { opacity: 0, translateY: 20 } : false}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 200 }}
    >
        <TouchableOpacity
            onPress={() => onClick(job.id)}
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(30, 41, 59, 1)', borderWidth: 1, padding: 16, borderRadius: 24, marginBottom: 16 }}
            activeOpacity={0.8}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        {job.ticket?.ticket_number || 'ST-0000'}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#f1f5f9' }}>
                        {job.vehicle?.model_name || 'Vehicle'}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: color.replace('text-', '').replace('400', '500').replace('500', 'rgba(59, 130, 246, 0.2)'), backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    {icon}
                    <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginLeft: 6, color: '#f1f5f9' }}>
                        {label}
                    </Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ backgroundColor: '#1e293b', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#334155', marginRight: 8 }}>
                    <Text style={{ fontSize: 10, color: '#cbd5e1', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                        {job.vehicle?.license_plate || 'N/A'}
                    </Text>
                </View>
                <Text style={{ fontSize: 10, color: '#64748b' }}>
                    {job.vehicle?.color || 'N/A'}
                </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(30, 41, 59, 0.5)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#94a3b8' }}>
                            {job.vehicle?.customer_name?.charAt(0) || '?'}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>
                        {job.vehicle?.customer_name || 'Anonymous'}
                    </Text>
                </View>
                <ChevronRight size={16} color="#475569" />
            </View>
        </TouchableOpacity>
    </MotiView>
), (prev, next) => prev.job.id === next.job.id && prev.job.status === next.job.status && prev.job.vehicle?.model_name === next.job.vehicle?.model_name);

MyJobCard.displayName = 'MyJobCard';

export default MyJobCard;
