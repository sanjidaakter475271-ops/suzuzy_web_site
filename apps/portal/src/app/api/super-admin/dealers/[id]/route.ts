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

        const dealer = await prisma.dealers.findUnique({
            where: { id },
            include: {
                profiles_profiles_dealer_idTodealers: {
                    select: {
                        full_name: true,
                        email: true,
                        phone: true
                    }
                },
                _count: {
                    select: {
                        products: true,
                        sub_orders: true
                    }
                }
            }
        });

        if (!dealer) {
            return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
        }

        // Aggregate revenue
        const revenue = await prisma.sub_orders.aggregate({
            _sum: {
                dealer_amount: true
            },
            where: {
                dealer_id: id,
                orders: {
                    payment_status: 'paid'
                }
            }
        });

        return NextResponse.json({
            ...dealer,
            profiles: (dealer as any).profiles_profiles_dealer_idTodealers,
            totalRevenue: Number(revenue._sum.dealer_amount || 0),
            productCount: (dealer as any)._count?.products || 0,
            orderCount: (dealer as any)._count?.sub_orders || 0
        });

    } catch (error: any) {
        console.error("Dealer Detail Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
