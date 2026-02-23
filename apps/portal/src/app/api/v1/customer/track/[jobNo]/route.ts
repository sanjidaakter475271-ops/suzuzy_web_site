import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ jobNo: string }> }
) {
    try {
        const { jobNo } = await params;


        if (!jobNo) {
            return NextResponse.json({ error: 'Job number is required' }, { status: 400 });
        }

        const ticket = await prisma.service_tickets.findUnique({
            where: { service_number: jobNo },
            include: {
                service_vehicles: {
                    include: {
                        bike_models: true
                    }
                },
                service_staff: {
                    select: {
                        name: true,
                        phone: true,
                        designation: true,
                    }
                },
                job_cards: {
                    include: {
                        job_photos: {
                            orderBy: { created_at: 'desc' }
                        },
                        service_checklist_items: {
                            orderBy: { created_at: 'asc' }
                        },
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error('[CUSTOMER_TRACK_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
