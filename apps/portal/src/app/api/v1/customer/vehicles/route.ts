import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUser } from '@/lib/auth/get-user';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const vehicles = await prisma.service_vehicles.findMany({
            where: { customer_id: user.userId },
            include: { bike_models: true, service_history: true },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ success: true, data: vehicles });
    } catch (error: any) {
        console.error('[CUSTOMER_VEHICLES_ERROR]', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch vehicles' }, { status: 500 });
    }
}
