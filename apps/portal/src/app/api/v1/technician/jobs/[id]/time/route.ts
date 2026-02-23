import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const logs = await prisma.technician_time_logs.findMany({
            where: {
                job_card_id: id,
            },
            include: {
                technician_breaks: true,
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        return NextResponse.json({ data: logs });
    } catch (error: any) {
        console.error('Error fetching time logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { eventType, location } = body;

        if (!eventType) {
            return NextResponse.json({ error: 'EventType is required' }, { status: 400 });
        }

        const job = await prisma.job_cards.findFirst({
            where: { id: id, technician_id: technician.serviceStaffId },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const log = await prisma.technician_time_logs.create({
            data: {
                job_card_id: id,
                staff_id: technician.serviceStaffId,
                event_type: eventType,
                timestamp: new Date(),
                gps_lat: location?.lat || null,
                gps_lng: location?.lng || null,
                device_id: body.deviceId || null,
            },
        });

        return NextResponse.json({ success: true, log });
    } catch (error: any) {
        console.error('Error logging time:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
