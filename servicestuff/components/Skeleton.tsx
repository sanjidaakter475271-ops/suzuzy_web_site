import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    borderRadius = '0.75rem'
}) => {
    return (
        <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={`bg-slate-800/50 ${className}`}
            style={{
                width: width || '100%',
                height: height || '1rem',
                borderRadius: borderRadius
            }}
        />
    );
};

export const JobCardSkeleton = () => (
    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <Skeleton width={60} height={12} />
                <Skeleton width={140} height={20} />
            </div>
            <Skeleton width={70} height={20} borderRadius="0.375rem" />
        </div>
        <div className="flex gap-2">
            <Skeleton width={80} height={16} borderRadius="0.25rem" />
            <Skeleton width={40} height={16} borderRadius="0.25rem" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
            <div className="flex items-center gap-2">
                <Skeleton width={24} height={24} borderRadius="999px" />
                <Skeleton width={80} height={14} />
            </div>
            <Skeleton width={16} height={16} />
        </div>
    </div>
);

export const DetailSkeleton = () => (
    <div className="space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton width={180} height={32} />
                    <Skeleton width={100} height={16} />
                </div>
                <Skeleton width={100} height={28} borderRadius="999px" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton height={20} />
                <Skeleton height={20} />
            </div>
            <Skeleton height={80} borderRadius="1rem" />
        </div>
        <div className="space-y-3">
            <Skeleton width={100} height={14} className="ml-2" />
            <Skeleton height={60} borderRadius="1rem" />
            <Skeleton height={60} borderRadius="1rem" />
        </div>
    </div>
);
export const DashboardSkeleton = () => (
    <div className="space-y-6">
        {/* Attendance Skeleton */}
        <div className="p-4 pb-0">
            <Skeleton height={80} borderRadius="1rem" className="bg-blue-900/20" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="p-4 grid grid-cols-2 gap-4">
            <Skeleton height={80} borderRadius="0.75rem" className="col-span-2" />
            <Skeleton height={80} borderRadius="0.75rem" />
            <Skeleton height={80} borderRadius="0.75rem" />
            <Skeleton height={100} borderRadius="1rem" className="col-span-2" />
        </div>

        {/* Recent Tasks Title */}
        <div className="px-4 flex justify-between items-center">
            <Skeleton width={120} height={24} />
            <Skeleton width={32} height={32} borderRadius="0.5rem" />
        </div>

        {/* Task List Skeleton */}
        <div className="px-4 space-y-4">
            <JobCardSkeleton />
            <JobCardSkeleton />
        </div>
    </div>
);
