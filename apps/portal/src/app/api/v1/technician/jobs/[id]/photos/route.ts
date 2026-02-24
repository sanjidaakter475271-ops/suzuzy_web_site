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

        const photos = await prisma.job_photos.findMany({
            where: {
                job_card_id: id,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json({ data: photos });
    } catch (error: any) {
        console.error('Error fetching photos:', error);
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
        const { url, tag, caption } = body;

        // Direct url save from client (if they upload to S3/Supabase separately)
        // Or we process multipart here. For simplicity, assume URL passed.
        if (!url) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        const photo = await prisma.job_photos.create({
            data: {
                job_card_id: id,
                staff_id: technician.serviceStaffId,
                image_url: url,
                tag: tag || 'before',
                caption: caption,
                created_at: new Date(),
            },
        });

        await broadcast('job_cards:changed', {
            id: id,
            type: 'photo_added'
        });

        return NextResponse.json({ success: true, photo });
    } catch (error: any) {
        console.error('Error saving photo:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
