import { NextRequest } from "next/server";
import { handleList, handleCreate } from "@/lib/api/api-services";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    const { entity } = await params;
    const { searchParams } = new URL(req.url);
    return await handleList(entity, searchParams);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    const { entity } = await params;
    const body = await req.json();
    return await handleCreate(entity, body);
}
