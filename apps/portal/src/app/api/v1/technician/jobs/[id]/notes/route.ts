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

        const job = await prisma.job_cards.findUnique({
            where: { id: id },
            select: { notes: true },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ data: { notes: job.notes } });
    } catch (error: any) {
        console.error('Error fetching notes:', error);
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
        const { note } = await req.json();

        if (!note) {
            return NextResponse.json({ error: 'Note is required' }, { status: 400 });
        }

        const job = await prisma.job_cards.findFirst({
            where: { id: id, technician_id: technician.serviceStaffId },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const timestamp = new Date().toLocaleString();
        const newNote = `[${timestamp}] ${technician.name}: ${note}\n`;
        const updatedNotes = (job.notes || '') + newNote;

        const updatedJob = await prisma.job_cards.update({
            where: { id: id },
            data: {
                notes: updatedNotes,
                updated_at: new Date(),
            },
        });

        return NextResponse.json({ success: true, notes: updatedJob.notes });
    } catch (error: any) {
        console.error('Error adding note:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
