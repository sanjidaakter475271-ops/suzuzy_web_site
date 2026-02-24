import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';
import { broadcast } from '@/lib/socket-server';

type Params = Promise<{ id: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, location } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const job = await prisma.job_cards.findFirst({
            where: { id: id, technician_id: technician.serviceStaffId },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const jobUpdateData: any = {
            status: status,
            updated_at: new Date(),
        };

        let eventType = '';
        if (status === 'in_progress') {
            if (!job.service_start_time) {
                jobUpdateData.service_start_time = new Date();
                eventType = 'start';
            } else if (job.status === 'paused') {
                eventType = 'resume';
            }
        } else if (status === 'paused') {
            eventType = 'pause';
        } else if (status === 'completed') {
            jobUpdateData.service_end_time = new Date();
            eventType = 'complete';
        }

        const operations: any[] = [
            prisma.job_cards.update({
                where: { id: id },
                data: jobUpdateData,
            })
        ];

        // Only create log if status changed or it's a specific event
        if (eventType) {
            operations.push(
                prisma.technician_time_logs.create({
                    data: {
                        job_card_id: id,
                        staff_id: technician.serviceStaffId,
                        event_type: eventType,
                        timestamp: new Date(),
                        gps_lat: location?.lat || null,
                        gps_lng: location?.lng || null,
                        device_id: body.deviceId || null,
                    },
                })
            );
        }

        await prisma.$transaction(operations);

        // Broadcast change for real-time dashboard updates
        await broadcast('job_cards:changed', {
            id: id,
            status: status,
            technicianId: technician.serviceStaffId
        });

        // Also broadcast to inventory if parts might be involved (optional but good)
        if (status === 'paused') {
            await broadcast('notifications:new', {
                type: 'job_paused',
                message: `Job #${id.substring(0, 8)} paused by technician.`,
                userId: technician.userId
            });
        }

        return NextResponse.json({ success: true, status });
    } catch (error: any) {
        console.error('Error updating job status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
