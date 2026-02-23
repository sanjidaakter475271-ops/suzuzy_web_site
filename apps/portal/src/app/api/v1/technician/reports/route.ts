import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const reports = await prisma.technician_issue_reports.findMany({
            where: {
                staff_id: technician.serviceStaffId,
            },
            include: {
                job_cards: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json({ data: reports });
    } catch (error: any) {
        console.error('Error fetching issue reports:', error);
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
        const { jobCardId, category, description, severity, images } = body;

        if (!category || !description) {
            return NextResponse.json({ error: 'Category and description are required' }, { status: 400 });
        }

        const report = await prisma.technician_issue_reports.create({
            data: {
                job_card_id: jobCardId || null,
                staff_id: technician.serviceStaffId,
                category,
                description,
                severity: severity || 'medium',
                images: images || [],
                status: 'open',
            },
        });

        return NextResponse.json({ success: true, report });
    } catch (error: any) {
        console.error('Error creating issue report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
