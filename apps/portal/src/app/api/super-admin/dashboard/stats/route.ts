import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    console.log("Stats API Hit: /api/super-admin/dashboard/stats");
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const [
            revenueResult,
            activeDealers,
            pendingApprovals,
            totalProducts,
            totalUsers
        ] = await Promise.all([
            prisma.orders.aggregate({
                _sum: { grand_total: true },
                where: { payment_status: 'paid' }
            }),
            prisma.dealers.count({
                where: { status: 'active' }
            }),
            prisma.dealers.count({
                where: { status: 'pending' }
            }),
            prisma.products.count(),
            prisma.profiles.count()
        ]);

        return NextResponse.json({
            totalRevenue: Number(revenueResult._sum.grand_total || 0),
            activeDealers,
            pendingApprovals,
            totalProducts,
            totalUsers
        });

    } catch (error: any) {
        console.error("Dashboard Stats Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
