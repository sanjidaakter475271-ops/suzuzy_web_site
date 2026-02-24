import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';
import { broadcast } from '@/lib/socket-server';

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

        if (job.status === 'qc_requested') {
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
                status: 'qc_requested',
                updated_at: new Date(),
            },
        });

        await broadcast('job_cards:changed', {
            id: id,
            status: 'qc_requested',
            type: 'qc_request'
        });

        return NextResponse.json({ success: true, qc });
    } catch (error: any) {
        console.error('Error requesting QC:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
