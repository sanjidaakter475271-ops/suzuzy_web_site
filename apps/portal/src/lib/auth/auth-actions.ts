"use server";

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * SignUp action: Handles dealer registration by calling the register API
 */
export async function signUp(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const businessName = formData.get("businessName") as string;
    const ownerName = formData.get("ownerName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password,
                name: ownerName,
                businessName,
                phone,
                address
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Registration failed");
        }

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Registration failed";
        return { error: message };
    }
}

/**
 * Logout action
 */
export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    revalidatePath("/", "layout");
}
