import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') }); // Load .env from project root
import { prisma } from '../src/lib/prisma/client';

// const prisma = new PrismaClient(); // Removed

async function main() {
    const email = 'dealer@gmail.com';
    console.log(`Fetching user with email: ${email}`);

    const user = await prisma.profiles.findUnique({
        where: { email },
        include: {
            dealers_profiles_dealer_idTodealers: true // This might be the relation name based on schema hints
        }
    });

    if (!user) {
        console.log('User not found!');
    } else {
        console.log('User found:', JSON.stringify(user, null, 2));
        if (!user.dealer_id) {
            console.log('WARNING: dealer_id is null/missing!');

            // Try to find a dealer to link
            const dealer = await prisma.dealers.findFirst();
            if (dealer) {
                console.log(`Found a dealer: ${dealer.id} (${dealer.business_name}). Updating user...`);
                await prisma.profiles.update({
                    where: { id: user.id },
                    data: { dealer_id: dealer.id }
                });
                console.log('User updated with dealer_id.');
            } else {
                console.log('No dealers found in database to link.');
            }
        } else {
            console.log(`SUCCESS: dealer_id is present: ${user.dealer_id}`);
        }
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
