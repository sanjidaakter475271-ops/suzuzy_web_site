import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUser } from '@/lib/auth/get-user';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        const url = new URL(req.url);
        const filterStr = url.searchParams.get('filter'); // "today", "upcoming"

        const whereClause: Prisma.service_appointmentsWhereInput = {};

        if (filterStr === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            whereClause.appointment_date = {
                gte: today,
                lt: tomorrow
            };
        }

        // For admin we allow viewing without customer_id
        if (user && user.role !== 'admin' && user.role !== 'service' && user.role !== 'technician') {
            whereClause.customer_id = user.userId;
        }

        const appointments = await prisma.service_appointments.findMany({
            where: whereClause,
            include: {
                profiles: true,
                service_vehicles: {
                    include: { bike_models: true }
                }
            },
            orderBy: {
                appointment_date: 'desc'
            }
        });

        return NextResponse.json({ success: true, data: appointments });
    } catch (error: unknown) {
        console.error('[CUSTOMER_APPOINTMENTS_ERROR]', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch appointments' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        if (!body.vehicle_id || !body.appointment_date || !body.time_slot) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const newAppointment = await prisma.service_appointments.create({
            data: {
                customer_id: user.userId,
                vehicle_id: body.vehicle_id,
                dealer_id: user.dealerId || null,
                appointment_date: new Date(body.appointment_date),
                time_slot: body.time_slot,
                service_type: body.service_type || 'General Service',
                notes: body.notes || ''
            }
        });

        return NextResponse.json({ success: true, data: newAppointment });
    } catch (error: unknown) {
        console.error('[CUSTOMER_APPOINTMENTS_POST_ERROR]', error);
        return NextResponse.json({ success: false, error: 'Failed to book appointment' }, { status: 500 });
    }
}
