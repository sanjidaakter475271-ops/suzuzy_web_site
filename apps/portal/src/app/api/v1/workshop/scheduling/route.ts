import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

// Local recursive Decimal-to-Number serializer
const serialize = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(serialize);
    if (typeof obj === 'object') {
        if (obj.constructor && obj.constructor.name === 'Decimal') {
            return Number(obj);
        }
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = serialize(obj[key]);
        }
        return newObj;
    }
    return obj;
};

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
        const dealerId = user.dealerId;

        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const [schedules, slots] = await Promise.all([
            prisma.staff_schedules.findMany({
                where: { dealer_id: dealerId, date: new Date(dateParam) },
                include: { service_staff: { include: { profiles: { select: { full_name: true } } } } }
            }),
            prisma.capacity_slots.findMany({
                where: { dealer_id: dealerId, date: new Date(dateParam) }
            })
        ]);

        return NextResponse.json({
            success: true,
            data: serialize({ schedules, slots })
        });
    } catch (error: any) {
        console.error("Scheduling fetch error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { type, data } = body;
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        if (type === 'staff_schedule') {
            // Check if staff exists and belongs to dealer
            const staff = await prisma.service_staff.findFirst({
                where: { id: data.staff_id, dealer_id: dealerId }
            });
            if (!staff) return NextResponse.json({ success: false, error: "Staff member not found for this dealer" }, { status: 404 });

            const schedule = await prisma.staff_schedules.upsert({
                where: { staff_id_date: { staff_id: data.staff_id, date: new Date(data.date) } },
                update: {
                    shift_start: new Date(`${data.date}T${data.shift_start}`),
                    shift_end: new Date(`${data.date}T${data.shift_end}`),
                    status: data.status
                },
                create: {
                    staff_id: data.staff_id,
                    dealer_id: dealerId,
                    date: new Date(data.date),
                    shift_start: new Date(`${data.date}T${data.shift_start}`),
                    shift_end: new Date(`${data.date}T${data.shift_end}`),
                    status: data.status
                }
            });
            return NextResponse.json({ success: true, data: serialize(schedule) });
        }

        if (type === 'capacity_slot') {
            const slot = await prisma.capacity_slots.upsert({
                where: { dealer_id_date_time_slot: { dealer_id: dealerId, date: new Date(data.date), time_slot: data.time_slot } },
                update: { total_slots: Number(data.total_slots), is_available: !!data.is_available },
                create: {
                    dealer_id: dealerId,
                    date: new Date(data.date),
                    time_slot: data.time_slot,
                    total_slots: Number(data.total_slots),
                    is_available: !!data.is_available
                }
            });
            return NextResponse.json({ success: true, data: serialize(slot) });
        }

        return NextResponse.json({ success: false, error: "Invalid schedule type" }, { status: 400 });
    } catch (error: any) {
        console.error("Scheduling update error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
