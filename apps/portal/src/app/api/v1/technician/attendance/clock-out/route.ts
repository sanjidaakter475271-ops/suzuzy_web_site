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

        const { location, qr_code } = await req.json();

        const cleaned_qr = qr_code.trim();

        // 2. Validate QR Code format
        const match = cleaned_qr.match(/^SUZUKY-WS-([0-9a-f-]{36})-([0-9a-fA-F-]+)$/i);
        if (!match) {
            return NextResponse.json({ success: false, error: 'Invalid QR Code format' }, { status: 400 });
        }

        const dealerIdFromQr = match[1];
        const qrSecret = match[2];

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

        // 2. Find active session
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

        // 3. Auto-close any active shift
        await (prisma as any).attendance_shifts.updateMany({
            where: {
                attendance_id: activeSession.id,
                end_time: null
            },
            data: {
                end_time: new Date()
            }
        });

        // 4. Update attendance record
        const updated = await prisma.technician_attendance.update({
            where: { id: activeSession.id },
            data: {
                clock_out: new Date(),
                clock_out_qr_code: qr_code,
                clock_out_gps_lat: location?.lat || null,
                clock_out_gps_lng: location?.lng || null
            } as any,
        });

        // 5. Broadcast Realtime Update
        const { broadcastEvent } = await import('@/lib/socket-server');
        await broadcastEvent('attendance:changed', {
            technicianId: technician.serviceStaffId,
            staffId: technician.serviceStaffId,
            type: 'clock_out'
        });

        const duration = updated.clock_out!.getTime() - activeSession.clock_in.getTime();

        return NextResponse.json({
            success: true,
            data: {
                id: updated.id,
                clockIn: updated.clock_in,
                clockOut: updated.clock_out,
                status: updated.status,
                durationMs: duration
            }
        });
    } catch (error: any) {
        console.error('Error clocking out:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
