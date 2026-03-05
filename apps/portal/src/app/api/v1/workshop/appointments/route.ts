import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const createSchema = z.object({
    customerId: z.string(),
    vehicleId: z.string(),
    serviceType: z.string().optional(),
    source: z.enum(['walk_in', 'online', 'phone']).default('walk_in'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
    time: z.string(),
    notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            console.error("[APPOINTMENTS_GET] No user session found");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!user.dealerId) {
            console.error("[APPOINTMENTS_GET] User has no dealerId", user);
            return NextResponse.json({ error: "Forbidden: No dealer associated" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get("date");
        const statusStr = searchParams.get("status");

        const whereClause: any = {
            dealer_id: user.dealerId,
        };

        if (dateStr) {
            const startDate = new Date(dateStr);
            startDate.setUTCHours(0, 0, 0, 0);
            const endDate = new Date(dateStr);
            endDate.setUTCHours(23, 59, 59, 999);
            whereClause.appointment_date = {
                gte: startDate,
                lte: endDate,
            };
        }

        if (statusStr) {
            whereClause.status = statusStr;
        }

        const data = await prisma.service_appointments.findMany({
            where: whereClause,
            include: {
                profiles: { select: { full_name: true, phone: true } },
                service_vehicles: { select: { engine_number: true, bike_models: { select: { name: true } } } }
            },
            orderBy: [
                { appointment_date: 'asc' },
                { token_number: 'asc' }
            ] as any
        });

        const appointments = data.map((apt: any) => ({
            id: apt.id,
            customerId: apt.customer_id || '',
            customerName: apt.profiles?.full_name || 'Unknown',
            customerPhone: apt.profiles?.phone || '',
            vehicleId: apt.vehicle_id || '',
            vehicleRegNo: apt.service_vehicles?.engine_number || 'Unknown',
            vehicleModel: apt.service_vehicles?.bike_models?.name || '',
            serviceType: apt.service_type || '',
            source: apt.source || 'walk_in',
            date: apt.appointment_date.toISOString().split('T')[0],
            time: apt.time_slot,
            notes: apt.notes,
            status: apt.status || 'pending',
            token: apt.token_number || 0,
            checkedInAt: apt.checked_in_at?.toISOString(),
            completedAt: apt.completed_at?.toISOString(),
            createdAt: apt.created_at?.toISOString() || new Date().toISOString()
        }));

        return NextResponse.json({ success: true, data: appointments });
    } catch (error: any) {
        console.error("[APPOINTMENTS_GET] Detailed Error:", {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json({
            error: "Failed to fetch appointments",
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.dealerId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const { data } = parsed;
        const appointmentDate = new Date(data.date);
        appointmentDate.setUTCHours(0, 0, 0, 0);

        // Calculate next token for the day
        const maxTokenResult = await prisma.service_appointments.aggregate({
            _max: { token_number: true } as any,
            where: {
                dealer_id: user.dealerId,
                appointment_date: appointmentDate,
            }
        });
        const nextToken = ((maxTokenResult._max as any).token_number || 100) + 1;

        const newAppointment = await prisma.service_appointments.create({
            data: {
                dealer_id: user.dealerId,
                customer_id: data.customerId,
                vehicle_id: data.vehicleId,
                service_type: data.serviceType,
                source: data.source,
                appointment_date: appointmentDate,
                time_slot: data.time,
                notes: data.notes,
                status: 'scheduled', // default fresh creation
                token_number: nextToken,
                created_by: user.userId,
            } as any,
            include: {
                profiles: { select: { full_name: true, phone: true } },
                service_vehicles: { select: { engine_number: true, bike_models: { select: { name: true } } } }
            }
        });

        // Shape response to match GET
        const formatted = {
            id: newAppointment.id,
            customerId: (newAppointment as any).customer_id || '',
            customerName: (newAppointment as any).profiles?.full_name || 'Unknown',
            customerPhone: (newAppointment as any).profiles?.phone || '',
            vehicleId: (newAppointment as any).vehicle_id || '',
            vehicleRegNo: (newAppointment as any).service_vehicles?.engine_number || 'Unknown',
            vehicleModel: (newAppointment as any).service_vehicles?.bike_models?.name || '',
            serviceType: (newAppointment as any).service_type || '',
            source: (newAppointment as any).source || 'walk_in',
            date: newAppointment.appointment_date.toISOString().split('T')[0],
            time: (newAppointment as any).time_slot,
            notes: (newAppointment as any).notes,
            status: (newAppointment as any).status || 'scheduled',
            token: (newAppointment as any).token_number || 0,
            checkedInAt: (newAppointment as any).checked_in_at?.toISOString(),
            completedAt: (newAppointment as any).completed_at?.toISOString(),
            createdAt: newAppointment.created_at?.toISOString() || new Date().toISOString()
        };

        return NextResponse.json({ success: true, data: formatted }, { status: 201 });
    } catch (error: any) {
        console.error("[APPOINTMENTS_POST]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
