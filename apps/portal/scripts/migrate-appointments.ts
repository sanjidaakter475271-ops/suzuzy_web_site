import { prisma } from '../src/lib/prisma/client';

async function main() {
    console.log('Starting manual migration for service_appointments...');

    const queries = [
        `ALTER TABLE "public"."service_appointments" ADD COLUMN IF NOT EXISTS "source" VARCHAR(20) DEFAULT 'walk_in'`,
        `ALTER TABLE "public"."service_appointments" ADD COLUMN IF NOT EXISTS "token_number" INTEGER`,
        `ALTER TABLE "public"."service_appointments" ADD COLUMN IF NOT EXISTS "checked_in_at" TIMESTAMPTZ(6)`,
        `ALTER TABLE "public"."service_appointments" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMPTZ(6)`,
        `ALTER TABLE "public"."service_appointments" ADD COLUMN IF NOT EXISTS "created_by" UUID`,
        // Also add unique constraint for token number if it doesn't exist
        `DO $$ 
         BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_appointments_dealer_date_token_key') THEN
                ALTER TABLE "public"."service_appointments" ADD CONSTRAINT "service_appointments_dealer_date_token_key" UNIQUE (dealer_id, appointment_date, token_number);
            END IF;
         END $$;`
    ];

    for (const sql of queries) {
        try {
            console.log(`Executing: ${sql.substring(0, 50)}...`);
            await prisma.$executeRawUnsafe(sql);
            console.log('Success.');
        } catch (err: any) {
            console.error(`FAILED: ${err.message}`);
        }
    }

    console.log('Migration complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
