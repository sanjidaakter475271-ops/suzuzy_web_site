import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !['service_admin', 'super_admin', 'dealer_owner'].includes(user.role)) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');
        const now = dateParam ? new Date(dateParam) : new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        // 1. Get all technicians for this dealer
        const technicians = await (prisma as any).service_staff.findMany({
            where: {
                dealer_id: user.dealerId as string,
                designation: { in: ['Technician', 'technician'] }
            },
            include: {
                profiles: {
                    select: {
                        full_name: true,
                        email: true,
                        avatar_url: true
                    }
                }
            }
        });

        // 2. Get today's attendance sessions for these technicians
        const attendance = await (prisma as any).technician_attendance.findMany({
            where: {
                staff_id: { in: technicians.map((t: any) => t.id) },
                clock_in: {
                    gte: todayStart,
                    lte: todayEnd
                }
            },
            include: {
                attendance_shifts: {
                    orderBy: { start_time: 'desc' }
                }
            },
            orderBy: { clock_in: 'desc' }
        });

        // 3. Combine data
        const result = technicians.map((tech: any) => {
            const sessions = attendance.filter((a: any) => a.staff_id === tech.id);
            const activeSession = sessions.find((s: any) => !s.clock_out);
            const activeShift = activeSession?.attendance_shifts.find((sh: any) => !sh.end_time);

            // Calculate work time
            let totalWorkTimeMs = 0;
            sessions.flatMap((s: any) => s.attendance_shifts).forEach((shift: any) => {
                const start = new Date(shift.start_time);
                const end = shift.end_time ? new Date(shift.end_time) : now;
                totalWorkTimeMs += end.getTime() - start.getTime();
            });

            let status = 'offline';
            if (activeSession) {
                if (activeShift) {
                    status = 'active';
                } else {
                    status = 'break';
                }
            } else if (sessions.length > 0) {
                status = 'checked_out';
            }

            return {
                id: tech.id,
                name: tech.profiles?.full_name || 'Unknown',
                email: tech.profiles?.email,
                avatar: tech.profiles?.avatar_url,
                status,
                lastSeen: sessions[0]?.clock_in || null,
                totalWorkTimeMs,
                activeSession: activeSession ? {
                    id: activeSession.id,
                    clockIn: activeSession.clock_in,
                    isShiftActive: !!activeShift,
                } : null
            };
        });

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('Error fetching workshop attendance:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
