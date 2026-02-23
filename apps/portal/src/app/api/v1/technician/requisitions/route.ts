import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const requisitions = await prisma.service_requisitions.findMany({
            where: {
                staff_id: technician.serviceStaffId,
            },
            include: {
                products: true,
                service_tickets: {
                    select: { service_number: true }
                }
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json({ data: requisitions });
    } catch (error: any) {
        console.error('Error fetching requisitions:', error);
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
        const { jobId, items } = body;

        if (!jobId || !items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Fetch ticket_id from jobId
        const job = await prisma.job_cards.findFirst({
            where: {
                id: jobId,
                technician_id: technician.serviceStaffId
            },
            select: { ticket_id: true }
        });

        if (!job || !job.ticket_id) {
            return NextResponse.json({ error: 'Job or Ticket not found' }, { status: 404 });
        }

        const ticketId = job.ticket_id;
        const staffId = technician.serviceStaffId;

        // Create requisitions
        await prisma.$transaction(
            items.map((item: any) =>
                prisma.service_requisitions.create({
                    data: {
                        ticket_id: ticketId,
                        staff_id: staffId,
                        product_id: item.productId,
                        quantity: item.quantity,
                        status: 'pending',
                        notes: item.notes
                    }
                })
            )
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error creating user requisition:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
