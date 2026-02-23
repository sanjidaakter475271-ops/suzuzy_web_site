import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from './auth-client';
import { User } from '../types';
import { OfflineService } from '../services/offline';

interface AuthContextType {
    user: User | null;
    session: any;
    loading: boolean;
    signIn: (email: string, password: any) => Promise<{ error?: string }>;
    signUp: (email: string, password: any, name: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const refreshSession = async () => {
        setLoading(true);
        const { data, error } = await authClient.getMe();
        if (data && !error) {
            setUser(data.user);
            setSession(data.session);
            // Cache profile for offline access
            await OfflineService.getInstance().cacheUserProfile(data.user);
        } else {
            // Attempt to get cached profile if portal is down
            const cachedUser = await OfflineService.getInstance().getCachedUserProfile();
            if (cachedUser) {
                setUser(cachedUser);
                setSession({ token: "cached" });
            } else {
                setUser(null);
                setSession(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshSession();
    }, []);

    const signIn = async (email: string, password: any) => {
        const { data, error } = await authClient.signIn.email({ email, password });
        if (error) return { error: error.message };

        if (data?.user) {
            setUser(data.user);
            // Unify session object to use 'token'
            const sessionData = {
                ...data.session,
                token: data.session?.accessToken || data.session?.token
            };
            setSession(sessionData);

            // Cache profile for offline access
            await OfflineService.getInstance().cacheUserProfile(data.user);
            return {};
        }
        return { error: "Unknown error during sign in" };
    };

    const signUp = async (email: string, password: any, name: string) => {
        const { error } = await authClient.signUp.email({ email, password, name });
        if (error) return { error: error.message };
        return {};
    };

    const signOut = async () => {
        await authClient.signOut();
        await OfflineService.getInstance().clearUserProfile();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
