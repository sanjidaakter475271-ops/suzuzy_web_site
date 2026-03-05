import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });
import { prisma } from '../src/lib/prisma/client';

async function main() {
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'service_appointments' 
            AND table_schema = 'public'
        `;
        console.log('Columns in service_appointments:', JSON.stringify(columns, null, 2));
    } catch (error: any) {
        console.error('ERROR:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
