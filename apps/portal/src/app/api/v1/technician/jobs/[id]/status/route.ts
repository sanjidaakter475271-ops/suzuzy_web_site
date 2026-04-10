import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';
import { broadcast } from '@/lib/socket-server';
import { createNotification } from '@/lib/notifications';
import { ROLES } from '@/lib/auth/roles';

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

        // AUTO-COMPLETE: If job is completed, also complete linked appointment
        if (status === 'completed') {
            try {
                const ticket = await prisma.service_tickets.findFirst({
                    where: { job_cards: { some: { id: id } } },
                    select: { appointment_id: true }
                });
                if (ticket?.appointment_id) {
                    await prisma.service_appointments.update({
                        where: { id: ticket.appointment_id },
                        data: {
                            status: 'completed',
                            completed_at: new Date(),
                        }
                    });
                }
            } catch (linkErr) {
                console.error('[JOB_STATUS] Failed to auto-complete appointment:', linkErr);
                // Non-blocking — don't fail the main operation
            }
        }

        // Broadcast change for real-time dashboard updates
        await broadcast('job_cards:changed', {
            id: id,
            status: status,
            technicianId: technician.serviceStaffId
        });

        // Persistent Notifications for Admins
        try {
            if (status === 'completed' || status === 'paused') {
                const jobWithTicket = await prisma.job_cards.findUnique({
                    where: { id },
                    include: { service_tickets: { select: { service_number: true } } }
                });
                const jobNo = jobWithTicket?.service_tickets?.service_number || "N/A";

                const admins = await prisma.profiles.findMany({
                    where: {
                        dealer_id: technician.dealerId,
                        role: { in: [ROLES.SERVICE_ADMIN, ROLES.DEALER_OWNER, ROLES.DEALER] }
                    },
                    select: { id: true }
                });

                for (const admin of admins) {
                    await createNotification({
                        userId: admin.id,
                        title: status === 'completed' ? "Job Finished" : "Job Paused",
                        message: status === 'completed'
                            ? `Technician has finished work on Job Card ${jobNo}. Ready for billing.`
                            : `Job Card ${jobNo} has been paused by technician.`,
                        type: status === 'completed' ? 'success' : 'warning',
                        linkUrl: `/service-admin/workshop/job-cards/${id}`
                    });
                }
            }
        } catch (notifyErr) {
            console.error("[JOB_STATUS_NOTIFY_ERROR]", notifyErr);
        }

        return NextResponse.json({ success: true, status });
    } catch (error: any) {
        console.error('Error updating job status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
