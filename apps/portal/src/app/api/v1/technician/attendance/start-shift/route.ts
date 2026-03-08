import { NextRequest, NextResponse } from "next/server";
import { getCurrentTechnician } from "@/lib/auth/get-technician";
import { prisma } from "@/lib/prisma/client";
import { broadcastEvent } from "@/lib/socket-server";

export async function POST(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        if (!technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: 'Service Staff profile not found for this user' }, { status: 403 });
        }

        // 1. Find active session
        const activeSession = await prisma.technician_attendance.findFirst({
            where: {
                staff_id: technician.serviceStaffId,
                clock_out: null,
            },
            orderBy: { clock_in: 'desc' },
        });

        if (!activeSession) {
            return NextResponse.json({ success: false, error: 'You must be clocked in to start a shift' }, { status: 400 });
        }

        // 2. Check for active shift
        const activeShift = await (prisma as any).attendance_shifts.findFirst({
            where: {
                attendance_id: activeSession.id,
                end_time: null
            }
        });

        if (activeShift) {
            return NextResponse.json({ success: false, error: 'A shift is already active' }, { status: 400 });
        }

        // 3. Create new shift
        const shift = await (prisma as any).attendance_shifts.create({
            data: {
                attendance_id: activeSession.id,
                start_time: new Date()
            }
        });

        // 4. Broadcast event
        await broadcastEvent('attendance:shift_start', {
            dealerId: technician.dealerId,
            technicianId: technician.serviceStaffId,
            staffId: technician.serviceStaffId,
            attendanceId: activeSession.id,
            startTime: shift.start_time
        });

        return NextResponse.json({
            success: true,
            data: shift
        });

    } catch (error: any) {
        console.error('Error starting shift:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
