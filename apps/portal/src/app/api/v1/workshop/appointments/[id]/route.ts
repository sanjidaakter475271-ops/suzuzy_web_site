import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const updateSchema = z.object({
    status: z.enum(['pending', 'scheduled', 'cancelled', 'completed', 'no-show']).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").optional(),
    time: z.string().optional(),
    notes: z.string().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.dealerId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const apt = await prisma.service_appointments.findFirst({
            where: { id, dealer_id: user.dealerId },
            include: {
                profiles: { select: { full_name: true, phone: true } },
                service_vehicles: { select: { engine_number: true, chassis_number: true, bike_models: { select: { name: true } } } }
            }
        });

        if (!apt) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        // Shape response exactly as the frontend expects
        const data = {
            id: apt.id,
            customerId: apt.customer_id || '',
            customerName: apt.profiles?.full_name || 'Unknown',
            customerPhone: apt.profiles?.phone || '',
            vehicleId: apt.vehicle_id || '',
            vehicleRegNo: apt.service_vehicles?.engine_number || 'Unknown',
            vehicleChassisNo: apt.service_vehicles?.chassis_number || '',
            vehicleModel: apt.service_vehicles?.bike_models?.name || '',
            serviceType: apt.service_type || '',
            source: apt.source || 'walk_in',
            date: apt.appointment_date instanceof Date ? apt.appointment_date.toISOString().split('T')[0] : (apt.appointment_date as any).split('T')[0],
            time: apt.time_slot,
            notes: apt.notes,
            status: apt.status || 'pending',
            token: apt.token_number || 0,
            checkedInAt: apt.checked_in_at?.toISOString(),
            completedAt: apt.completed_at?.toISOString(),
            createdAt: apt.created_at?.toISOString() || new Date().toISOString()
        };

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("[APPOINTMENT_GET_ID]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.dealerId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const body = await request.json();
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
        }

        const { data } = parsed;

        // Ensure we only update if it belongs to dealer
        const existing = await prisma.service_appointments.findFirst({
            where: { id, dealer_id: user.dealerId }
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const updateData: any = {};
        if (data.status) {
            updateData.status = data.status;

            // Handle timestamps and logic for status changes
            if (data.status === 'completed') {
                updateData.completed_at = new Date();
            } else if (data.status === 'scheduled') {
                // If it's becoming scheduled (confirmed/checked-in)
                if (!existing.checked_in_at) {
                    updateData.checked_in_at = new Date();
                }

                // If it doesn't have a token number, assign the next one for the date
                if (!existing.token_number) {
                    const targetDate = data.date ? new Date(data.date) : existing.appointment_date;
                    targetDate.setUTCHours(0, 0, 0, 0);

                    const maxTokenResult = await prisma.service_appointments.aggregate({
                        where: {
                            dealer_id: user.dealerId,
                            appointment_date: targetDate
                        },
                        _max: { token_number: true }
                    });

                    updateData.token_number = ((maxTokenResult._max.token_number || 100)) + 1;
                }
            }
        }
        if (data.date) {
            const newDate = new Date(data.date);
            newDate.setUTCHours(0, 0, 0, 0);
            updateData.appointment_date = newDate;
        }
        if (data.time) updateData.time_slot = data.time;
        if (data.notes) updateData.notes = data.notes;

        const updated = await prisma.service_appointments.update({
            where: { id },
            data: updateData,
            include: {
                profiles: { select: { full_name: true, phone: true } },
                service_vehicles: {
                    select: { engine_number: true, bike_models: { select: { name: true } } }
                }
            }
        });

        const formatted = {
            id: updated.id,
            customerId: (updated as any).customer_id || '',
            customerName: (updated as any).profiles?.full_name || 'Unknown',
            customerPhone: (updated as any).profiles?.phone || '',
            vehicleId: (updated as any).vehicle_id || '',
            vehicleRegNo: (updated as any).service_vehicles?.engine_number || 'Unknown',
            vehicleModel: (updated as any).service_vehicles?.bike_models?.name || '',
            serviceType: (updated as any).service_type || '',
            source: (updated as any).source || 'walk_in',
            date: updated.appointment_date.toISOString().split('T')[0],
            time: (updated as any).time_slot,
            notes: (updated as any).notes,
            status: (updated as any).status || 'scheduled',
            token: (updated as any).token_number || 0,
            checkedInAt: (updated as any).checked_in_at?.toISOString(),
            completedAt: (updated as any).completed_at?.toISOString(),
            createdAt: (updated as any).created_at?.toISOString() || new Date().toISOString()
        };

        return NextResponse.json({ success: true, data: formatted });
    } catch (error: any) {
        console.error("[APPOINTMENTS_PATCH]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.dealerId && user.role !== 'admin')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.service_appointments.findFirst({
            where: { id, dealer_id: user.dealerId! }
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.service_appointments.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "Appointment deleted successfully" });
    } catch (error: any) {
        console.error("[APPOINTMENTS_DELETE]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
