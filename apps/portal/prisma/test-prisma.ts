import 'dotenv/config';
import { prisma } from '../src/lib/prisma/client';

async function main() {
    console.log('Prisma initialized using project client');
    try {
        const count = await prisma.bike_models.count();
        console.log('Bike models count:', count);
    } catch (err) {
        console.error('Query failed:', err);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
