import React from 'react';
import { Calendar } from 'lucide-react';
import { JobCard } from '../types';

interface DashboardJobCardsProps {
    tasks: JobCard[];
    onCardClick: (id: string) => void;
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
}

const TaskCard = React.memo(({ task, onClick, getStatusColor, getStatusIcon }: { task: JobCard, onClick: () => void, getStatusColor: (status: string) => string, getStatusIcon: (status: string) => React.ReactNode }) => (
    <div
        onClick={onClick}
        className="glass p-5 rounded-3xl shadow-xl shadow-black/10 active:scale-[0.98] cursor-pointer hover:border-blue-500/40 relative overflow-hidden group"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 dark:text-slate-100">{task.vehicle?.model_name || 'Unknown Model'}</h3>
            <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center border ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                {task.status === 'in_progress' ? 'Active' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1 font-mono bg-gray-100 dark:bg-slate-800 inline-block px-1.5 py-0.5 rounded text-xs tracking-wider">{task.vehicle?.license_plate || 'N/A'}</p>
        <p className="text-sm text-gray-600 dark:text-slate-300 mb-3 line-clamp-2">{task.vehicle?.issue_description || 'No Description'}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center text-xs text-gray-400 dark:text-slate-500">
                <Calendar size={12} className="mr-1" />
                {new Date(task.created_at).toLocaleDateString()}
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-slate-400">Owner: {task.vehicle?.customer_name || 'Unknown'}</p>
        </div>
    </div>
));
TaskCard.displayName = 'TaskCard';

export default function DashboardJobCards({ tasks, onCardClick, getStatusColor, getStatusIcon }: DashboardJobCardsProps) {
    return (
        <>
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onCardClick(task.id)}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                />
            ))}
        </>
    );
}
