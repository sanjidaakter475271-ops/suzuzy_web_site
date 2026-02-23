
import 'dotenv/config';
import { prisma } from './src/lib/prisma/client';

async function main() {
    console.log('Starting test script...');

    // Check if connected (optional, but good for debug)
    console.log('Using imported prisma client instance.');

    try {
        console.log('Connecting to database...');

        // 1. Fetch any job to get a valid ID
        console.log('Fetching a recent job to test with...');
        const job = await prisma.job_cards.findFirst({
            orderBy: { created_at: 'desc' }
        });

        if (!job) {
            console.log('No jobs found in database. Cannot test specific query, but client connection is working.');
            return;
        }

        console.log(`Found Job ID: ${job.id}`);
        console.log('Executing complex query from API route...');

        // 2. Execute the exact query structure from the API route
        const result = await prisma.job_cards.findFirst({
            where: {
                id: job.id,
            },
            include: {
                service_tickets: {
                    include: {
                        service_vehicles: {
                            include: {
                                bike_models: true,
                            },
                        },
                        profiles: true, // Customer
                    },
                },
                service_tasks: true,
                parts_usage: {
                    include: {
                        part_variants: {
                            include: {
                                parts: true
                            }
                        }
                    }
                },
                job_photos: true,
                service_checklist_items: true,
                technician_time_logs: {
                    orderBy: {
                        timestamp: 'desc'
                    }
                },
                qc_requests: {
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: 1
                }
            },
        });

        console.log('Query executed successfully!');
        if (result) {
            console.log('Retrieved Job ID:', result.id);
            console.log('Parts Usage Count:', result.parts_usage ? result.parts_usage.length : 0);
        }
    } catch (e) {
        console.error('Error executing query:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
