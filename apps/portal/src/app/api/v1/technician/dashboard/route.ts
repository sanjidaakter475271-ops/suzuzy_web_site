import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();

        if (!technician) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (!technician.serviceStaffId) {
            return NextResponse.json({ error: 'Service Staff profile not found for this user' }, { status: 403 });
        }

        const staffId = technician.serviceStaffId;

        // 1. Get Job Stats
        const jobStats = await prisma.job_cards.groupBy({
            by: ['status'],
            where: {
                technician_id: staffId,
            },
            _count: {
                id: true,
            },
        });

        const pending = jobStats.find((s) => s.status === 'pending')?._count.id || 0;
        const active = jobStats.find((s) => s.status === 'in_progress')?._count.id || 0;
        const completed = jobStats.find((s) => s.status === 'completed' || s.status === 'verified')?._count.id || 0;
        const total = pending + active + completed;

        // 2. Get Today's Attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.technician_attendance.findFirst({
            where: {
                staff_id: staffId,
                OR: [
                    { clock_out: null },
                    { clock_in: { gte: today } }
                ]
            },
            orderBy: {
                clock_in: 'desc',
            },
            take: 1,
        });

        // Calculate hours worked today
        let hoursWorked = 0;
        if (attendance && attendance.clock_in) {
            const endTime = attendance.clock_out ? new Date(attendance.clock_out) : new Date();
            const diffMs = endTime.getTime() - new Date(attendance.clock_in).getTime();
            hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
        }

        // 3. Calculate Efficiency (Simplified for MVP)
        // Could track estimated vs actual time on completed jobs
        const efficiencyScore = 95; // Placeholder

        return NextResponse.json({
            stats: {
                pending,
                active,
                completed,
                total,
                efficiency_score: efficiencyScore,
                hours_worked: hoursWorked,
            },
            attendance: attendance
                ? {
                    id: attendance.id,
                    clockIn: attendance.clock_in,
                    clockOut: attendance.clock_out,
                    status: attendance.status,
                }
                : null,
        });
    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
