import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const categories = await prisma.categories.findMany({
            where: { is_active: true },
            orderBy: [{ level: 'asc' }, { name: 'asc' }]
        });

        return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
