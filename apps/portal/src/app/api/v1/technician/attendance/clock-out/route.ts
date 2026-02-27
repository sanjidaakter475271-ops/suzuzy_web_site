import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function POST(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        if (!technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: 'Service Staff profile not found for this user' }, { status: 403 });
        }

        const activeSession = await prisma.technician_attendance.findFirst({
            where: {
                staff_id: technician.serviceStaffId,
                clock_out: null,
            },
            orderBy: { clock_in: 'desc' },
        });

        if (!activeSession) {
            return NextResponse.json({ success: false, error: 'No active session found' }, { status: 404 });
        }

        const updated = await prisma.technician_attendance.update({
            where: { id: activeSession.id },
            data: {
                clock_out: new Date(),
            },
        });

        const duration = updated.clock_out!.getTime() - activeSession.clock_in.getTime();

        return NextResponse.json({ success: true, data: { ...updated, durationMs: duration } });
    } catch (error: any) {
        console.error('Error clocking out:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
