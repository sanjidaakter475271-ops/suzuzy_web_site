import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

type Params = Promise<{ id: string }>;

// Helper to convert Prisma Decimals to Numbers for JSON response
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

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const quantity = body.quantity;

        if (quantity === undefined || quantity < 0) {
            return NextResponse.json({ error: 'Valid quantity required' }, { status: 400 });
        }

        const requisition = await prisma.service_requisitions.findUnique({
            where: { id },
            include: { products: true }
        });

        if (!requisition || requisition.staff_id !== technician.serviceStaffId) {
            return NextResponse.json({ error: 'Requisition not found or access denied' }, { status: 404 });
        }

        if (requisition.status !== 'pending') {
            return NextResponse.json({ error: 'Only pending requisitions can be modified' }, { status: 400 });
        }

        if (quantity === 0) {
            await prisma.service_requisitions.delete({ where: { id } });
            return NextResponse.json({ success: true, message: 'Requisition deleted' });
        }

        // Check stock
        if (requisition.products) {
            const stockQty = requisition.products.stock_quantity ?? 0;
            if (stockQty < quantity) {
                return NextResponse.json({
                    error: 'Insufficient stock',
                    available: Number(stockQty)
                }, { status: 400 });
            }
        }

        const price = Number(requisition.unit_price || 0);
        const updated = await prisma.service_requisitions.update({
            where: { id },
            data: {
                quantity,
                total_price: price * quantity
            }
        });

        return NextResponse.json({ success: true, data: serialize(updated) });
    } catch (error: any) {
        console.error('Error updating requisition:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const requisition = await prisma.service_requisitions.findUnique({
            where: { id }
        });

        if (!requisition || requisition.staff_id !== technician.serviceStaffId) {
            return NextResponse.json({ error: 'Requisition not found or access denied' }, { status: 404 });
        }

        if (requisition.status !== 'pending') {
            return NextResponse.json({ error: 'Only pending requisitions can be deleted' }, { status: 400 });
        }

        await prisma.service_requisitions.delete({ where: { id } });

        return NextResponse.json({ success: true, message: 'Requisition deleted' });
    } catch (error: any) {
        console.error('Error deleting requisition:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
