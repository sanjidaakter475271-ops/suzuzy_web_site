import { z } from 'zod';

// Generic fallback schema (allows anything, strictness can be improved over time)
export const AnySchema = z.object({}).passthrough();

// Product Schema
export const ProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    description: z.string().optional(),
    price: z.number().or(z.string().transform(val => parseFloat(val))),
    stock_quantity: z.number().int().optional().default(0),
    dealer_id: z.string().optional(), // Often injected by backend
    category_id: z.string().optional(),
    // Add other fields as needed based on schema.prisma
}).passthrough();

// Sales Schema
export const SaleSchema = z.object({
    customer_name: z.string().min(1, "Customer Name is required"),
    customer_phone: z.string().optional(),
    total_amount: z.number().min(0),
    payment_method: z.enum(['CASH', 'CARD', 'ONLINE', 'BANK_TRANSFER']).optional(),
    sale_items: z.array(z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1),
        unit_price: z.number().min(0)
    })).optional()
}).passthrough();

// Service Ticket Schema
export const ServiceTicketSchema = z.object({
    vehicle_number: z.string().min(1, "Vehicle Number is required"),
    customer_name: z.string().min(1),
    customer_phone: z.string().optional(),
    service_type: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
}).passthrough();
