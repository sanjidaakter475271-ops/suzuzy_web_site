"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Extended session user type
interface SessionUser {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    roleId?: string;
    dealerId?: string;
}

/**
 * Login action: Authenticates with Better Auth and redirects to dashboard
 */
export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const session = await auth.api.signInEmail({
            body: {
                email,
                password,
            },
        });

        if (!session?.user) {
            throw new Error("Invalid login session");
        }

        // Determine redirect path based on role
        const user = session.user as SessionUser;
        const role = user.role || "customer";

        let redirectPath = "/dashboard"; // Fallback

        // Map roles to dashboard paths
        if (role === "super_admin") {
            redirectPath = "/super-admin/dashboard";
        } else if (role === "showroom_sales_admin" || role === "service_sales_admin") {
            redirectPath = "/sales-admin/dashboard";
        } else if (["showroom_admin", "service_admin", "support", "accountant"].includes(role)) {
            redirectPath = "/admin/dashboard";
        } else if (["dealer_owner", "dealer_manager", "dealer_staff", "sub_dealer"].includes(role)) {
            redirectPath = "/dealer/dashboard";
        }

        revalidatePath("/", "layout");
        return { success: true, url: redirectPath };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to sign in";
        return { error: message };
    }
}

/**
 * SignUp action: Handles dealer registration with Better Auth and Prisma transactions
 */
export async function signUp(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const businessName = formData.get("businessName") as string;
    const ownerName = formData.get("ownerName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    // Separate names
    const nameParts = ownerName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Generate slug from business name
    const slugBase = businessName.toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    const slug = `${slugBase}-${Math.random().toString(36).substring(2, 7)}`;

    // Role ID for 'customer'
    const CUSTOMER_ROLE_ID = "43498ddd-6416-4836-8590-17e4294bdd97";

    try {
        // 1. Create the user in Better Auth
        const session = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: ownerName,
            },
        });

        if (!session || !session.user) {
            throw new Error("User creation failed");
        }

        const userId = session.user.id;

        // 2. Perform database setup in a Prisma transaction
        await prisma.$transaction(async (tx) => {
            // Create Dealer
            const dealer = await tx.dealers.create({
                data: {
                    business_name: businessName,
                    slug: slug,
                    email: email,
                    phone: phone,
                    address_line1: address,
                    owner_user_id: userId,
                    status: "pending",
                }
            });

            // Create/Update Profile
            await tx.profiles.upsert({
                where: { id: userId },
                create: {
                    id: userId,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    full_name: ownerName,
                    phone: phone,
                    role_id: CUSTOMER_ROLE_ID,
                    role: "customer",
                    dealer_id: dealer.id,
                    status: "pending",
                },
                update: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: ownerName,
                    phone: phone,
                    role_id: CUSTOMER_ROLE_ID,
                    role: "customer",
                    dealer_id: dealer.id,
                    status: "pending",
                }
            });

            // Update Better Auth User fields (role, dealerId)
            // Using raw SQL to update user table as it may not be in standard Prisma schema
            await tx.$executeRaw`UPDATE "user" SET role = 'customer', "roleId" = ${CUSTOMER_ROLE_ID}, "dealerId" = ${dealer.id} WHERE id = ${userId}`;
        });

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Registration failed";
        return { error: message };
    }
}

/**
 * Logout action: Signs out of Better Auth and redirects to login
 */
export async function logout() {
    const cookieStore = await cookies();
    const headers = new Headers();
    cookieStore.getAll().forEach(cookie => {
        headers.append('set-cookie', `${cookie.name}=${cookie.value}`);
    });

    await auth.api.signOut({
        headers
    });
    revalidatePath("/", "layout");
    redirect("/login");
}
