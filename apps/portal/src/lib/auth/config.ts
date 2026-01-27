import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma/client";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "customer",
                input: false // Don't allow users to set their own role during signup
            },
            roleId: {
                type: "string",
                required: false,
                input: false
            },
            dealerId: {
                type: "string",
                required: false,
                input: false
            }
        }
    },
    // Ensure we use the correct secret from env
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
    plugins: [
        admin()
    ]
});
