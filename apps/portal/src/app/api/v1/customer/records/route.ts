import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUser } from '@/lib/auth/get-user';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();

        // Similar to vehicles, we normally filter by customer_id.
        // For the demo / admin view, we'll fetch recent records if the user doesn't have any specific vehicles linked.

        let records;

        if (user) {
            records = await prisma.service_history.findMany({
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

            if (records.length === 0) {
                records = await prisma.service_history.findMany({
                    include: {
                        service_vehicles: {
                            include: { bike_models: true }
                        }
                    },
                    orderBy: { service_date: 'desc' },
                    take: 10
                });
            }
        } else {
            records = await prisma.service_history.findMany({
                include: {
                    service_vehicles: {
                        include: { bike_models: true }
                    }
                },
                orderBy: { service_date: 'desc' },
                take: 10
            });
        }

        return NextResponse.json({ success: true, data: records });
    } catch (error: any) {
        console.error('[CUSTOMER_RECORDS_ERROR]', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch service records' }, { status: 500 });
    }
}
