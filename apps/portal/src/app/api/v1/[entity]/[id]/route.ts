import { NextRequest } from "next/server";
import { handleRead, handleUpdate, handleDelete } from "@/lib/api/api-services";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const { entity, id } = await params;
    return await handleRead(entity, id);
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const { entity, id } = await params;
    const body = await req.json();
    return await handleUpdate(entity, id, body);
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const { entity, id } = await params;
    const body = await req.json();
    return await handleUpdate(entity, id, body);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const { entity, id } = await params;
    return await handleDelete(entity, id);
}
