import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';
import { startOfDay, endOfDay } from 'date-fns';

// Helper to convert Prisma Decimals to Numbers
const serialize = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(serialize);
    if (typeof obj === 'object') {
        if (obj.constructor && obj.constructor.name === 'Decimal') {
            return Number(obj);
        }
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = serialize(obj[key]);
        }
        return newObj;
    }
    return obj;
};

export async function GET(req: NextRequest) {
    console.log('[DASHBOARD_API] Request received');
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            console.warn('[DASHBOARD_API] Unauthorized or missing staff profile');
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const staffId = technician.serviceStaffId;
        console.log('[DASHBOARD_API] Authenticated. StaffID:', staffId);

        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        // 1. Fetch Job Stats
        console.log('[DASHBOARD_API] Step 1: Fetching jobs');
        let pending = 0, active = 0, completed = 0, total = 0;
        try {
            const jobs = await prisma.job_cards.findMany({
                where: {
                    technician_id: staffId,
                },
                select: {
                    status: true
                }
            });
            pending = jobs.filter(j => j.status === 'pending').length;
            active = jobs.filter(j => j.status === 'in_progress').length;
            completed = jobs.filter(j => j.status && ['completed', 'verified', 'delivered'].includes(j.status)).length;
            total = jobs.length;
        } catch (jobErr: any) {
            console.error('[DASHBOARD_API] Job fetch failed:', jobErr.message);
        }

        const efficiency_score = total > 0 ? Math.round((completed / total) * 100) : 100;

        // 2. Fetch Attendance for Today
        console.log('[DASHBOARD_API] Step 2: Fetching attendance');
        let totalMs = 0;
        try {
            const attendanceSessions = await prisma.technician_attendance.findMany({
                where: {
                    staff_id: staffId,
                    clock_in: {
                        gte: todayStart,
                        lte: todayEnd
                    }
                },
                include: {
                    attendance_shifts: true
                } as any
            });

            attendanceSessions.forEach((session: any) => {
                const shifts = session.attendance_shifts || [];
                shifts.forEach((shift: any) => {
                    if (shift.start_time) {
                        const start = new Date(shift.start_time).getTime();
                        const end = shift.end_time ? new Date(shift.end_time).getTime() : Date.now();
                        const duration = end - start;
                        if (duration > 0) totalMs += duration;
                    }
                });
            });
        } catch (attErr: any) {
            console.error('[DASHBOARD_API] Attendance fetch failed:', attErr.message);
        }

        const hours_worked = parseFloat((totalMs / (1000 * 60 * 60)).toFixed(1));

        console.log('[DASHBOARD_API] Returning response');
        return NextResponse.json({
            success: true,
            data: serialize({
                stats: {
                    pending,
                    active,
                    completed,
                    total,
                    efficiency_score,
                    hours_worked: hours_worked || 0,
                    earnings: 0,
                    daily_performance: [
                        { day: 'Mon', jobs: 4, efficiency: 90 },
                        { day: 'Tue', jobs: 6, efficiency: 95 },
                        { day: 'Wed', jobs: 3, efficiency: 85 },
                        { day: 'Thu', jobs: 8, efficiency: 98 },
                        { day: 'Fri', jobs: 5, efficiency: 92 },
                        { day: 'Sat', jobs: 2, efficiency: 80 },
                        { day: 'Sun', jobs: 0, efficiency: 0 }
                    ]
                }
            })
        });
    } catch (error: any) {
        console.error('[DASHBOARD_API_CRITICAL_FAILURE]', error?.code, error?.message, error?.meta?.driverAdapterError?.message);
        return NextResponse.json({
            success: false,
            error: 'Internal Server Error',
            details: error?.message || 'Critical system failure'
        }, { status: 500 });
    }
}
