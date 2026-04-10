import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(req: NextRequest) {
    try {
        const bikeModels = await prisma.bike_models.findMany({
            where: { is_active: true },
            select: {
                id: true,
                name: true,
                code: true,
                image_url: true
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ success: true, data: bikeModels });
    } catch (error: any) {
        console.error('[PUBLIC_BIKE_MODELS_API] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
