import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.dealerId && user.role !== 'admin')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const key = searchParams.get("key");

        if (!key) {
            return NextResponse.json({ error: "Missing setting key" }, { status: 400 });
        }

        const setting = await prisma.dealer_settings.findFirst({
            where: { dealer_id: user.dealerId, setting_key: key },
        });

        return NextResponse.json({ success: true, data: setting?.setting_value || null });
    } catch (error: any) {
        console.error("[SETTINGS_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.dealerId && user.role !== 'admin')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
        }

        // Upsert setting
        const setting = await prisma.dealer_settings.upsert({
            where: {
                dealer_id_setting_key: {
                    dealer_id: user.dealerId as string,
                    setting_key: key,
                }
            },
            update: { setting_value: value },
            create: {
                dealer_id: user.dealerId as string,
                setting_key: key,
                setting_value: value,
            }
        });

        return NextResponse.json({ success: true, data: setting });
    } catch (error: any) {
        console.error("[SETTINGS_PUT]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
