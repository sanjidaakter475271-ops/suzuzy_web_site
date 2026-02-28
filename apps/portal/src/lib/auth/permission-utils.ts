/**
 * ═══════════════════════════════════════════════════════════════
 *  Centralized Permission Registry & Role → Permission Mapping
 * ═══════════════════════════════════════════════════════════════
 *
 *  - SYSTEM_PERMISSIONS: flat list of all permissions
 *  - ROLE_PERMISSIONS_MAPPING: which role gets which permissions
 *
 *  Roles are imported from the central "@/lib/auth/roles" file.
 */

import { ROLES } from "@/lib/auth/roles";

export interface SystemPermission {
    name: string;
    module: string;
    action: string;
    resource: string;
    description: string;
}

export const SYSTEM_PERMISSIONS: SystemPermission[] = [
    // Dashboard
    { name: 'view_dashboard', module: 'dashboard', action: 'view', resource: 'dashboard', description: 'View main statistics and intelligence board' },

    // Users & Personnel
    { name: 'view_users', module: 'users', action: 'view', resource: 'profiles', description: 'Access personnel registry' },
    { name: 'create_user', module: 'users', action: 'create', resource: 'profiles', description: 'Authorize new personnel' },
    { name: 'edit_user', module: 'users', action: 'edit', resource: 'profiles', description: 'Modify personnel clearance levels' },
    { name: 'delete_user', module: 'users', action: 'delete', resource: 'profiles', description: 'Revoke personnel authorization' },

    // Roles & Governance
    { name: 'view_roles', module: 'roles', action: 'view', resource: 'roles', description: 'View system authority hierarchy' },
    { name: 'create_role', module: 'roles', action: 'create', resource: 'roles', description: 'Define new authority roles' },
    { name: 'edit_permissions', module: 'roles', action: 'edit_permissions', resource: 'roles', description: 'Configure role-based privileges' },

    // Dealers & Consortium
    { name: 'view_dealers', module: 'dealers', action: 'view', resource: 'dealers', description: 'View dealer consortium registry' },
    { name: 'approve_dealer', module: 'dealers', action: 'approve', resource: 'dealers', description: 'Validate and approve dealer applications' },
    { name: 'suspend_dealer', module: 'dealers', action: 'suspend', resource: 'dealers', description: 'Freeze dealer operational status' },

    // Business Units
    { name: 'manage_business_units', module: 'business_units', action: 'manage', resource: 'business_units', description: 'Full control over branch/unit infrastructure' },

    // Products & Inventory
    { name: 'view_products', module: 'products', action: 'view', resource: 'products', description: 'Access global product catalog' },
    { name: 'create_product', module: 'products', action: 'create', resource: 'products', description: 'Register new assets/products' },
    { name: 'edit_product', module: 'products', action: 'edit', resource: 'products', description: 'Update product technical data' },
    { name: 'manage_inventory', module: 'inventory', action: 'manage', resource: 'inventory', description: 'Control stock levels and warehouse ops' },

    // Sales & Revenue
    { name: 'view_orders', module: 'orders', action: 'view', resource: 'orders', description: 'Monitor transaction history' },
    { name: 'create_order', module: 'orders', action: 'create', resource: 'orders', description: 'Initiate new sales transactions' },
    { name: 'update_order_status', module: 'orders', action: 'update_status', resource: 'orders', description: 'Modify phase transitions in sales flow' },

    // Payments
    { name: 'view_payments', module: 'payments', action: 'view', resource: 'payments', description: 'Review financial transaction records' },
    { name: 'create_payment', module: 'payments', action: 'create', resource: 'payments', description: 'Process new financial entries' },
    { name: 'manage_payments', module: 'payments', action: 'manage', resource: 'payments', description: 'Full authority over payment reconciliations' },

    // Shipments
    { name: 'view_shipments', module: 'shipments', action: 'view', resource: 'shipments', description: 'Monitor logistics and tracking' },
    { name: 'create_shipment', module: 'shipments', action: 'create', resource: 'shipments', description: 'Generate tracking and shipment manifests' },
    { name: 'update_shipment_status', module: 'shipments', action: 'update_status', resource: 'shipments', description: 'Control logistics phase transitions' },

    // Returns
    { name: 'view_returns', module: 'returns', action: 'view', resource: 'returns', description: 'Access return request database' },
    { name: 'create_return_request', module: 'returns', action: 'create_request', resource: 'returns', description: 'Initiate asset return flow' },
    { name: 'approve_return', module: 'returns', action: 'approve', resource: 'returns', description: 'Authorize return and refund' },
    { name: 'reject_return', module: 'returns', action: 'reject', resource: 'returns', description: 'Deny return request based on inspection' },

    // Loyalty & Referrals
    { name: 'view_loyalty', module: 'loyalty', action: 'view', resource: 'loyalty', description: 'View customer loyalty data' },
    { name: 'manage_loyalty_points', module: 'loyalty', action: 'manage_points', resource: 'loyalty', description: 'Adjust or manually credit loyalty points' },
    { name: 'view_referrals', module: 'referrals', action: 'view', resource: 'referrals', description: 'View referral system activity' },
    { name: 'manage_referrals', module: 'referrals', action: 'manage', resource: 'referrals', description: 'Control referral payouts and rewards' },

    // Reviews
    { name: 'view_reviews', module: 'reviews', action: 'view', resource: 'reviews', description: 'Monitor customer feedback and ratings' },
    { name: 'approve_review', module: 'reviews', action: 'approve', resource: 'reviews', description: 'Publish or moderate reviews' },
    { name: 'delete_review', module: 'reviews', action: 'delete', resource: 'reviews', description: 'Remove non-compliant reviews' },

    // Service & Technical
    { name: 'view_service_tasks', module: 'service', action: 'view_tasks', resource: 'service_tasks', description: 'Access technical task registry' },
    { name: 'manage_service_tasks', module: 'service', action: 'manage_tasks', resource: 'service_tasks', description: 'Assign and update technical tasks' },
    { name: 'manage_ramps', module: 'service', action: 'manage_ramps', resource: 'service_ramps', description: 'Control service center ramp allocation' },

    // Reports & Analytics
    { name: 'view_reports', module: 'reports', action: 'view', resource: 'reports', description: 'Access deep-dive analytics and metrics' },
    { name: 'export_reports', module: 'reports', action: 'export', resource: 'reports', description: 'Extract system intelligence data (CSV/PDF)' },

    // System & Settings
    { name: 'manage_settings', module: 'settings', action: 'manage', resource: 'settings', description: 'Configure core platform parameters' },
    { name: 'view_audit_logs', module: 'settings', action: 'view_audit_logs', resource: 'audit_logs', description: 'Inspect system operational logs' },
    { name: 'view_wishlists', module: 'wishlist', action: 'view', resource: 'wishlists', description: 'Monitor customer wishlist trends' },
];

