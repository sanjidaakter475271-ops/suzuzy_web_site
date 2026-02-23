'use client';

import React from 'react';
import {
    Send,
    CheckCircle2,
    XCircle,
    Search,
    MessageSquare,
    Clock
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { Card, CardContent } from '@/components/ui';
import { useCRMStore } from '@/stores/crmStore';
import { cn } from '@/lib/utils'; // Assuming utils exists

const ReminderLogsPage = () => {
    const { reminderLogs } = useCRMStore();

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-fade">
            <Breadcrumb items={[{ label: 'CRM', href: '/crm' }, { label: 'Reminder Logs' }]} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-ink-heading dark:text-white">Communication Log</h1>
                    <p className="text-sm text-ink-muted">History of automated SMS and WhatsApp messages.</p>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-page dark:bg-dark-page/50 border-b border-surface-border dark:border-dark-border">
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Status</th>
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Channel</th>
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Customer</th>
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Message</th>
                                <th className="p-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Sent At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border dark:divide-dark-border/50">
                            {reminderLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-brand-soft/10 transition-colors">
                                    <td className="p-4">
                                        {log.status === 'sent' || log.status === 'delivered' ? (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-success">
                                                <CheckCircle2 size={14} />
                                                {log.status}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-danger">
                                                <XCircle size={14} />
                                                {log.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-black uppercase",
                                            log.type === 'whatsapp' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            <MessageSquare size={12} />
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-sm text-ink-heading dark:text-white">
                                        {log.customerId}
                                    </td>
                                    <td className="p-4 text-xs text-ink-muted max-w-sm truncate">
                                        {log.message}
                                    </td>
                                    <td className="p-4 text-xs font-bold text-ink-muted">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} />
                                            {new Date(log.sentAt).toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ReminderLogsPage;
