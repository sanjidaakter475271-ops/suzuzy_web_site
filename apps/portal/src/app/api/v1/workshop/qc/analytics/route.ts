import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Fetch QC stats
        const stats = await prisma.qc_requests.groupBy({
            by: ['status'],
            where: {
                job_cards: {
                    dealer_id: dealerId
                },
                created_at: {
                    gte: startDate
                }
            },
            _count: {
                id: true
            }
        });

        const total = stats.reduce((acc, curr) => acc + curr._count.id, 0);
        const approved = stats.find(s => s.status === 'approved')?._count.id || 0;
        const rejected = stats.find(s => s.status === 'rejected')?._count.id || 0;
        const pending = stats.find(s => s.status === 'pending')?._count.id || 0;

        const rejectionRate = (approved + rejected) > 0 ? (rejected / (approved + rejected)) * 100 : 0;

        // Additional: top rejected items
        const topRejectedItems = await prisma.qc_checklist_items.groupBy({
            by: ['item_name'],
            where: {
                is_passed: false,
                qc_requests: {
                    job_cards: {
                        dealer_id: dealerId
                    },
                    created_at: {
                        gte: startDate
                    }
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        });

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    total,
                    approved,
                    rejected,
                    pending,
                    rejectionRate: rejectionRate.toFixed(2)
                },
                topRejectedItems: topRejectedItems.map(item => ({
                    name: item.item_name,
                    count: item._count.id
                }))
            }
        });

    } catch (error: any) {
        console.error("[QC_ANALYTICS_GET] Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
