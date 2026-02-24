import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUser } from '@/lib/auth/get-user';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const count = await prisma.service_appointments.count({
            where: {
                dealer_id: user.dealerId,
                appointment_date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        return NextResponse.json({ success: true, count });
    } catch (error: any) {
        console.error('Failed to fetch appointment stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
