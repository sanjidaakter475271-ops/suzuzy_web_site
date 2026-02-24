import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentTechnician } from '@/lib/auth/get-technician';

/**
 * GET: Fetch all product categories for the technician's dealer
 * Used by servicestuff app PartsSelectionModal
 */
export async function GET(req: NextRequest) {
    try {
        const technician = await getCurrentTechnician();
        if (!technician || !technician.serviceStaffId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const categories = await prisma.categories.findMany({
            where: {
                // Only show categories that have products for this dealer
                products_products_category_idTocategories: {
                    some: {
                        dealer_id: technician.dealerId,
                        status: 'approved',
                        stock_quantity: { gt: 0 }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                description: true,
                image_url: true,
                _count: {
                    select: {
                        products_products_category_idTocategories: {
                            where: {
                                dealer_id: technician.dealerId,
                                status: 'approved'
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Transform to simpler shape
        const data = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            image_url: cat.image_url,
            product_count: cat._count.products_products_category_idTocategories
        }));

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
