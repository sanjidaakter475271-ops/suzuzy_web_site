import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();

        if (!technician) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.profiles.findUnique({
            where: { id: technician.userId },
            select: {
                id: true,
                email: true,
                full_name: true,
                phone: true,
                role: true,
                status: true,
                created_at: true,
                dealers_profiles_dealer_idTodealers: {
                    select: {
                        id: true,
                        business_name: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                phone: user.phone,
                role: user.role,
                status: user.status,
                created_at: user.created_at,
                dealer: user.dealers_profiles_dealer_idTodealers ? {
                    id: user.dealers_profiles_dealer_idTodealers.id,
                    name: user.dealers_profiles_dealer_idTodealers.business_name,
                } : null,
            }
        });
    } catch (error: any) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();

        if (!technician) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone } = body;

        // Validation (basic)
        if (!name && !email && !phone) {
            return NextResponse.json({ success: false, error: 'No data to update' }, { status: 400 });
        }

        const updatedUser = await prisma.profiles.update({
            where: { id: technician.userId },
            data: {
                full_name: name || undefined,
                email: email || undefined,
                phone: phone || undefined,
                updated_at: new Date(),
            },
            select: {
                id: true,
                email: true,
                full_name: true,
                phone: true,
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.full_name,
                phone: updatedUser.phone,
            },
            message: 'Profile updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating profile:', error);

        // Handle unique constraint violation (P2002)
        if (error.code === 'P2002') {
            return NextResponse.json({ success: false, error: 'Email or phone already in use' }, { status: 409 });
        }

        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
