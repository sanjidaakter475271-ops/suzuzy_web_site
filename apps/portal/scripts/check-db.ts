import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });
import { prisma } from '../src/lib/prisma/client';

async function main() {
    try {
        console.log('Checking service_appointments table structure...');
        const data = await prisma.service_appointments.findMany({
            take: 1
        });
        console.log('Successfully fetched from service_appointments:', data);

        console.log('Checking if new columns exist by doing a filtered query...');
        const withSource = await prisma.service_appointments.findMany({
            where: { source: 'walk_in' } as any,
            take: 1
        });
        console.log('Successfully queried using "source" column.');
    } catch (error: any) {
        console.error('DATABASE ERROR:', error.message);
        if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.error('CONFIRMED: Database is out of sync with schema.prisma');
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
