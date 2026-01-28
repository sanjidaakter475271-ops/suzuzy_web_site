"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    roleLevel: number;
    dealerId?: string | null;
    dealer_id?: string | null;
    dealer?: any;
}

export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["auth-user"],
        queryFn: async () => {
            const res = await fetch("/api/auth/me");
            if (!res.ok) {
                if (res.status === 401) return null;
                throw new Error("Failed to fetch user");
            }
            const json = await res.json();
            return json.user as User;
        },
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const signOut = async () => {
        await authClient.signOut();
        queryClient.setQueryData(["auth-user"], null);
        router.push("/login");
        router.refresh();
    };

    return {
        user: data ?? null,
        loading: isLoading,
        error,
        signOut,
    };
}
