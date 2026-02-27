import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

// Local recursive Decimal-to-Number serializer
const serialize = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(serialize);
    if (typeof obj === 'object') {
        if (obj.constructor && obj.constructor.name === 'Decimal') {
            return Number(obj);
        }
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = serialize(obj[key]);
        }
        return newObj;
    }
    return obj;
};

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ success: false, error: "Dealer context required" }, { status: 400 });

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');
        const strategy = searchParams.get('strategy') || 'FIFO'; // FIFO or LIFO

        if (!productId) {
            return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
        }

        const batches = await prisma.inventory_batches.findMany({
            where: {
                dealer_id: dealerId,
                product_id: productId,
                current_quantity: { gt: 0 },
                status: 'active'
            },
            orderBy: {
                received_date: strategy === 'FIFO' ? 'asc' : 'desc'
            },
            include: {
                vendors: { select: { name: true } }
            }
        });

        return NextResponse.json({ success: true, data: serialize(batches) });

    } catch (error: any) {
        console.error("Batch fetch error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
