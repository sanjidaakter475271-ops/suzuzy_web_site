import { NextRequest, NextResponse } from "next/server";
import { getCurrentTechnician } from "@/lib/auth/get-technician";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get the latest attendance record (potentially active)
        const latestAttendance = await prisma.technician_attendance.findFirst({
            where: { staff_id: technician.serviceStaffId },
            include: {
                attendance_shifts: {
                    orderBy: { start_time: 'desc' }
                }
            } as any,
            orderBy: { clock_in: 'desc' },
        });

        // 2. Determine Current State
        let currentState: 'NOT_CHECKED_IN' | 'CHECKED_IN_IDLE' | 'SHIFT_ACTIVE' | 'SHIFT_PAUSED' | 'CHECKED_OUT' = 'NOT_CHECKED_IN';
        let isShiftActive = false;
        let currentShiftStartedAt: Date | null = null;

        if (!latestAttendance) {
            currentState = 'NOT_CHECKED_IN';
        } else if (latestAttendance.clock_out) {
            // Check if clocked out today
            const now = new Date();
            const clockOutDate = new Date(latestAttendance.clock_out);
            if (clockOutDate.toDateString() === now.toDateString()) {
                currentState = 'CHECKED_OUT';
            } else {
                currentState = 'NOT_CHECKED_IN';
            }
        } else {
            // Clocked in but not clocked out (active session)
            const shifts = (latestAttendance as any).attendance_shifts || [];
            const activeShift = shifts.find((s: any) => !s.end_time);

            if (activeShift) {
                currentState = 'SHIFT_ACTIVE';
                isShiftActive = true;
                currentShiftStartedAt = activeShift.start_time;
            } else if (shifts.length > 0) {
                currentState = 'SHIFT_PAUSED';
            } else {
                currentState = 'CHECKED_IN_IDLE';
            }
        }

        // 3. Calculate Total Work Time for the Whole DAY
        // This satisfies the requirement: "jodi first check in a 1 h kaj kore then check out kore then abr check in kore 2 h kaj kore tokhon se 3h kaj count hobe"
        let totalWorkTimeMs = 0;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todaysAttendance = await prisma.technician_attendance.findMany({
            where: {
                staff_id: technician.serviceStaffId,
                clock_in: { gte: startOfToday }
            },
            include: { attendance_shifts: true } as any
        });

        todaysAttendance.forEach(a => {
            const shifts = (a as any).attendance_shifts || [];
            shifts.forEach((s: any) => {
                if (s.start_time && s.end_time) {
                    totalWorkTimeMs += new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
                } else if (s.start_time && !s.end_time) {
                    // Ongoing shift: include time up to now
                    totalWorkTimeMs += Date.now() - new Date(s.start_time).getTime();
                }
            });
        });

        // 4. Format sessions/history (last 7 days)
        const recentAttendance = await prisma.technician_attendance.findMany({
            where: { staff_id: technician.serviceStaffId },
            include: {
                attendance_shifts: {
                    orderBy: { start_time: 'asc' }
                }
            } as any,
            orderBy: { clock_in: 'desc' },
            take: 7
        });

        const formattedSessions = recentAttendance.map(a => {
            const shifts = (a as any).attendance_shifts?.map((s: any) => ({
                id: s.id,
                attendance_id: s.attendance_id,
                start_time: s.start_time,
                end_time: s.end_time,
                created_at: s.created_at
            })) || [];

            return {
                id: a.id,
                clockIn: a.clock_in,
                clockOut: a.clock_out,
                shifts
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                currentState,
                isCheckedIn: !!latestAttendance && !latestAttendance.clock_out,
                isShiftActive,
                currentShiftStartedAt,
                activeSessionId: (latestAttendance && !latestAttendance.clock_out) ? latestAttendance.id : null,
                totalWorkTimeMs,
                sessions: formattedSessions
            }
        });

    } catch (error: any) {
        console.error('[ATTENDANCE_STATUS] Error:', error?.code, error?.message, error?.meta?.driverAdapterError?.message);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
