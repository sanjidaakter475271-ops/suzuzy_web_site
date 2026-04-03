import * as SecureStore from 'expo-secure-store';
import { ENV } from '@/lib/env';

const PORTAL_API_URL = ENV.PORTAL_API_URL;
const AUTH_TOKEN_KEY = 'auth_token';

export const authClient = {
    signIn: {
        email: async ({ email, password }: { email: string; password: any }) => {
            try {
                const res = await fetch(`${PORTAL_API_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, rememberMe: true }),
                });
                const data = await res.json();

                if (!res.ok) {
                    return { data: null, error: { message: data.error || "Login failed" } };
                }

                // Store token in SecureStore
                const token = data.session?.accessToken;
                if (token) {
                    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
                    // Normalize session for consistency
                    data.session.token = token;
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
                        businessName: "Service Staff",
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
            const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
            await fetch(`${PORTAL_API_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
        } catch (e) {
            console.error("Logout request failed", e);
        }
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    },

    getMe: async () => {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (!token) return { data: null, error: "No token" };

        try {
            const res = await fetch(`${PORTAL_API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await res.json();
            if (!res.ok) return { data: null, error: data.error };

            // Normalize session to match signIn structure: { user, session: { token, accessToken } }
            return {
                data: {
                    user: data.user,
                    session: {
                        token,
                        accessToken: token
                    }
                },
                error: null
            };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    }
};
