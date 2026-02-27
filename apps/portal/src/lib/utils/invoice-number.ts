import { prisma } from "@/lib/prisma/client";

export async function generateInvoiceNumber(dealerId: string) {
    const today = new Date();
    const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lastInvoice = await prisma.service_invoices.findFirst({
        where: {
            dealer_id: dealerId,
            invoice_number: {
                startsWith: prefix
            }
        },
        orderBy: {
            invoice_number: 'desc'
        }
    });

    let sequence = 1;
    if (lastInvoice) {
        const lastSequence = parseInt(lastInvoice.invoice_number.split('-').pop() || '0');
        sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
}
