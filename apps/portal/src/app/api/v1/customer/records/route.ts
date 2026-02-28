import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUser } from '@/lib/auth/get-user';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const records = await prisma.service_history.findMany({
            where: {
                service_vehicles: {
                    customer_id: user.userId
                }
            },
            include: {
                service_vehicles: {
                    include: {
                        bike_models: true
                    }
                }
            },
            orderBy: {
                service_date: 'desc'
            }
        });

        return NextResponse.json({ success: true, data: records });
    } catch (error: any) {
        console.error('[CUSTOMER_RECORDS_ERROR]', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch service records' }, { status: 500 });
    }
}
