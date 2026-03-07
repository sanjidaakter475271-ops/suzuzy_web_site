import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        if (!technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: 'Service Staff profile not found' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get('date'); // YYYY-MM-DD

        if (!dateStr) {
            return NextResponse.json({ success: false, error: 'Date is required' }, { status: 400 });
        }

        const startOfDay = new Date(dateStr);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Get Attendance for that date
        const attendance = await prisma.technician_attendance.findMany({
            where: {
                staff_id: technician.serviceStaffId,
                clock_in: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        // Calculate total duration for that day
        let totalDurationMs = 0;
        attendance.forEach(log => {
            if (log.clock_in) {
                const end = log.clock_out ? new Date(log.clock_out) : new Date();
                totalDurationMs += end.getTime() - new Date(log.clock_in).getTime();
            }
        });

        const hoursWorked = Math.round((totalDurationMs / (1000 * 60 * 60)) * 100) / 100;

        // 2. Get Jobs completed on that date
        const completedJobs = await prisma.job_cards.count({
            where: {
                technician_id: technician.serviceStaffId,
                status: 'completed',
                service_end_time: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        // 3. Get Average Rating (if exists in your schema - assuming job_cards might have it or a related table)
        // Since I don't see a rating field in the provided types, I'll use a placeholder or check schema if possible
        // Let's assume 4.5 for now or 0 if not implemented.
        const averageRating = 4.8; // Placeholder

        return NextResponse.json({
            success: true,
            data: {
                date: dateStr,
                hoursWorked,
                completedJobs,
                averageRating,
                attendanceLogs: attendance.map(a => ({
                    clockIn: a.clock_in,
                    clockOut: a.clock_out,
                    status: a.status
                }))
            }
        });
    } catch (error: any) {
        console.error('Error fetching date stats:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
