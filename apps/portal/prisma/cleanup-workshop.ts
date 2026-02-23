import 'dotenv/config';
import { prisma } from '../src/lib/prisma/client';

async function main() {
    console.log('🧹 Starting Workshop Data Cleanup...');

    try {
        // Order matters due to foreign key constraints
        console.log('- Cleaning job_cards related tables...');
        await prisma.technician_time_logs.deleteMany({});
        await prisma.job_photos.deleteMany({});
        await prisma.parts_usage.deleteMany({});
        await prisma.tool_usage.deleteMany({});
        await prisma.service_checklist_items.deleteMany({});
        await prisma.technician_issue_reports.deleteMany({});
        await prisma.qc_requests.deleteMany({});
        await prisma.job_cards.deleteMany({});

        console.log('- Cleaning service_requisitions...');
        await prisma.service_requisitions.deleteMany({});

        console.log('- Cleaning service_tickets...');
        // First clear references to tickets in ramps
        await prisma.service_ramps.updateMany({
            data: { current_ticket_id: null }
        });
        await prisma.service_tickets.deleteMany({});

        console.log('- Cleaning service_history...');
        await prisma.service_history.deleteMany({});

        console.log('- Cleaning service_vehicles...');
        await prisma.service_vehicles.deleteMany({});

        console.log('- Cleaning financial data...');
        await prisma.transactions.deleteMany({
            where: { reference_type: 'service' }
        });
        await prisma.expenses.deleteMany({});

        console.log('✅ Cleanup finished successfully!');
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
