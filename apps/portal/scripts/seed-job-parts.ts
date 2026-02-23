
import 'dotenv/config';
import { prisma } from '../src/lib/prisma/client';
import { faker } from '@faker-js/faker';

async function main() {
    console.log('Starting job parts seeding...');

    // 1. Get the latest job (same as test script target)
    const job = await prisma.job_cards.findFirst({
        orderBy: { created_at: 'desc' }
    });

    if (!job) {
        console.error('No jobs found. Cannot link parts.');
        return;
    }
    console.log(`Linking parts to Job ID: ${job.id}`);

    // 2. Get some random variants
    const variants = await prisma.part_variants.findMany({
        take: 5,
        orderBy: { created_at: 'desc' } // Just grab recent ones
    });

    if (variants.length === 0) {
        console.error('No part variants found. Please run seed-parts.ts first.');
        return;
    }

    console.log(`Found ${variants.length} variants to potentially use.`);

    let addedCount = 0;
    for (const variant of variants) {
        // Randomly decide to use this part
        if (Math.random() > 0.3) {
            const quantity = faker.number.int({ min: 1, max: 3 });
            const unitPrice = variant.price;
            const totalPrice = Number(unitPrice) * quantity;

            await prisma.parts_usage.create({
                data: {
                    job_card_id: job.id,
                    variant_id: variant.id,
                    quantity: quantity,
                    unit_price: unitPrice,
                    total_price: totalPrice
                }
            });
            console.log(`Added variant ${variant.sku} (Qty: ${quantity}) to job.`);
            addedCount++;
        }
    }

    console.log(`Successfully added ${addedCount} parts usage records to job ${job.id}.`);
}

main()
    .catch((e) => {
        console.error('Error seeding job parts:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
