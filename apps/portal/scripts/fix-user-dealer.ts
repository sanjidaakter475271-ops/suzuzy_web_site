process.env.DATABASE_URL = "postgresql://postgres.idqikowpudzjickwpfzr:Nazmul%402%40%40%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
import { prisma } from '../src/lib/prisma/client';

async function main() {
    const email = 'dealer@gmail.com'; // Common test email
    console.log(`Checking profile for ${email}...`);

    const profile = await prisma.profiles.findUnique({
        where: { email }
    });

    if (!profile) {
        console.log('Profile not found for this email.');
        // Try to find any profile with service_admin role
        const anyServiceAdmin = await prisma.profiles.findFirst({
            where: { roles: { name: 'service_admin' } } as any
        });
        if (anyServiceAdmin) {
            console.log(`Found another service admin: ${anyServiceAdmin.email}`);
            await checkAndFix(anyServiceAdmin);
        }
    } else {
        await checkAndFix(profile);
    }
}

async function checkAndFix(profile: any) {
    if (!profile.dealer_id) {
        console.log(`Profile ${profile.email} is missing dealer_id.`);
        const dealer = await prisma.dealers.findFirst();
        if (dealer) {
            console.log(`Found dealer ${dealer.business_name} (${dealer.id}). Linking...`);
            await prisma.profiles.update({
                where: { id: profile.id },
                data: { dealer_id: dealer.id }
            });
            console.log('Successfully updated profile with dealer_id.');
        } else {
            console.log('No dealers found in database.');
        }
    } else {
        console.log(`Profile ${profile.email} already has dealer_id: ${profile.dealer_id}`);
    }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
