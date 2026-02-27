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
            return NextResponse.json({ success: false, error: 'Service Staff profile not found for this user' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '30');

        const logs = await prisma.technician_attendance.findMany({
            where: {
                staff_id: technician.serviceStaffId,
            },
            orderBy: {
                clock_in: 'desc',
            },
            take: limit,
        });

        const formattedLogs = logs.map(log => {
            let duration = 0;
            if (log.clock_out instanceof Date && log.clock_in instanceof Date) {
                duration = log.clock_out.getTime() - log.clock_in.getTime();
            }
            return {
                id: log.id,
                clockIn: log.clock_in,
                clockOut: log.clock_out,
                status: log.status,
                durationMs: duration,
                date: log.clock_in ? log.clock_in.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            };
        });

        return NextResponse.json({ success: true, data: formattedLogs });
    } catch (error: any) {
        console.error('Error fetching attendance history:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
