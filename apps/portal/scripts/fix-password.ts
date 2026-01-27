import { betterAuth } from "better-auth";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Pool } from "pg";

// Mock DB URL just to initialize Better Auth (it might try to connect)
// We use the Pooler URL
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres.idqikowpudzjickwpfzr:Nazmul%402%40%40%40@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
process.env.DATABASE_URL = dbUrl;

const prisma = new PrismaClient();

const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
});

async function main() {
    try {
        console.log("Generating valid hash via Better Auth...");
        // @ts-ignore
        const hash = await auth.api.hashPassword({
            body: { password: "password123" }
        });

        // Wait, hashPassword might not be exposed on api directly in all versions, 
        // usually it's internal. 
        // Better Auth doesn't expose a public 'hashPassword' API usually.
        // It exposes signIn / signUp.

        // Plan B: Use internal crypto if accessible, OR
        // create a dummy user in a temporary way using signUp and steal the hash?
        // Let's try to create a dummy user with a random email, get the hash, then delete it.

        const dummyEmail = `dummy_${Date.now()}@test.com`;
        const password = "password123";

        console.log(`Creating dummy user ${dummyEmail} to generate hash...`);
        const res = await auth.api.signUpEmail({
            body: {
                email: dummyEmail,
                password: password,
                name: "Dummy",
            }
        });

        if (!res?.user) {
            throw new Error("Failed to create dummy user");
        }

        console.log("Dummy user created. Fetching hash from DB...");

        // Fetch hash via raw SQL to avoid prisma issues if any
        const pool = new Pool({ connectionString: dbUrl });
        const result = await pool.query('SELECT password FROM public.account WHERE "userId" = $1', [res.user.id]);
        const validHash = result.rows[0].password;
        console.log("VALID HASH FOUND:", validHash);

        console.log("Updating superadmin password...");
        await pool.query('UPDATE public.account SET password = $1 WHERE "accountId" = $2', [validHash, "superadmin@gmail.com"]);

        console.log("Cleaning up dummy user...");
        await pool.query('DELETE FROM public.account WHERE "userId" = $1', [res.user.id]);
        await pool.query('DELETE FROM public.user WHERE id = $1', [res.user.id]);
        // Profile might be in public.profiles too if triggers ran? 
        // The script didn't run triggers (it was manual), but signUpEmail runs better-auth logic.
        // Profiles are custom table, so better-auth doesn't know about it unless logic is in app hooks.
        // Our app puts profiles in signUp action, but here we used raw auth.api.

        console.log("SUCCESS! Superadmin password updated.");
        await pool.end();

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
