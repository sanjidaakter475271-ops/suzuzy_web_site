import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

/**
 * GET: Fetch products for category, filtered by technician's dealer
 * Used by servicestuff app PartsSelectionModal
 * Query params: categoryId (required)
 */
export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');

        if (!categoryId) {
            return NextResponse.json({ error: 'categoryId is required' }, { status: 400 });
        }

        const products = await prisma.products.findMany({
            where: {
                category_id: categoryId,
                dealer_id: technician.dealerId,
                status: 'approved'
            },
            select: {
                id: true,
                name: true,
                sku: true,
                part_number: true,
                brand: true,
                base_price: true,
                sale_price: true,
                stock_quantity: true,
                stock_status: true,
                low_stock_threshold: true,
                product_images: {
                    take: 1,
                    select: { image_url: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Transform to match ProductDetail type + convert Decimals to numbers
        const data = products.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku || '',
            part_number: p.part_number || '',
            brand: p.brand || '',
            base_price: Number(p.base_price || 0),
            sale_price: p.sale_price ? Number(p.sale_price) : undefined,
            stock_quantity: p.stock_quantity || 0,
            stock_status: p.stock_status || 'in_stock',
            image_url: p.product_images?.[0]?.image_url || null,
            category_id: categoryId
        }));

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
