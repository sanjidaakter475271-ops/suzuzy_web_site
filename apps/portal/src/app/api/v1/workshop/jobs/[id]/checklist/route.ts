import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcast } from "@/lib/socket-server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: jobId } = await params;
        const items = await prisma.service_checklist_items.findMany({
            where: { job_card_id: jobId },
            orderBy: { category: 'asc' }
        });
        return NextResponse.json({ success: true, data: items });
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
        const { items } = body; // Array of items to upsert/update

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Items array is required" }, { status: 400 });
        }

        const results = await prisma.$transaction(
            items.map(item =>
                prisma.service_checklist_items.upsert({
                    where: { id: item.id || 'new-uuid' }, // This logic might need refinement based on how items are identified
                    update: {
                        is_completed: item.is_completed,
                        condition: item.condition,
                        notes: item.notes,
                        photo_url: item.photo_url,
                        updated_at: new Date()
                    },
                    create: {
                        job_card_id: jobId,
                        name: item.name,
                        category: item.category,
                        is_completed: item.is_completed || false,
                        condition: item.condition || 'good',
                        notes: item.notes,
                        photo_url: item.photo_url
                    }
                })
            )
        );

        await broadcast('job:checklist_updated', {
            jobId,
            completedCount: results.filter(r => r.is_completed).length,
            totalCount: results.length,
            dealerId: user.dealerId
        });

        return NextResponse.json({ success: true, data: results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
