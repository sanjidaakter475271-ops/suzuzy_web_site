"use server";

import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/auth/password";

/**
 * Finalizes user onboarding by updating the profile in the database.
 */
export async function completeOnboardingAction(newPassword?: string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { success: false, error: "Unauthorized access attempt" };
        }

        const userId = user.userId;

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

        const updateData: any = {
            onboarding_completed: true,
            temp_password: null
        };

        // Update password if provided
        if (newPassword) {
            const hashedPassword = await hashPassword(newPassword);
            updateData.password_hash = hashedPassword;
        }

        await prisma.profiles.update({
            where: { id: userId },
            data: updateData
        });

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Auth Protocol Breach: Onboarding Finalization Failed:", error);
        return { success: false, error: error.body?.message || error.message || "Credential synchronization failed" };
    }
}
