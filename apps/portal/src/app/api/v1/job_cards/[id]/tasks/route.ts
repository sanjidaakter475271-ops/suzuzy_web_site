import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const newTask = await prisma.service_tasks.create({
            data: {
                job_card_id: id,
                name: body.item_name || 'Additional Task',
                description: `Cost: ${body.cost}`,
                status: 'pending'
            }
        });

        return NextResponse.json({ success: true, data: newTask });
    } catch (error: any) {
        console.error('[ADD_JOB_CARD_TASK_ERROR]', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
