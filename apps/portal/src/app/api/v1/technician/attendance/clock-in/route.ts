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

        const { location, deviceId, qr_code } = await req.json();

        const cleaned_qr = qr_code.trim();

        // 2. Validate QR Code format
        // Expected format: SUZUKY-WS-DEALER_ID-SECRET
        const match = cleaned_qr.match(/^SUZUKY-WS-([0-9a-f-]{36})-([0-9a-fA-F-]+)$/i);

        if (!match) {
            return NextResponse.json({ success: false, error: 'Invalid QR Code format' }, { status: 400 });
        }

        const dealerIdFromQr = match[1];
        const qrSecret = match[2];

        // Case-insensitive comparison for dealerId
        if (!technician.dealerId || dealerIdFromQr.toLowerCase() !== technician.dealerId.toLowerCase()) {
            return NextResponse.json({ success: false, error: 'This QR code belongs to a different dealer' }, { status: 403 });
        }

        const validQr = await (prisma as any).workshop_qr_codes.findFirst({
            where: {
                dealer_id: technician.dealerId as string,
                qr_secret: qrSecret,
                is_active: true
            }
        });

        if (!validQr) {
            return NextResponse.json({ success: false, error: 'Unauthorized or invalid Workshop QR code' }, { status: 403 });
        }

        // 2. Check if already clocked in (has an OPEN session)
        const openSession = await prisma.technician_attendance.findFirst({
            where: {
                staff_id: technician.serviceStaffId,
                clock_out: null,
            },
        });

        if (openSession) {
            return NextResponse.json({ success: false, error: 'You are already clocked in' }, { status: 400 });
        }

        // 3. Create new attendance session
        const attendance = await prisma.technician_attendance.create({
            data: {
                staff_id: technician.serviceStaffId,
                clock_in: new Date(),
                gps_lat: location?.lat || null,
                gps_lng: location?.lng || null,
                device_id: deviceId || null,
                status: 'present',
                clock_in_qr_code: qr_code
            } as any,
        });

        // 4. Broadcast Realtime Update
        const { broadcastEvent } = await import('@/lib/socket-server');
        await broadcastEvent('attendance:changed', {
            technicianId: technician.serviceStaffId,
            staffId: technician.serviceStaffId,
            type: 'clock_in'
        });

        return NextResponse.json({
            success: true,
            data: {
                id: attendance.id,
                clockIn: attendance.clock_in,
                clockOut: attendance.clock_out,
                status: attendance.status,
            }
        });
    } catch (error: any) {
        console.error('Error clocking in:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
