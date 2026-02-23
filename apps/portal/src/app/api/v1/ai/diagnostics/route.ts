import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { analyzeJobPhoto } from '@/lib/ai/gemini';
import { broadcast } from '@/lib/socket-server';

export async function POST(req: Request) {
    try {
        const { photoId } = await req.json();

        if (!photoId) {
            return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
        }

        const photo = await prisma.job_photos.findUnique({
            where: { id: photoId }
        });

        if (!photo) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
        }

        // Trigger AI analysis
        const analysis = await analyzeJobPhoto(photo.image_url);

        // Update photo metadata
        const updatedPhoto = await prisma.job_photos.update({
            where: { id: photoId },
            data: {
                metadata: analysis
            },
            include: {
                job_cards: true
            }
        });

        // Broadcast update
        if (updatedPhoto.job_cards?.ticket_id) {
            // We need to find the service ticket to get the service_number for broadcasting
            const ticket = await prisma.service_tickets.findFirst({
                where: { id: updatedPhoto.job_cards.ticket_id }
            });

            if (ticket) {
                await broadcast('job_photo:updated', {
                    service_number: ticket.service_number,
                    photoId: photoId,
                    analysis: analysis
                });
            }
        }

        return NextResponse.json({ success: true, data: analysis });
    } catch (error: any) {
        console.error('[AI_DIAGNOSTICS_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
