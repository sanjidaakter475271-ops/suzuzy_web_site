import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const product = await prisma.products.findUnique({
            where: {
                id: id,
                dealer_id: technician.dealerId,
            },
            select: {
                id: true,
                name: true,
                sku: true,
                brand: true,
                base_price: true,
                sale_price: true,
                stock_quantity: true,
                product_images: {
                    take: 1,
                    select: { image_url: true }
                },
                category_id: true
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const data = {
            id: product.id,
            name: product.name,
            sku: product.sku || '',
            brand: product.brand || '',
            base_price: product.base_price ? Number(product.base_price) : 0,
            sale_price: product.sale_price ? Number(product.sale_price) : undefined,
            stock_quantity: Number(product.stock_quantity || 0),
            image_url: product.product_images?.[0]?.image_url || null,
            category_id: product.category_id
        };

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
