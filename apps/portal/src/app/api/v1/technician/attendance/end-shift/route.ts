import { NextRequest, NextResponse } from "next/server";
import { getCurrentTechnician } from "@/lib/auth/get-technician";
import { prisma } from "@/lib/prisma/client";
import { broadcastEvent } from "@/lib/socket-server";

export async function POST(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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
            return NextResponse.json({ success: false, error: 'No active session found' }, { status: 404 });
        }

        // 2. Find and close active shift
        const activeShift = await (prisma as any).attendance_shifts.findFirst({
            where: {
                attendance_id: activeSession.id,
                end_time: null
            }
        });

        if (!activeShift) {
            return NextResponse.json({ success: false, error: 'No active shift to end' }, { status: 400 });
        }

        const updatedShift = await (prisma as any).attendance_shifts.update({
            where: { id: activeShift.id },
            data: { end_time: new Date() }
        });

        // 3. Broadcast Event
        await broadcastEvent('attendance:shift_end', {
            dealerId: technician.dealerId,
            technicianId: technician.serviceStaffId,
            staffId: technician.serviceStaffId,
            attendanceId: activeSession.id,
            endTime: updatedShift.end_time
        });

        return NextResponse.json({
            success: true,
            data: updatedShift
        });

    } catch (error: any) {
        console.error('Error ending shift:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
