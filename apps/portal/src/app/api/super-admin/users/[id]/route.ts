import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const profile = await prisma.profiles.findUnique({
            where: { id },
            include: {
                roles: true
            }
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Fetch specialized data based on role
        let activityData: any = {};

        if (profile.role === 'dealer' && profile.dealer_id) {
            const [orders, payments] = await Promise.all([
                prisma.sub_orders.findMany({
                    where: { dealer_id: profile.dealer_id },
                    include: {
                        orders: true
                    },
                    orderBy: { created_at: 'desc' },
                    take: 20
                }),
                prisma.dealer_payouts.findMany({
                    where: { dealer_id: profile.dealer_id },
                    orderBy: { created_at: 'desc' },
                    take: 20
                })
            ]);
            activityData = { orders, payments };
        } else if (profile.role === 'customer') {
            const orders = await prisma.orders.findMany({
                where: { user_id: id },
                orderBy: { created_at: 'desc' },
                take: 20
            });
            activityData = { orders };
        } else if (profile.role === 'accountant') {
            const payments = await prisma.payment_transactions.findMany({
                where: { received_by: id },
                orderBy: { created_at: 'desc' },
                take: 20
            });
            activityData = { payments };
        }

        return NextResponse.json({
            ...profile,
            ...activityData
        });

    } catch (error: any) {
        console.error("User Detail Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
