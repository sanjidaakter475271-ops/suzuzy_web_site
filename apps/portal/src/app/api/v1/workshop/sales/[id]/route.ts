import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const sale = await prisma.sales.findUnique({
            where: { id: id },
            include: {
                sale_items: true
            }
        });

        if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 });

        let jobInfo: any = null;
        if (sale.order_id) {
            // Check if this refers to a job card
            const jobCard = await prisma.job_cards.findUnique({
                where: { id: sale.order_id },
                include: {
                    service_tickets: {
                        include: {
                            service_vehicles: {
                                include: {
                                    bike_models: true
                                }
                            }
                        }
                    }
                }
            });

            if (jobCard) {
                jobInfo = {
                    jobNo: jobCard.service_tickets?.service_number || "N/A",
                    vehicleModel: jobCard.service_tickets?.service_vehicles?.bike_models?.name || "N/A",
                    vehicleRegNo: jobCard.service_tickets?.service_vehicles?.engine_number || "N/A",
                    chassisNo: jobCard.service_tickets?.service_vehicles?.chassis_number || "N/A"
                };
            }
        }

        // Format for the invoice view
        const formattedSale = {
            id: sale.id,
            invoiceNo: sale.sale_number,
            createdAt: sale.created_at, // Use createdAt for InvoicePreview
            date: sale.created_at,
            customerName: sale.customer_name || 'Walk-in Customer',
            customerPhone: sale.customer_phone,
            customerAddress: sale.customer_address,
            customerId: sale.customer_id,
            vehicleModel: jobInfo?.vehicleModel || "N/A",
            vehicleRegNo: jobInfo?.vehicleRegNo || "N/A",
            chassisNo: jobInfo?.chassisNo || "N/A",
            jobNo: jobInfo?.jobNo || sale.sale_number,
            items: sale.sale_items.map(item => ({
                id: item.id,
                description: item.product_name,
                qty: item.quantity,
                cost: Number(item.unit_selling_price),
                amount: Number(item.total_amount)
            })),
            laborCost: Number(sale.other_charges || 0),
            partsCost: Number(sale.subtotal) - Number(sale.other_charges || 0),
            discount: Number(sale.discount_value || 0),
            total: Number(sale.grand_total),
            paymentMethod: sale.payment_method,
            status: sale.status
        };

        return NextResponse.json({ success: true, data: formattedSale });

    } catch (error: any) {
        console.error("Fetch Sale Detail Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
