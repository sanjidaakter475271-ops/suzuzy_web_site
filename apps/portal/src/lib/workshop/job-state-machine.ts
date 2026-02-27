export const JOB_STATUS = {
    CREATED: 'created',
    DIAGNOSED: 'diagnosed',
    ESTIMATE_SENT: 'estimate_sent',
    CUSTOMER_APPROVED: 'customer_approved',
    IN_PROGRESS: 'in_progress',
    WAITING_PARTS: 'waiting_parts',
    ADDITIONAL_WORK: 'additional_work',
    QC_PENDING: 'qc_pending',
    QC_APPROVED: 'qc_approved',
    QC_REJECTED: 'qc_rejected',
    COMPLETED: 'completed',
    INVOICED: 'invoiced',
    PAID: 'paid',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    ON_HOLD: 'on_hold',
} as const;

export type JobStatusValue = typeof JOB_STATUS[keyof typeof JOB_STATUS];

// Valid transitions map
const VALID_TRANSITIONS: Record<string, string[]> = {
    [JOB_STATUS.CREATED]: [JOB_STATUS.DIAGNOSED, JOB_STATUS.CANCELLED, JOB_STATUS.ON_HOLD],
    [JOB_STATUS.DIAGNOSED]: [JOB_STATUS.ESTIMATE_SENT, JOB_STATUS.CANCELLED, JOB_STATUS.ON_HOLD],
    [JOB_STATUS.ESTIMATE_SENT]: [JOB_STATUS.CUSTOMER_APPROVED, JOB_STATUS.CANCELLED],
    [JOB_STATUS.CUSTOMER_APPROVED]: [JOB_STATUS.IN_PROGRESS, JOB_STATUS.CANCELLED],
    [JOB_STATUS.IN_PROGRESS]: [JOB_STATUS.WAITING_PARTS, JOB_STATUS.ADDITIONAL_WORK, JOB_STATUS.QC_PENDING, JOB_STATUS.CANCELLED, JOB_STATUS.ON_HOLD],
    [JOB_STATUS.WAITING_PARTS]: [JOB_STATUS.IN_PROGRESS, JOB_STATUS.CANCELLED],
    [JOB_STATUS.ADDITIONAL_WORK]: [JOB_STATUS.IN_PROGRESS, JOB_STATUS.CANCELLED],
    [JOB_STATUS.QC_PENDING]: [JOB_STATUS.QC_APPROVED, JOB_STATUS.QC_REJECTED],
    [JOB_STATUS.QC_APPROVED]: [JOB_STATUS.COMPLETED],
    [JOB_STATUS.QC_REJECTED]: [JOB_STATUS.IN_PROGRESS],
    [JOB_STATUS.COMPLETED]: [JOB_STATUS.INVOICED],
    [JOB_STATUS.INVOICED]: [JOB_STATUS.PAID],
    [JOB_STATUS.PAID]: [JOB_STATUS.DELIVERED],
    [JOB_STATUS.ON_HOLD]: [JOB_STATUS.IN_PROGRESS, JOB_STATUS.CANCELLED],
};

/**
 * Checks if a transition from fromStatus to toStatus is valid.
 */
export function canTransition(fromStatus: string, toStatus: string): boolean {
    return VALID_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
}

/**
 * Returns the list of valid next status for a given status.
 */
export function getNextStates(currentStatus: string): string[] {
    return VALID_TRANSITIONS[currentStatus] ?? [];
}
