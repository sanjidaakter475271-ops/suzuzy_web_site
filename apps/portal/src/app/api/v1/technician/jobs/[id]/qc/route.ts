import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';
import { broadcast } from '@/lib/socket-server';
import { createNotification } from '@/lib/notifications';
import { ROLES } from '@/lib/auth/roles';

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const qcRequests = await prisma.qc_requests.findMany({
            where: {
                job_card_id: id,
            },
            include: {
                reviewer: {
                    select: { full_name: true }
                }
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json({ data: qcRequests });
    } catch (error: any) {
        console.error('Error fetching QC status:', error);
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
        const { notes } = await req.json();

        const job = await prisma.job_cards.findFirst({
            where: { id: id, technician_id: technician.serviceStaffId },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.status === 'qc_pending') {
            return NextResponse.json({ error: 'QC already requested' }, { status: 400 });
        }

        const qc = await prisma.qc_requests.create({
            data: {
                job_card_id: id,
                requested_by: technician.userId,
                status: 'pending',
                notes: notes,
            },
            include: {
                job_cards: true,
            },
        });

        await prisma.job_cards.update({
            where: { id: id },
            data: {
                status: 'qc_pending',
                updated_at: new Date(),
            },
        });

        await broadcast('job_cards:changed', {
            id: id,
            status: 'qc_pending',
            type: 'qc_request'
        });

        // Notify Dealer Admins
        try {
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
                    title: "QC Check Requested",
                    message: `Technician requested QC for Job Card.`,
                    type: 'info',
                    linkUrl: `/service-admin/workshop/qc`
                });
            }
        } catch (notifyError) {
            console.error("[QC_NOTIFY_ERROR]", notifyError);
        }

        return NextResponse.json({ success: true, qc });
    } catch (error: any) {
        console.error('Error requesting QC:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
