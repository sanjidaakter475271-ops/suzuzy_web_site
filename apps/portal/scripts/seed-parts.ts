
import 'dotenv/config';
import { prisma } from '../src/lib/prisma/client';
import { faker } from '@faker-js/faker';

async function main() {
    console.log('Starting parts seeding...');

    // 1. Create a category if needed (optional, but good for data integrity)
    // For simplicity, we'll try to find one or create a dummy one if we can't find 'parts' table category structure easily from just looking at schema here, 
    // but schema says `category_id` is uuid. Let's create a "General Parts" category if possible, or just skip if nullable.
    // Looking at schema: category_id String? @db.Uuid. It's nullable. We'll skip for now to keep it simple, or user can assume existing categories.

    const PARTS_TO_CREATE = 100;

    console.log(`Creating ${PARTS_TO_CREATE} parts with variants...`);

    for (let i = 0; i < PARTS_TO_CREATE; i++) {
        const partName = faker.vehicle.bicycle() + ' ' + faker.science.chemicalElement().name + ' Part';
        const brand = faker.company.name();
        const sku = faker.string.alphanumeric(8).toUpperCase();
        const price = faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
        const stock = faker.number.int({ min: 0, max: 100 });
        const code = faker.string.alphanumeric(6).toUpperCase();

        // Create Part and Variant together
        await prisma.parts.create({
            data: {
                name: partName,
                code: code,
                part_variants: {
                    create: {
                        brand: brand,
                        sku: sku,
                        price: price,
                        stock_quantity: stock
                    }
                }
            }
        });

        if ((i + 1) % 10 === 0) {
            console.log(`Seeded ${i + 1} parts...`);
        }
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding parts:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
