import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function POST(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { token, deviceType, deviceName } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const pushToken = await prisma.push_tokens.upsert({
            where: {
                user_id_token: {
                    user_id: technician.userId,
                    token: token,
                },
            },
            update: {
                is_active: true,
                last_used_at: new Date(),
                device_type: deviceType,
                device_name: deviceName,
            },
            create: {
                user_id: technician.userId,
                token: token,
                device_type: deviceType,
                device_name: deviceName,
                is_active: true,
                last_used_at: new Date(),
            },
        });

        return NextResponse.json({ success: true, data: pushToken });
    } catch (error: any) {
        console.error('Error registering push token:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        await prisma.push_tokens.updateMany({
            where: {
                user_id: technician.userId,
                token: token,
            },
            data: {
                is_active: false,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deactivating push token:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
