import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const breaks = await prisma.technician_breaks.findMany({
            where: {
                technician_time_logs: {
                    staff_id: technician.serviceStaffId
                }
            },
            orderBy: {
                start_time: 'desc',
            },
        });

        return NextResponse.json({ data: breaks });
    } catch (error: any) {
        console.error('Error fetching breaks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { timeLogId, breakType, notes } = body;

        if (!timeLogId || !breakType) {
            return NextResponse.json({ error: 'TimeLogId and breakType are required' }, { status: 400 });
        }

        const technicianBreak = await prisma.technician_breaks.create({
            data: {
                time_log_id: timeLogId,
                break_type: breakType,
                start_time: new Date(),
                notes: notes,
            },
        });

        return NextResponse.json({ success: true, break: technicianBreak });
    } catch (error: any) {
        console.error('Error starting break:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id } = body; // Break ID

        if (!id) {
            return NextResponse.json({ error: 'Break ID is required' }, { status: 400 });
        }

        const existingBreak = await prisma.technician_breaks.findUnique({
            where: { id: id },
        });

        if (!existingBreak) {
            return NextResponse.json({ error: 'Break not found' }, { status: 404 });
        }

        const endTime = new Date();
        const durationMin = Math.round((endTime.getTime() - existingBreak.start_time.getTime()) / 60000);

        const updatedBreak = await prisma.technician_breaks.update({
            where: { id: id },
            data: {
                end_time: endTime,
                duration_min: durationMin,
            },
        });

        return NextResponse.json({ success: true, break: updatedBreak });
    } catch (error: any) {
        console.error('Error finishing break:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
