import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcast } from "@/lib/socket-server";
import { createNotification } from "@/lib/notifications";

// Helper to convert Prisma Decimals to Numbers for JSON serialization
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

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.dealerId) {
            return NextResponse.json({ error: "Unauthorized or Dealer context missing" }, { status: 401 });
        }

        const body = await req.json();
        const {
            customerId,
            customerName,
            customerPhone,
            customerAddress,
            items,
            subtotal,
            discount,
            transport,
            total,
            paymentMethod,
            jobCardId,
            laborCost
        } = body;

        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // Create Sale in transaction
        const sale = await prisma.$transaction(async (tx) => {
            let totalCost = 0;

            // 1. Pre-calculate costs and fetch products
            const productData = [];
            for (const item of items) {
                const product = await tx.products.findUnique({
                    where: { id: item.productId }
                });

                if (!product) {
                    throw new Error(`Product not found: ${item.name || item.productId}`);
                }

                // Check stock for direct sales (no requisition)
                if (!item.requisitionId) {
                    const currentStock = product.stock_quantity || 0;
                    if (currentStock < item.qty) {
                        throw new Error(`Insufficient stock for ${product.name}. Available: ${currentStock}, Requested: ${item.qty}`);
                    }
                }

                const cost = Number(product.cost_price || 0);
                totalCost += (cost * item.qty);
                productData.push({ ...item, costPrice: cost, product });
            }

            const discountAmount = (Number(subtotal) * Number(discount || 0)) / 100;

            // 2. Create Sale Record
            const newSale = await tx.sales.create({
                data: {
                    dealer_id: user.dealerId!,
                    customer_id: customerId || null,
                    customer_name: customerName || null,
                    customer_phone: customerPhone || null,
                    customer_address: customerAddress || null,
                    sale_number: `SALE-${Date.now()}`,
                    subtotal: Number(subtotal),
                    discount_value: Number(discount || 0), // percentage
                    discount_amount: discountAmount, // amount in currency
                    grand_total: Number(total),
                    payment_method: paymentMethod || 'cash',
                    status: 'paid',
                    total_cost: totalCost,
                    total_profit: Number(total) - totalCost,
                    other_charges: Number(laborCost || 0),
                    notes: jobCardId ? `Linked to Job Card: ${jobCardId}` : undefined
                }
            });

            // 3. Create Sale Items & Deduct Stock if needed
            for (const item of productData) {
                await tx.sale_items.create({
                    data: {
                        sale_id: newSale.id,
                        product_id: item.productId,
                        product_name: item.name || item.product.name,
                        quantity: Number(item.qty),
                        unit_selling_price: Number(item.price),
                        unit_cost_price: Number(item.costPrice),
                        total_amount: Number(item.amount || (item.price * item.qty)),
                    }
                });

                // Deduct stock ONLY if not already deducted (i.e. if it's NOT a requisition from a job card)
                if (!item.requisitionId) {
                    const oldStock = item.product.stock_quantity || 0;
                    const newStock = oldStock - Number(item.qty);

                    await tx.products.update({
                        where: { id: item.productId },
                        data: { stock_quantity: newStock }
                    });

                    // Add movement record
                    await tx.inventory_movements.create({
                        data: {
                            dealer_id: user.dealerId!,
                            product_id: item.productId,
                            movement_type: 'stock_out',
                            quantity_before: oldStock,
                            quantity_change: -Number(item.qty),
                            quantity_after: newStock,
                            reference_type: 'sale',
                            reference_id: newSale.id,
                            reference_number: newSale.sale_number,
                            performed_by: user.userId!,
                            reason: `Direct Sale`
                        }
                    });
                }
            }

            // 4. Update Job Card status if it was from a job
            if (jobCardId) {
                await tx.job_cards.update({
                    where: { id: jobCardId },
                    data: { status: 'delivered' }
                });

                // Mark all approved requisitions as 'issued' since they are now part of a completed sale
                await tx.service_requisitions.updateMany({
                    where: {
                        job_card_id: jobCardId,
                        status: 'approved'
                    },
                    data: {
                        status: 'issued'
                    }
                });
            }

            return newSale;
        });

        // 5. Real-time broadcasts
        await broadcast('inventory:changed', { triggeredBy: user.userId! });
        if (jobCardId) {
            await broadcast('job_cards:changed', { id: jobCardId, status: 'delivered' });
            await broadcast('requisition:status_changed', {
                jobId: jobCardId,
                status: 'issued',
                dealerId: user.dealerId!
            });
        }

        // 6. Create system notification for the user
        await createNotification({
            userId: user.userId!,
            title: 'Sale Completed',
            message: `Sale ${sale.sale_number} for ৳${sale.grand_total} was processed successfully.`,
            type: 'success',
            linkUrl: `/service-admin/finance/sales/${sale.id}`
        });

        return NextResponse.json({ success: true, data: serialize(sale) });

    } catch (error: any) {
        console.error("Sale Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process sale" }, { status: 500 });
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.dealerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const sales = await prisma.sales.findMany({
            where: { dealer_id: user.dealerId! },
            orderBy: { created_at: 'desc' },
            take: 100
        });

        // Format for POS store
        const formattedSales = sales.map(s => ({
            id: s.id,
            invoiceNo: s.sale_number,
            customerId: s.customer_name || s.customer_phone || s.customer_id || 'Walk-in',
            total: Number(s.grand_total),
            status: s.status,
            createdAt: s.created_at
        }));

        return NextResponse.json({ success: true, data: serialize(formattedSales) });

    } catch (error: any) {
        console.error("Fetch Sales Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch sales" }, { status: 500 });
    }
}
