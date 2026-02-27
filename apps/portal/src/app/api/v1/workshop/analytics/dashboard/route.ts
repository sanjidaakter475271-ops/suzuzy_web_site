import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        // Permission check
        if (!user || !['service_admin', 'super_admin'].includes(user.role as string)) {
            return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 });
        }

        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        // Date ranges for current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            activeJobsCount,
            completedJobsMonth,
            revenueMonthData,
            technicianStats
        ] = await Promise.all([
            // 1. Active Jobs
            prisma.job_cards.count({
                where: {
                    dealer_id: dealerId,
                    status: { in: ['in_progress', 'qc_requested', 'pending', 'qc_failed'] }
                }
            }),

            // 2. Completed Jobs This Month
            prisma.job_cards.count({
                where: {
                    dealer_id: dealerId,
                    status: { in: ['completed', 'delivered'] },
                    updated_at: { gte: startOfMonth }
                }
            }),

            // 3. Revenue This Month
            prisma.service_invoices.aggregate({
                where: {
                    dealer_id: dealerId,
                    status: 'completed',
                    invoice_date: { gte: startOfMonth }
                },
                _sum: {
                    paid_amount: true,
                    grand_total: true
                }
            }),

            // 4. Tech Performance (Basic) - Count of completed jobs by technician this month
            prisma.job_cards.groupBy({
                by: ['technician_id'],
                where: {
                    dealer_id: dealerId,
                    status: { in: ['completed', 'delivered'] },
                    updated_at: { gte: startOfMonth },
                    technician_id: { not: null }
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
            })
        ]);

        // Fetch Tech Names for the leaderboard
        const techIds = technicianStats.map(t => t.technician_id as string);
        const techs = await prisma.service_staff.findMany({
            where: { id: { in: techIds } },
            include: { profiles: true }
        });

        const techLeaderboard = technicianStats.map(stat => {
            const tech = techs.find(t => t.id === stat.technician_id);
            return {
                id: stat.technician_id,
                name: tech?.profiles?.full_name || 'Unknown',
                completedJobs: stat._count.id
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                metrics: {
                    activeJobs: activeJobsCount,
                    completedJobsThisMonth: completedJobsMonth,
                    revenueCollectedThisMonth: Number(revenueMonthData._sum.paid_amount || 0),
                    revenueInvoicedThisMonth: Number(revenueMonthData._sum.grand_total || 0)
                },
                technicianPerformance: techLeaderboard
            }
        });

    } catch (error: any) {
        console.error("Analytics fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
