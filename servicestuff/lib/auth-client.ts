import { Preferences } from '@capacitor/preferences';
import { ENV } from './env';

const PORTAL_API_URL = ENV.PORTAL_API_URL;

export const authClient = {
    signIn: {
        email: async ({ email, password }: { email: string; password: any }) => {
            try {
                const res = await fetch(`${PORTAL_API_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();

                if (!res.ok) {
                    return { data: null, error: { message: data.error || "Login failed" } };
                }

                // Store token in Preferences (important for mobile)
                if (data.session?.accessToken) {
                    await Preferences.set({ key: 'auth_token', value: data.session.accessToken });
                }

                return { data, error: null };
            } catch (err: any) {
                return { data: null, error: { message: err.message || "Network error" } };
            }
        },
    },

    signUp: {
        email: async ({ email, password, name }: { email: string; password: any; name: string }) => {
            try {
                const res = await fetch(`${PORTAL_API_URL}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        password,
                        name,
                        businessName: "Service Staff", // Default for technician app registrations
                        phone: ""
                    }),
                });
                const data = await res.json();

                if (!res.ok) {
                    return { data: null, error: { message: data.error || "Registration failed" } };
                }

                return { data, error: null };
            } catch (err: any) {
                return { data: null, error: { message: err.message || "Network error" } };
            }
        },
    },

    signOut: async () => {
        try {
            // We can call logout endpoint, but most importantly we clear local token
            await fetch(`${PORTAL_API_URL}/api/auth/logout`, { method: "POST" });
        } catch (e) {
            console.error("Logout request failed", e);
        }
        await Preferences.remove({ key: 'auth_token' });
    },

    getMe: async () => {
        const { value: token } = await Preferences.get({ key: 'auth_token' });
        if (!token) return { data: null, error: "No token" };

        try {
            const res = await fetch(`${PORTAL_API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await res.json();
            if (!res.ok) return { data: null, error: data.error };

            // Re-map to match better-auth structure or simplify? 
            // Better to match what the app expects: { user: { id, name, ... } }
            return { data: { user: data.user, session: { token } }, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    }
};
