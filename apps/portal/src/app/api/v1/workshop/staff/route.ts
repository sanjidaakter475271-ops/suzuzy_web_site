import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { z } from "zod";
import { startOfDay, endOfDay } from "date-fns";

const createSchema = z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    designation: z.string().optional(),
    phone: z.string().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const dealerId = user.dealerId;
        if (!dealerId && user.role !== 'super_admin') {
            return NextResponse.json({ error: "Dealer context required" }, { status: 400 });
        }

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const staff = await prisma.service_staff.findMany({
            where: {
                is_active: true,
                OR: [
                    { dealer_id: dealerId },
                    { status: 'pending', dealer_id: null }
                ]
            },
            include: {
                profiles: {
                    select: {
                        full_name: true,
                        email: true
                    }
                },
                job_cards: {
                    where: {
                        status: { notIn: ['delivered', 'cancelled'] }
                    },
                    select: {
                        id: true,
                        status: true
                    }
                },
                technician_attendance: {
                    where: {
                        clock_in: {
                            gte: todayStart,
                            lte: todayEnd
                        }
                    },
                    select: {
                        id: true,
                        clock_in: true,
                        clock_out: true,
                        status: true
                    },
                    orderBy: {
                        clock_in: 'desc'
                    }
                }
            }
        });

        // Format the data for the comprehensive view
        const formattedStaff = staff.map(member => {
            const sessions = (member as any).technician_attendance || [];
            const activeSession = sessions.find((s: any) => !s.clock_out);

            let status = 'offline';
            if (activeSession) {
                status = 'active'; // Simplified for stability
            } else if (sessions.length > 0) {
                status = 'checked_out';
            }

            return {
                ...member,
                currentStatus: status,
                activeJobsCount: (member as any).job_cards?.length || 0,
                todaySessions: sessions
            };
        });

        return NextResponse.json({ success: true, data: formattedStaff });
    } catch (error: any) {
        console.error("[STAFF_GET_ERROR] Raw error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Internal server error"
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'service_admin' && user.role !== 'super_admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
        }

        const { name, email, designation, phone } = parsed.data;

        // Check for duplicates
        if (email) {
            const existing = await prisma.service_staff.findFirst({
                where: { email, dealer_id: user.dealerId, is_active: true }
            });
            if (existing) {
                return NextResponse.json({ error: "Technician with this email already exists" }, { status: 400 });
            }
        }

        const staff = await prisma.service_staff.create({
            data: {
                name,
                email: email || `tech-${Math.random().toString(36).substring(7)}@suzuky.com`,
                designation: designation || "Technician",
                phone: phone || "",
                dealer_id: user.dealerId,
                status: "active", // Created by admin = active immediately
                is_active: true,
                staff_id: `TECH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            }
        });

        return NextResponse.json({ success: true, data: staff });
    } catch (error: any) {
        console.error("[STAFF_POST] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
