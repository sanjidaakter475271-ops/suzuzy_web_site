import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Custom Prisma Migrate command for Supabase that doesn't need a Shadow Database.
 * 1. Runs db push to sync the database.
 * 2. Generates a migration file to keep the history in sync.
 * 3. Marks the migration as applied.
 */

async function runMigrate() {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const migrationName = process.argv[2] || 'auto_migration';
    const folderName = `${timestamp}_${migrationName}`;
    const migrationPath = path.join('prisma', 'migrations', folderName);

    console.log(`🚀 Starting automated migration: ${folderName}`);

    try {
        // 1. Sync the database using db push
        console.log('📦 Syncing database with prisma db push...');
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

        // 2. Create the migration directory
        if (!fs.existsSync(path.join('prisma', 'migrations'))) {
            fs.mkdirSync(path.join('prisma', 'migrations'));
        }
        fs.mkdirSync(migrationPath, { recursive: true });

        // 3. Generate the SQL diff
        console.log('📄 Generating migration SQL...');
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error("DATABASE_URL is not defined in environment");

        // Diff against the empty state to get the full schema SQL if history is lost, 
        // or diff against the URL if we just want incremental (which might be empty after push).
        // Since we want to ENSURE we have the SQL for this state:
        const sql = execSync(`npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`, { encoding: 'utf-8' });

        // This is a simplified diff. For a true incremental diff we'd need a shadow DB.
        // But since we are using db push, we just want to save the current state as a "milestone".
        fs.writeFileSync(path.join(migrationPath, 'migration.sql'), sql);

        // 4. Resolve the migration
        console.log('✅ Marking migration as applied...');
        execSync(`npx prisma migrate resolve --applied ${folderName}`, { stdio: 'inherit' });

        console.log(`\n✨ Success! Migration ${folderName} created and applied.`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('\n❌ Migration failed:', errorMessage);
        process.exit(1);
    }
}

runMigrate();
