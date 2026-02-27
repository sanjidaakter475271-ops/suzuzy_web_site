import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";
import { broadcast } from "@/lib/socket-server";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

        // transport is ignored for now as per user logic
        void transport;

        // Create Sale in transaction
        const sale = await prisma.$transaction(async (tx) => {
            let totalCost = 0;

            // 1. Pre-calculate costs and fetch products
            const productData = [];
            for (const item of items) {
                const product = await tx.products.findUnique({
                    where: { id: item.productId }
                });
                const cost = Number(product?.cost_price || 0);
                totalCost += (cost * item.qty);
                productData.push({ ...item, costPrice: cost, product });
            }

            const discountAmount = (subtotal * (discount || 0)) / 100;

            // 2. Create Sale Record
            const newSale = await tx.sales.create({
                data: {
                    dealer_id: user.dealerId || "",
                    customer_id: customerId,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    customer_address: customerAddress,
                    sale_number: `SALE-${Date.now()}`,
                    subtotal: subtotal,
                    discount_value: discount || 0, // percentage
                    discount_amount: discountAmount, // amount in currency
                    grand_total: total,
                    payment_method: paymentMethod || 'cash',
                    status: 'paid',
                    order_id: jobCardId,
                    total_cost: totalCost,
                    total_profit: total - totalCost, // This now includes labor as profit
                    other_charges: laborCost || 0
                }
            });

            // 3. Create Sale Items & Deduct Stock if needed
            for (const item of productData) {
                await tx.sale_items.create({
                    data: {
                        sale_id: newSale.id,
                        product_id: item.productId,
                        product_name: item.name,
                        quantity: item.qty,
                        unit_selling_price: item.price,
                        unit_cost_price: item.costPrice,
                        total_amount: item.amount || (item.price * item.qty),
                    }
                });

                // If NOT from a job card (which already deducted stock via requisition)
                if (!jobCardId && item.product) {
                    const oldStock = item.product.stock_quantity || 0;
                    const newStock = oldStock - item.qty;

                    await tx.products.update({
                        where: { id: item.productId },
                        data: { stock_quantity: newStock }
                    });

                    // Add movement record
                    await tx.inventory_movements.create({
                        data: {
                            dealer_id: user.dealerId || item.product.dealer_id || "",
                            product_id: item.productId,
                            movement_type: 'stock_out',
                            quantity_before: oldStock,
                            quantity_change: -item.qty,
                            quantity_after: newStock,
                            reference_type: 'sale',
                            reference_id: newSale.id,
                            performed_by: user.userId,
                            reason: `Direct Sale ${newSale.sale_number}`
                        }
                    });
                }
            }

            // 4. Update Job Card status if it was from a job
            if (jobCardId) {
                // If we have a job card, we might want to store labor cost in other_charges

                // If we have a job card, we might want to store labor cost in other_charges
                // This is a mapping decision.

                await tx.job_cards.update({
                    where: { id: jobCardId },
                    data: { status: 'delivered' }
                });
            }

            return newSale;
        });

        // 5. Real-time broadcasts
        await broadcast('inventory:changed', { triggeredBy: user.userId });
        if (jobCardId) {
            await broadcast('job_cards:changed', { id: jobCardId, status: 'delivered' });
        }

        return NextResponse.json({ success: true, data: sale });

    } catch (error: unknown) {
        console.error("Sale Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const sales = await prisma.sales.findMany({
            where: { dealer_id: user.dealerId || "" },
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

        return NextResponse.json({ success: true, data: formattedSales });

    } catch (error: unknown) {
        console.error("Fetch Sales Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
