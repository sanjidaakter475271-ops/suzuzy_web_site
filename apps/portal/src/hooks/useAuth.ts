"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";

// Extended user type to include custom fields from Better Auth config
export interface ExtendedUser {
    id: string;
    email: string;
    name: string | null;
    image?: string | null;
    role?: string;
    roleId?: string;
    dealerId?: string;
}

export function useAuth() {
    const { data: session, isPending, error } = authClient.useSession();
    const router = useRouter();

    const signOut = async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
    };

    // Cast user to our extended type
    const user = session?.user as ExtendedUser | undefined;

    return {
        user: user ?? null,
        session,
        loading: isPending,
        error,
        signOut,
    };
}
