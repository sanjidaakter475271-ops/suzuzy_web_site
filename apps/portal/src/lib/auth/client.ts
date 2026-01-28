export const authClient = {
    signIn: {
        email: async ({ email, password, rememberMe }: any) => {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, rememberMe }),
            });
            const data = await res.json();
            if (!res.ok) return { data: null, error: { message: data.error } };
            return { data, error: null };
        },
        mfa: async ({ mfaTicket, token }: any) => {
            const res = await fetch("/api/auth/login/mfa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mfaTicket, token }),
            });
            const data = await res.json();
            if (!res.ok) return { data: null, error: { message: data.error } };
            return { data, error: null };
        },
        google: () => {
            window.location.href = "/api/auth/google";
        }
    },
    signOut: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
    },
    forgotPassword: async (data: { email: string; redirectTo?: string }) => {
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            return { error: res.ok ? null : { message: result.error || "Request failed" } };
        } catch (err: any) {
            return { error: { message: err.message || "Network error" } };
        }
    },
    resetPassword: async (data: { newPassword: any; token?: string }) => {
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            return { error: res.ok ? null : { message: result.error || "Reset failed" } };
        } catch (err: any) {
            return { error: { message: err.message || "Network error" } };
        }
    }
};
