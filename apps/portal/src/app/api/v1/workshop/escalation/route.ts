import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'rules';
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        if (type === 'rules') {
            const rules = await prisma.escalation_rules.findMany({
                where: { dealer_id: dealerId }
            });
            return NextResponse.json({ success: true, data: rules || [] });
        }

        if (type === 'history') {
            const history = await prisma.escalation_history.findMany({
                where: { dealer_id: dealerId },
                include: { escalation_rules: true, escalated_to_profile: { select: { full_name: true } } },
                orderBy: { created_at: 'desc' }
            });
            return NextResponse.json({ success: true, data: history || [] });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const dealerId = user.dealerId;
        if (!dealerId) return NextResponse.json({ error: "Dealer context required" }, { status: 400 });

        const body = await req.json();
        const { name, trigger_type, condition, action } = body;

        const rule = await prisma.escalation_rules.create({
            data: {
                dealer_id: dealerId,
                name,
                trigger_type,
                condition,
                action,
                is_active: true
            }
        });

        return NextResponse.json({ success: true, data: rule });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