/**
 * ═══════════════════════════════════════════════════════════════
 *  ROLE → PERMISSIONS MAPPING
 *  Every role from ROLES must have an entry here.
 * ═══════════════════════════════════════════════════════════════
 */
export const ROLE_PERMISSIONS_MAPPING: Record<string, string[]> = {

    // ── SUPER ADMIN ── gets everything
    [ROLES.SUPER_ADMIN]: SYSTEM_PERMISSIONS.map(p => p.name),

    // ── SHOWROOM ADMIN ── full showroom authority
    [ROLES.SHOWROOM_ADMIN]: [
        'view_dashboard', 'view_users', 'create_user', 'edit_user',
        'view_roles', 'view_dealers',
        'view_products', 'create_product', 'edit_product', 'manage_inventory',
        'view_orders', 'create_order', 'update_order_status',
        'view_payments', 'create_payment', 'manage_payments',
        'view_shipments', 'create_shipment', 'update_shipment_status',
        'view_returns', 'approve_return', 'reject_return',
        'view_reviews', 'approve_review',
        'view_reports', 'export_reports',
        'view_audit_logs',
    ],

    // ── SERVICE ADMIN ── full service center authority
    [ROLES.SERVICE_ADMIN]: [
        'view_dashboard', 'view_users', 'create_user', 'edit_user',
        'view_products', 'manage_inventory',
        'view_orders', 'update_order_status',
        'view_payments', 'create_payment',
        'view_returns', 'approve_return',
        'view_service_tasks', 'manage_service_tasks', 'manage_ramps',
        'view_reports', 'export_reports',
    ],

    // ── SHOWROOM SALES ADMIN ── sales operations in showroom
    [ROLES.SHOWROOM_SALES_ADMIN]: [
        'view_dashboard',
        'view_products', 'create_product', 'edit_product',
        'view_orders', 'create_order', 'update_order_status',
        'view_payments', 'create_payment', 'manage_payments',
        'view_shipments', 'create_shipment',
        'view_returns', 'approve_return',
        'view_reports', 'export_reports',
    ],

    // ── SERVICE SALES ADMIN ── sales operations in service center
    [ROLES.SERVICE_SALES_ADMIN]: [
        'view_dashboard',
        'view_products',
        'view_orders', 'create_order', 'update_order_status',
        'view_payments', 'create_payment', 'manage_payments',
        'view_service_tasks',
        'view_reports', 'export_reports',
    ],

    // ── SALES ADMIN ── generic sales admin (alias-level same as showroom_sales_admin)
    [ROLES.SALES_ADMIN]: [
        'view_dashboard',
        'view_products', 'create_product', 'edit_product',
        'view_orders', 'create_order', 'update_order_status',
        'view_payments', 'create_payment', 'manage_payments',
        'view_shipments', 'create_shipment',
        'view_returns', 'approve_return',
        'view_reports', 'export_reports',
    ],

    // ── GENERIC ADMIN ── back-office admin
    [ROLES.ADMIN]: [
        'view_dashboard', 'view_users', 'view_roles', 'view_dealers',
        'view_products', 'create_product', 'edit_product', 'manage_inventory',
        'view_orders', 'create_order', 'update_order_status',
        'view_payments', 'create_payment', 'manage_payments',
        'view_shipments', 'create_shipment',
        'view_returns', 'approve_return',
        'view_reviews', 'approve_review',
        'view_reports', 'export_reports',
        'manage_settings', 'view_audit_logs',
    ],

    // ── SUPPORT ── customer support staff
    [ROLES.SUPPORT]: [
        'view_dashboard',
        'view_users',
        'view_products',
        'view_orders', 'update_order_status',
        'view_payments',
        'view_returns', 'approve_return', 'reject_return',
        'view_reviews', 'approve_review', 'delete_review',
        'view_reports',
    ],

    // ── ACCOUNTANT ── finance-focused
    [ROLES.ACCOUNTANT]: [
        'view_dashboard',
        'view_orders',
        'view_payments', 'create_payment', 'manage_payments',
        'view_reports', 'export_reports',
    ],

    // ── SELLS STUFF ── showroom floor sales staff
    [ROLES.SELLS_STUFF]: [
        'view_products',
        'view_orders', 'create_order',
        'view_payments', 'create_payment',
    ],

    // ── SERVICE STUFF ── service floor staff
    [ROLES.SERVICE_STUFF]: [
        'view_products',
        'view_service_tasks', 'manage_service_tasks',
    ],

    // ── SERVICE TECHNICIAN ── hands-on technician
    [ROLES.SERVICE_TECHNICIAN]: [
        'view_products',
        'view_service_tasks', 'manage_service_tasks',
    ],

    // ── DEALER OWNER ── full dealer authority
    [ROLES.DEALER_OWNER]: [
        'view_dashboard', 'view_products', 'create_product', 'edit_product', 'manage_inventory',
        'view_orders', 'create_order', 'update_order_status',
        'view_payments', 'create_payment',
        'view_shipments', 'create_shipment',
        'view_returns', 'create_return_request',
        'view_loyalty', 'view_referrals',
        'view_reports', 'export_reports',
    ],

    // ── DEALER (legacy alias) ── same as dealer_owner
    [ROLES.DEALER]: [
        'view_dashboard', 'view_products', 'create_product', 'edit_product', 'manage_inventory',
        'view_orders', 'create_order', 'update_order_status',
        'view_payments', 'create_payment',
        'view_shipments', 'create_shipment',
        'view_returns', 'create_return_request',
        'view_loyalty', 'view_referrals',
        'view_reports', 'export_reports',
    ],

    // ── DEALER MANAGER ── manages dealer operations
    [ROLES.DEALER_MANAGER]: [
        'view_dashboard', 'view_products', 'manage_inventory',
        'view_orders', 'create_order', 'update_order_status',
        'view_payments',
        'view_shipments',
        'view_returns',
        'view_reports',
    ],

    // ── DEALER STAFF ── basic dealer employee
    [ROLES.DEALER_STAFF]: [
        'view_products', 'manage_inventory',
        'view_orders', 'create_order',
        'view_payments',
        'view_shipments',
    ],

    // ── SUB DEALER ── downstream reseller
    [ROLES.SUB_DEALER]: [
        'view_dashboard', 'view_products',
        'view_orders', 'create_order',
        'view_payments',
        'view_returns', 'create_return_request',
        'view_loyalty', 'view_referrals',
    ],

    // ── CUSTOMER ── end-user
    [ROLES.CUSTOMER]: [
        'view_products',
        'view_orders', 'create_order',
        'create_return_request',
        'view_loyalty', 'view_referrals',
        'view_reviews',
        'view_wishlists',
    ],
};
