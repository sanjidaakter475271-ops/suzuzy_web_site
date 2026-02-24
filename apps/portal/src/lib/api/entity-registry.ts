import { ZodSchema } from 'zod';
import { ProductSchema, SaleSchema, ServiceTicketSchema, AnySchema } from './validation';

export type EntityOperation = 'list' | 'create' | 'read' | 'update' | 'delete';

export interface EntityConfig {
    model: string;
    // Database-driven permissions will be used instead of hardcoded arrays.
    // The permission name will be inferred as `${key}:${operation}`.
    resourceName?: string; // Optional override if key != permission resource

    scopeBy?: string; // e.g., 'dealer_id' to filter by the current user's dealer
    includes?: any;   // Prisma include object
    orderBy?: any;    // Prisma orderBy object
    searchFields?: string[];
    schema?: ZodSchema;
}

export const ENTITY_REGISTRY: Record<string, EntityConfig> = {
    products: {
        model: 'products',
        scopeBy: 'dealer_id',
        includes: {
            categories: { select: { name: true } },
            product_images: { select: { image_url: true }, take: 5 },
            product_variants: true
        },
        orderBy: { created_at: 'desc' },
        searchFields: ['name', 'sku'],
        schema: ProductSchema
    },
    product_variants: {
        model: 'product_variants',
        searchFields: ['sku']
    },
    categories: {
        model: 'categories',
        scopeBy: 'dealer_id'
    },
    sales: {
        model: 'sales',
        scopeBy: 'dealer_id',
        includes: {
            sale_items: {
                include: {
                    products: true
                }
            }
        },
        searchFields: ['sale_number', 'customer_name'],
        schema: SaleSchema
    },
    service_tickets: {
        model: 'service_tickets',
        scopeBy: 'profiles.dealer_id',
        includes: {
            service_vehicles: {
                include: { bike_models: true }
            },
            profiles: true
        },
        searchFields: ['service_number'],
        schema: ServiceTicketSchema
    },
    service_staff: {
        model: 'service_staff',
        scopeBy: 'dealer_id',
        includes: { profiles: true }
    },
    service_ramps: {
        model: 'service_ramps',
        includes: {
            service_tickets_service_ramps_current_ticket_idToservice_tickets: {
                include: { service_vehicles: true }
            },
            service_staff: true
        },
        orderBy: { ramp_number: 'asc' }
    },
    job_cards: {
        model: 'job_cards',
        scopeBy: 'dealer_id',
        includes: {
            service_tasks: true,
            service_history: true,
            parts_usage: {
                include: {
                    part_variants: {
                        include: {
                            parts: true
                        }
                    }
                }
            },
            service_tickets: {
                include: {
                    profiles: true
                }
            }
        }
    },
    service_tasks: {
        model: 'service_tasks',
        includes: { service_staff: true }
    },
    purchase_orders: {
        model: 'purchase_orders',
        scopeBy: 'dealer_id',
        includes: {
            purchase_order_items: true,
            vendors: true
        },
        searchFields: ['po_number']
    },
    vendors: {
        model: 'vendors',
        scopeBy: 'dealer_id',
        searchFields: ['name', 'code']
    },
    brands: {
        model: 'brands'
    },
    inventory_batches: {
        model: 'inventory_batches',
        scopeBy: 'dealer_id',
        searchFields: ['batch_number']
    },
    sub_orders: {
        model: 'sub_orders',
        scopeBy: 'dealer_id',
        includes: {
            order_items: { include: { products: true } },
            orders: true
        }
    },
    payment_transactions: {
        model: 'payment_transactions',
        scopeBy: 'dealer_id'
    },
    support_tickets: {
        model: 'support_tickets',
        scopeBy: 'dealer_id',
        includes: {
            ticket_messages: true
        }
    },
    ticket_messages: {
        model: 'ticket_messages'
    },
    banners: {
        model: 'banners',
        orderBy: { starts_at: 'desc' }
    },
    dealer_ads: {
        model: 'dealer_ads',
        scopeBy: 'dealer_id'
    },
    dealer_notifications: {
        model: 'dealer_notifications',
        scopeBy: 'dealer_id'
    },
    bike_models: {
        model: 'bike_models'
    },
    orders: {
        model: 'orders',
        scopeBy: 'dealer_id',
        includes: { order_items: true, profiles: true },
        searchFields: ['order_number']
    },
    payments: {
        model: 'payments',
        scopeBy: 'user_id'
    },
    shipments: {
        model: 'shipments',
        scopeBy: 'dealer_id',
        includes: { shipment_tracking: true }
    },
    wishlists: {
        model: 'wishlists',
        scopeBy: 'user_id',
        includes: { products: true }
    },
    reviews: {
        model: 'reviews',
        includes: { profiles: true, products: true }
    },
    return_requests: {
        model: 'return_requests',
        scopeBy: 'user_id',
        includes: { return_items: true }
    },
    notifications: {
        model: 'notifications',
        scopeBy: 'user_id'
    },
    user_loyalty: {
        model: 'user_loyalty',
        scopeBy: 'user_id',
        includes: { loyalty_tiers: true }
    },
    referrals: {
        model: 'referrals',
        scopeBy: 'referrer_id'
    },
    service_requisitions: {
        model: 'service_requisitions',
        includes: {
            products: true,
            service_staff: true,
            service_tickets: true
        },
        orderBy: { created_at: 'desc' }
    },
    parts_usage: {
        model: 'parts_usage',
        includes: {
            part_variants: {
                include: {
                    parts: true
                }
            }
        }
    },
    service_history: {
        model: 'service_history',
        includes: {
            service_vehicles: true,
            job_cards: true
        },
        orderBy: { service_date: 'desc' }
    },
    profiles: {
        model: 'profiles',
        scopeBy: 'dealer_id',
        includes: { roles: true }
    }
};
