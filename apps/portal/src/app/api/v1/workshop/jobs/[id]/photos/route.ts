import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCurrentTechnician } from "@/lib/auth/get-technician";
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
        const tech = await getCurrentTechnician();
        const user = tech || await getCurrentUser();

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: jobId } = await params;
        const body = await req.json();
        const { image_url, thumbnail_url, tag, caption, staff_id } = body;

        // Ensure we have a valid service_staff ID
        let finalStaffId = staff_id || (user as any).serviceStaffId;

        if (!finalStaffId) {
            // If user is an admin but not a technician, they might not have a service_staff record.
            // We'll try to find any active staff record for this user as fallback.
            const staff = await prisma.service_staff.findFirst({
                where: { profile_id: user.userId, is_active: true }
            });
            finalStaffId = staff?.id;
        }

        if (!finalStaffId) {
            return NextResponse.json({
                success: false,
                error: "A valid staff record is required to upload photos. Please ensure your profile is linked to a service staff member."
            }, { status: 403 });
        }

        const photo = await prisma.job_photos.create({
            data: {
                job_card_id: jobId,
                staff_id: finalStaffId,
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
        console.error("[JOB_PHOTO_POST] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
