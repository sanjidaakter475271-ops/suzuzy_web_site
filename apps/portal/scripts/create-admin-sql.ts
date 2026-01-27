import path from "path";
import fs from "fs";
import { Pool } from "pg";
import { randomUUID } from "crypto";

// 1. Manually load environment variables
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
}

// Use DATABASE_URL (Pooler) as DIRECT_URL is currently unreachable
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres.idqikowpudzjickwpfzr:Nazmul%402%40%40%40@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
console.log(`Using database URL: ${dbUrl.replace(/:[^@]+@/, ":****@")}`);

async function createAdmin() {
    const pool = new Pool({ connectionString: dbUrl });
    try {
        console.log(`Setting up superadmin: superadmin@gmail.com...`);

        const userId = randomUUID();
        const email = "superadmin@gmail.com";
        const role = "super_admin";
        const roleId = "d7511c63-9639-43ef-a738-7a21b9649a68";

        console.log("Checking if user exists in 'auth.users'...");
        const existingAuthUser = await pool.query('SELECT id FROM auth.users WHERE email = $1', [email]);
        
        let finalUserId;
        if (existingAuthUser.rows.length === 0) {
            console.log("Inserting into 'auth.users' table...");
            finalUserId = userId;
            await pool.query(
                `INSERT INTO auth.users (id, email, aud, role, email_confirmed_at, created_at, updated_at, instance_id) 
                 VALUES ($1, $2, 'authenticated', 'authenticated', now(), now(), now(), '00000000-0000-0000-0000-000000000000')`,
                [finalUserId, email]
            );
        } else {
            finalUserId = existingAuthUser.rows[0].id;
            console.log(`User already exists in Auth with ID: ${finalUserId}`);
        }

        console.log("Inserting into public.'user' table (Better Auth)...");
        await pool.query(
            `INSERT INTO public."user" (id, email, name, "emailVerified", "createdAt", "updatedAt", role, "roleId") 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (email) DO UPDATE SET role = $7, "roleId" = $8`,
            [finalUserId, email, 'Super Admin', true, new Date(), new Date(), role, roleId]
        );

        console.log("Inserting into 'profiles' table...");
        await pool.query(
            `INSERT INTO public.profiles (id, email, full_name, role, role_id, status, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (email) DO UPDATE SET role = $4, role_id = $5, status = $6, updated_at = $8`,
            [finalUserId, email, 'Super Admin', role, roleId, 'active', new Date(), new Date()]
        );

        console.log("SUCCESS! Created records via raw SQL.");
    } catch (error: any) {
        console.error("Setup failed:", error.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

createAdmin();
