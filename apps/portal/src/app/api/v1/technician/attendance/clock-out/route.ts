import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function POST(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (!technician.serviceStaffId) {
            return NextResponse.json({ error: 'Service Staff profile not found for this user' }, { status: 403 });
        }

        const { location, deviceId } = await req.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeSession = await prisma.technician_attendance.findFirst({
            where: {
                staff_id: technician.serviceStaffId,
                clock_out: null,
            },
            orderBy: { clock_in: 'desc' },
        });

        if (!activeSession) {
            return NextResponse.json({ error: 'No active session found' }, { status: 404 });
        }

        const updated = await prisma.technician_attendance.update({
            where: { id: activeSession.id },
            data: {
                clock_out: new Date(),
                // gps_lat: location?.lat, // Maybe separate columns for clock-out location? Schema review needed.
                // Usually schema has one lat/lng, maybe for clock-in?
                // Or specific out location?
                // Current schema: gps_lat, gps_lng. Could be clock-in only.
            },
        });

        // Calculate duration
        const duration = updated.clock_out!.getTime() - activeSession.clock_in.getTime();

        return NextResponse.json({ success: true, duration });
    } catch (error: any) {
        console.error('Error clocking out:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
