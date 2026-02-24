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

        const checklist = await prisma.service_checklist_items.findMany({
            where: {
                job_card_id: id,
            },
            orderBy: {
                created_at: 'asc',
            },
        });

        return NextResponse.json({ data: checklist });
    } catch (error: any) {
        console.error('Error fetching checklist:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { items } = await req.json();

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Items must be an array' }, { status: 400 });
        }

        const job = await prisma.job_cards.findFirst({
            where: { id: id, technician_id: technician.serviceStaffId },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const operations = items.map((item: any) =>
            prisma.service_checklist_items.update({
                where: { id: item.id },
                data: {
                    is_completed: item.completed !== undefined ? item.completed : true,
                    condition: item.condition,
                    notes: item.notes,
                    photo_url: item.photoUrl,
                    updated_at: new Date(),
                },
            })
        );

        await prisma.$transaction(operations);

        await broadcast('job_cards:changed', {
            id: id,
            type: 'checklist_update',
            technicianId: technician.serviceStaffId
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating checklist:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
