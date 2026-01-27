import path from "path";
import fs from "fs";
import { Pool } from "pg";
import { randomBytes, scryptSync, randomUUID } from "crypto";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
}

// User ID found in previous logs
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres.idqikowpudzjickwpfzr:Nazmul%402%40%40%40@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
    return `${salt}:${hash}`;
}

async function fixAccount() {
    const pool = new Pool({ connectionString: dbUrl });
    try {
        console.log("Starting account fix...");
        const email = "superadmin@gmail.com";
        const password = "password123";

        console.log("Fetching user ID from public.user...");
        const userRes = await pool.query('SELECT id FROM public."user" WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            throw new Error("User not found in public.user");
        }
        const userId = userRes.rows[0].id;
        console.log(`Using User ID: ${userId}`);

        console.log("Generating hash...");
        const hashedPassword = hashPassword(password);
        console.log("Hash generated:", hashedPassword.substring(0, 10) + "...");

        console.log("Inserting into account...");
        const res = await pool.query(
            `INSERT INTO public.account (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, 'credential', $4, now(), now())
             RETURNING id`,
            [randomUUID(), userId, email, hashedPassword]
        );
        console.log("Insert result:", res.rows[0]);

        console.log("SUCCESS!");
    } catch (error: any) {
        console.error("Fix failed:", error.message);
        console.error(error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

fixAccount();
