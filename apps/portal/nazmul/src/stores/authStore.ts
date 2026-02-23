import { create } from 'zustand';
import { User } from '../types/index';
import { MOCK_USERS } from '../constants/userData';

interface AuthState {
    user: User | null;
    users: User[]; // List of all users for admin
    isAuthenticated: boolean;
    login: (email: string) => void;
    logout: () => void;
    addUser: (user: User) => void;
    deleteUser: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: MOCK_USERS[0], // Default logged in as admin
    users: MOCK_USERS,
    isAuthenticated: true,

    login: (email) => {
        const foundUser = MOCK_USERS.find(u => u.email === email);
        if (foundUser) {
            set({ user: foundUser, isAuthenticated: true });
        }
    },

    logout: () => set({ user: null, isAuthenticated: false }),

    addUser: (newUser) => set((state) => ({ users: [...state.users, newUser] })),

    deleteUser: (id) => set((state) => ({ users: state.users.filter(u => u.id !== id) }))
}));
