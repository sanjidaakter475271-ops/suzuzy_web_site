import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

type Params = Promise<{ id: string }>;

/**
 * GET: Fetch variants for a specific product
 * Used by mobile app to show sizes/types of a part
 */
export async function GET(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: productId } = await params;

        // Fetch variants and verify they belong to a product owned by the same dealer
        const variants = await prisma.product_variants.findMany({
            where: {
                product_id: productId,
                products: {
                    dealer_id: technician.dealerId,
                    status: 'approved'
                }
            },
            select: {
                id: true,
                sku: true,
                price: true,
                stock_quantity: true,
                attributes: true,
                barcode: true
            },
            orderBy: { sku: 'asc' }
        });

        // Transform Decimals to numbers
        const data = variants.map(v => ({
            id: v.id,
            product_id: productId,
            sku: v.sku || '',
            price: v.price ? Number(v.price) : 0,
            stock_quantity: v.stock_quantity || 0,
            attributes: v.attributes,
            barcode: v.barcode
        }));

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching product variants:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
