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

        const { location, deviceId } = await req.json();

        // Check if already clocked in
        const existing = await prisma.technician_attendance.findFirst({
            where: {
                staff_id: technician.serviceStaffId,
                clock_out: null,
            },
        });

        if (existing) {
            return NextResponse.json({ success: false, error: 'Already clocked in' }, { status: 400 });
        }

        const attendance = await prisma.technician_attendance.create({
            data: {
                staff_id: technician.serviceStaffId,
                clock_in: new Date(),
                gps_lat: location?.lat || null,
                gps_lng: location?.lng || null,
                device_id: deviceId || null,
                status: 'present',
            },
        });

        return NextResponse.json({ success: true, data: attendance });
    } catch (error: any) {
        console.error('Error clocking in:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
