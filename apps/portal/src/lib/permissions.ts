export const PERMISSIONS = {
    WORKSHOP: {
        VIEW: 'workshop.view',
        CREATE: 'workshop.create',
        EDIT: 'workshop.edit',
        DELETE: 'workshop.delete',
        ASSIGN_TECHNICIAN: 'workshop.assign_technician',
        FINALIZE: 'workshop.finalize',
    },
    JOB_CARD: {
        VIEW: 'job_card.view',
        CREATE: 'job_card.create',
        EDIT: 'job_card.edit',
        REQUEST_QC: 'job_card.request_qc',
        APPROVE_REQUISITION: 'job_card.approve_requisition',
    },
    INVENTORY: {
        VIEW: 'inventory.view',
        MANAGE: 'inventory.manage',
        APPROVE_ADJUSTMENT: 'inventory.approve_adjustment',
        PURCHASE_ORDER: 'inventory.purchase_order',
    },
    FINANCE: {
        VIEW: 'finance.view',
        CREATE_INVOICE: 'finance.create_invoice',
        PROCESS_PAYMENT: 'finance.process_payment',
        APPROVE_EXPENSE: 'finance.approve_expense',
    },
    SERVICE_BILLING: {
        LIST: 'service_invoices:list',
        CREATE: 'service_invoices:create',
        READ: 'service_invoices:read',
        UPDATE: 'service_invoices:update',
        DELETE: 'service_invoices:delete',
    },
    WARRANTY: {
        LIST: 'warranty_claims:list',
        CREATE: 'warranty_claims:create',
        READ: 'warranty_claims:read',
        UPDATE: 'warranty_claims:update',
        DELETE: 'warranty_claims:delete',
    },
    SCHEDULING: {
        LIST: 'staff_schedules:list',
        MANAGE: 'staff_schedules:manage',
    },
    ESCALATION: {
        LIST: 'escalation_rules:list',
        MANAGE: 'escalation_rules:manage',
        HISTORY: 'escalation_history:list',
    }
} as const;
