import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/get-user';
import { prisma } from '@/lib/prisma/client';
import ProfileClient from './ProfileClient';
import { format } from 'date-fns';

export default async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user || !user.userId) {
        redirect('/login');
    }

    // Fetch User Profile
    const profile = await prisma.profiles.findUnique({
        where: { id: user.userId },
        include: {
            roles: true,
        }
    });

    if (!profile) {
        redirect('/login');
    }

    const dealerId = user.dealerId || undefined;

    // Fetch Stats
    const [salesSum, expensesSum, activeJobs, stockLocations, jobEvents] = await Promise.all([
        prisma.sales.aggregate({
            _sum: { grand_total: true },
            where: { dealer_id: dealerId }
        }),
        prisma.expenses.aggregate({
            _sum: { amount: true },
            where: { dealer_id: dealerId, status: 'approved' }
        }),
        prisma.job_cards.count({
            where: {
                dealer_id: dealerId,
                status: { in: ['pending', 'in_progress', 'assigned'] }
            }
        }),
        prisma.stock_locations.findMany({
            where: { dealer_id: dealerId },
            take: 3
        }),
        prisma.job_events.findMany({
            where: { actor_id: user.userId },
            orderBy: { created_at: 'desc' },
            take: 5
        })
    ]);

    const stats = [
        {
            label: "Total Sales Managed",
            value: Number(salesSum?._sum?.grand_total || 0),
            prefix: "৳",
            className: "border-l-4 border-l-brand"
        },
        {
            label: "Expenses Approved",
            value: Number(expensesSum?._sum?.amount || 0),
            prefix: "৳",
            className: "border-l-4 border-l-brand-light"
        },
        {
            label: "Reports Generated",
            value: 0,
            suffix: " Files",
            className: "border-l-4 border-l-success"
        },
        {
            label: "Active Projects",
            value: activeJobs || 0,
            className: "border-l-4 border-l-brand"
        },
    ];

    const userData = {
        id: profile.id,
        name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
        username: profile.email?.split('@')[0] || 'user',
        email: profile.email || '',
        phone: profile.phone || '',
        location: 'Not Set',
        bio: '',
        warehouse: stockLocations[0]?.name || 'Not Assigned',
        joinedDate: profile.created_at ? format(new Date(profile.created_at), 'MMM yyyy') : 'N/A',
        status: profile.status || 'Active'
    };

    const warehouses = stockLocations.map((loc, index) => ({
        name: loc.name,
        isPrimary: index === 0 || !!loc.is_default
    }));

    const activities = jobEvents.length > 0 ? jobEvents.map(event => ({
        title: event.description || 'Activity',
        time: event.created_at ? format(new Date(event.created_at), 'PPp') : 'Recently',
        iconType: (event.event_type?.toLowerCase().includes('create') ? 'check' : 'edit') as any,
        color: 'text-brand bg-brand/10',
        category: (event.event_type || 'Activity').toUpperCase(),
    })) : [
        {
            title: 'No recent activities found',
            time: 'N/A',
            iconType: 'globe' as any,
            color: 'text-ink-muted bg-surface-border',
            category: 'SYSTEM'
        }
    ];

    return (
        <ProfileClient
            userData={userData}
            stats={stats}
            warehouses={warehouses}
            activities={activities}
        />
    );
}
