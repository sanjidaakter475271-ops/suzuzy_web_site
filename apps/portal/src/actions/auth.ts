"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Finalizes user onboarding by updating the profile in the database.
 * Replaces the Supabase 'complete_user_onboarding' RPC.
 */
export async function completeOnboardingAction(newPassword?: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return { success: false, error: "Unauthorized access attempt" };
        }

        const userId = session.user.id;

        // Verify user is actually in onboarding mode
        const profile = await prisma.profiles.findUnique({
            where: { id: userId }
        });

        if (!profile) {
            return { success: false, error: "User profile not found" };
        }

        // If already completed, prevent password overwrite via this method
        if (profile.onboarding_completed) {
            return { success: false, error: "Onboarding already completed" };
        }

        // Update password if provided
        if (newPassword) {
            // Use internal API to update password without current password requirement
            // valid because we verified session and onboarding status
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (auth.api as any).admin.setUserPassword({
                body: {
                    userId: userId,
                    password: newPassword
                },
                headers: await headers()
            });
        }

        await prisma.profiles.update({
            where: { id: userId },
            data: {
                onboarding_completed: true,
                temp_password: null
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Auth Protocol Breach: Onboarding Finalization Failed:", error);
        return { success: false, error: error.body?.message || error.message || "Credential synchronization failed" };
    }
}
