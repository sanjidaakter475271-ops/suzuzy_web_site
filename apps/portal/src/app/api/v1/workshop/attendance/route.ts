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
        const queryDate = dateParam ? new Date(dateParam) : new Date();
        const todayStart = startOfDay(queryDate);
        const todayEnd = endOfDay(queryDate);

        // For work time calculation: if querying today, use current time for ongoing shifts.
        // If querying a past date, use the end of that day.
        const isQueryingToday = todayStart.getTime() === startOfDay(new Date()).getTime();
        const calculationRefTime = isQueryingToday ? new Date() : todayEnd;

        // 1. Get all technicians for this dealer
        const technicians = await (prisma as any).service_staff.findMany({
            where: {
                dealer_id: user.dealerId as string,
                is_active: true,
                designation: {
                    contains: 'tech',
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                profiles: {
                    select: {
                        full_name: true,
                        email: true
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
            const activeShift = activeSession?.attendance_shifts?.find((sh: any) => !sh.end_time);

            // Calculate work time
            let totalWorkTimeMs = 0;
            sessions.forEach((s: any) => {
                const shifts = s.attendance_shifts || [];
                shifts.forEach((shift: any) => {
                    const start = new Date(shift.start_time);
                    const end = shift.end_time ? new Date(shift.end_time) : calculationRefTime;

                    // Safety check to avoid negative time if clock-in is after calculationRefTime
                    const duration = end.getTime() - start.getTime();
                    if (duration > 0) {
                        totalWorkTimeMs += duration;
                    }
                });
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
                name: tech.profiles?.full_name || tech.name || 'Unknown',
                email: tech.profiles?.email || tech.email || null,
                avatar: null,
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
