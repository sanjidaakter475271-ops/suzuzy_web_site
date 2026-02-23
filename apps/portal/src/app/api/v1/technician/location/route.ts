import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function POST(req: Request) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { latitude, longitude } = body;

        if (latitude === undefined || longitude === undefined) {
            return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
        }

        // Update location for the specific technician
        await prisma.service_staff.update({
            where: { id: technician.serviceStaffId },
            data: {
                latitude,
                longitude,
                last_active_at: new Date()
            }
        });

        // Also broadcast to realtime server if needed
        // For now, we just update the DB. The status board refetches on signal.

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[LOCATION_UPDATE_ERROR]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
