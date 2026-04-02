import { Queue, Worker, QueueOptions, WorkerOptions, Processor } from "bullmq";
import { redis } from "../redis/client";

// Shared Redis connection for BullMQ
const connection = redis;

// Base queue configuration
const defaultQueueOptions: QueueOptions = {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
    },
};

// Define queue names
export const QUEUES = {
    LEDGER_UPDATE: "ledger-update-queue",
    BULK_IMPORT: "bulk-import-queue",
    AI_DIAGNOSTICS: "ai-diagnostics-queue",
} as const;

// Queue instances
export const ledgerUpdateQueue = new Queue(QUEUES.LEDGER_UPDATE, defaultQueueOptions);
export const bulkImportQueue = new Queue(QUEUES.BULK_IMPORT, defaultQueueOptions);
export const aiDiagnosticsQueue = new Queue(QUEUES.AI_DIAGNOSTICS, defaultQueueOptions);

/**
 * Helper to create a worker for a specific queue
 */
export function createWorker<T, R>(
    queueName: string,
    processor: Processor<T, R>,
    options?: Omit<WorkerOptions, 'connection'>
): Worker<T, R> {
    const worker = new Worker<T, R>(queueName, processor, {
        connection,
        concurrency: 5, // Default concurrency, can be overridden
        ...options,
    });

    worker.on("completed", (job) => {
        console.log(`[BullMQ] Job ${job.id} completed in queue ${queueName}`);
    });

    worker.on("failed", (job, err) => {
        console.error(`[BullMQ] Job ${job?.id} failed in queue ${queueName}`, err);
    });

    return worker;
}
