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

        const updateData: any = {};
        if (data.status) {
            updateData.status = data.status;

            // Handle timestamps for status changes
            if (data.status === 'completed') {
                updateData.completed_at = new Date();
            } else if (data.status === 'scheduled') { // Meaning checked-in or started, let's keep convention
                // Keep checked_in_at if we want that semantics here
                // We'll leave it as is or we can add checked_in_at later based on app logic
            }
        }
        if (data.date) {
            const newDate = new Date(data.date);
            newDate.setUTCHours(0, 0, 0, 0);
            updateData.appointment_date = newDate;
        }
        if (data.time) updateData.time_slot = data.time;
        if (data.notes) updateData.notes = data.notes;

        // Ensure we only update if it belongs to dealer
        const existing = await prisma.service_appointments.findFirst({
            where: { id, dealer_id: user.dealerId }
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

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
