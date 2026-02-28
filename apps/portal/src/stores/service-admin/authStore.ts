import { create } from 'zustand';
import { User } from '@/types/service-admin/index';

interface AuthState {
    user: User | null;
    users: User[];
    isLoading: boolean;
    isAuthenticated: boolean;
    fetchUsers: () => Promise<void>;
    login: (email: string) => void;
    logout: () => void;
    addUser: (user: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    users: [],
    isLoading: false,
    isAuthenticated: false,

    fetchUsers: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/v1/profiles');
            const data = await res.json();
            if (data.success) {
                set({ users: data.data, isLoading: false });
            }
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    },

    login: (email) => {
        // Simple mock login for now, or use real login API
        set({ isAuthenticated: true });
    },

    logout: () => set({ user: null, isAuthenticated: false }),

    addUser: async (newUser) => {
        try {
            const res = await fetch('/api/v1/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            if (res.ok) await get().fetchUsers();
        } catch (error) {
            console.error(error);
        }
    },

    deleteUser: async (id) => {
        try {
            const res = await fetch(`/api/v1/profiles/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) await get().fetchUsers();
        } catch (error) {
            console.error(error);
        }
    }
}));
