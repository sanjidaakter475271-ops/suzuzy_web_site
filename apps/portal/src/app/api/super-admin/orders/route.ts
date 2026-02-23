import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        const payload = token ? await verifyToken(token) : null;

        if (!payload || payload.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const orders = await prisma.orders.findMany({
            include: {
                sub_orders: {
                    include: {
                        dealers: {
                            select: {
                                business_name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json(orders);
    } catch (error: any) {
        console.error("Orders List Fetch Error:", error);
        return NextResponse.json({ error: "Universal logistics retrieval failure" }, { status: 500 });
    }
}
