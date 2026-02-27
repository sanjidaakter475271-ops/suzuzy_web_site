import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcast } from "@/lib/socket-server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: jobId } = await params;
        const photos = await prisma.job_photos.findMany({
            where: { job_card_id: jobId },
            include: { service_staff: { include: { profiles: true } } },
            orderBy: { created_at: 'desc' }
        });
        return NextResponse.json({ success: true, data: photos });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: jobId } = await params;
        const body = await req.json();
        const { image_url, thumbnail_url, tag, caption, staff_id } = body;

        const photo = await prisma.job_photos.create({
            data: {
                job_card_id: jobId,
                staff_id: staff_id || user.userId, // Default to user if not provided
                image_url,
                thumbnail_url,
                tag: tag || 'general',
                caption,
            }
        });

        // Broadcast real-time update
        await broadcast('job:photo_added', {
            jobId,
            photoId: photo.id,
            tag: photo.tag,
            dealerId: user.dealerId
        });

        return NextResponse.json({ success: true, data: photo });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
