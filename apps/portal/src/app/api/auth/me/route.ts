import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: NextRequest) {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profiles.findUnique({
        where: { id: userPayload.userId },
        include: {
            roles: true,
            dealers_profiles_dealer_idTodealers: true
        }
    });

    if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
        user: {
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            phone: profile.phone,
            role: profile.roles?.name,
            roleLevel: profile.roles?.level,
            dealer: profile.dealers_profiles_dealer_idTodealers,
            emailVerified: profile.email_verified,
            phoneVerified: profile.phone_verified,
            mfaEnabled: profile.mfa_enabled,
        }
    });
}

export async function PUT(req: NextRequest) {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone } = await req.json();

    const updated = await prisma.profiles.update({
        where: { id: userPayload.userId },
        data: {
            full_name: name,
            phone: phone,
        }
    });

    return NextResponse.json({ success: true, user: updated });
}
