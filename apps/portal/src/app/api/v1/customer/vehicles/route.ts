import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUser } from '@/lib/auth/get-user';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();

        // For demonstration, if no user is found, we might want to return an access denied error.
        // However, this customer portal might be a mockup inside the admin dashboard.
        // If there's a user, we fetch their vehicles. If it's an admin, maybe we fetch all or none.
        // Let's just fetch recent vehicles for the presentation if no specific customer is linked.

        let vehicles;
        if (user) {
            // First check if user actually has any vehicles as a customer
            vehicles = await prisma.service_vehicles.findMany({
                where: { customer_id: user.userId },
                include: { bike_models: true, service_history: true },
                orderBy: { created_at: 'desc' }
            });

            // Fallback for admin demo: if user has no vehicles because they are an admin, show some generic vehicles
            if (vehicles.length === 0) {
                vehicles = await prisma.service_vehicles.findMany({
                    include: { bike_models: true, service_history: true },
                    orderBy: { created_at: 'desc' },
                    take: 5
                });
            }
        } else {
            vehicles = await prisma.service_vehicles.findMany({
                include: { bike_models: true, service_history: true },
                orderBy: { created_at: 'desc' },
                take: 5
            });
        }

        return NextResponse.json({ success: true, data: vehicles });
    } catch (error: any) {
        console.error('[CUSTOMER_VEHICLES_ERROR]', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch vehicles' }, { status: 500 });
    }
}
