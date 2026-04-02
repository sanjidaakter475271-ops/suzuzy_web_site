import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { authClient } from './auth-client';
import { User, Session } from '../types';
import { OfflineService } from '../services/offline';
import { SocketService } from '../services/socket';
import { setUnauthorizedHandler } from '../services/api';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAuthReady: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const refreshSession = async () => {
        setLoading(true);
        const { data, error } = await authClient.getMe();
        if (data && !error) {
            setUser(data.user);
            setSession(data.session);
            setIsAuthReady(true);
            // Cache profile for offline access
            await OfflineService.getInstance().cacheUserProfile(data.user);
        } else {
            // Attempt to get cached profile if portal is down
            const cachedUser = await OfflineService.getInstance().getCachedUserProfile();
            if (cachedUser) {
                setUser(cachedUser);
                setSession({ token: "cached", accessToken: "cached" });
                setIsAuthReady(true);
            } else {
                setUser(null);
                setSession(null);
                setIsAuthReady(false);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        // Set up the unauthorized handler from API
        setUnauthorizedHandler(() => {
            console.log('[AUTH] Unauthorized signal received - logging out');
            signOut();
        });

        refreshSession();

        // Handle offline to online transition using NetInfo
        let wasOffline = false;
        const unsubscribe = NetInfo.addEventListener(state => {
            const currentlyOnline = state.isConnected && state.isInternetReachable !== false;

            if (currentlyOnline && wasOffline) {
                console.log("App back online - checking for pending offline actions...");

                // If session is cached or user data is missing, verify with server
                if (session?.token === "cached" || !user?.id) {
                    console.log("Was in offline mode, waiting for sync and verifying session...");

                    // Wait 2s for OfflineService.syncQueue to try syncing
                    setTimeout(async () => {
                        const { data, error } = await authClient.getMe();
                        if (error || !data) {
                            console.log("Session invalid on server, forcing logout");
                            signOut();
                        } else {
                            console.log("Session verified, restoring real session state");
                            setUser(data.user);
                            setSession(data.session);
                        }
                    }, 2000);
                }
            }
            wasOffline = !currentlyOnline;
        });

        return () => unsubscribe();
    }, []); 

    // Connect socket when authenticated
    useEffect(() => {
        if (user?.id && session?.token && session?.token !== 'cached') {
            const connectionId = user.staff_id || user.id;
            console.log(`[AUTH] Connecting socket for: ${connectionId}`);
            SocketService.getInstance().connect(connectionId);
        }
    }, [user?.id, session?.token]);

    const signIn = async (email: string, password: string) => {
        const { data, error } = await authClient.signIn.email({ email, password });
        if (error) return { error: error.message };

        if (data?.user) {
            setUser(data.user);
            const token = data.session?.accessToken || data.session?.token;
            const sessionData: Session = {
                ...data.session,
                token,
                accessToken: token
            };
            setSession(sessionData);
            setIsAuthReady(true);

            // Cache profile for offline access
            await OfflineService.getInstance().cacheUserProfile(data.user);
            return {};
        }
        return { error: "Unknown error during sign in" };
    };

    const signUp = async (email: string, password: string, name: string) => {
        const { error } = await authClient.signUp.email({ email, password, name });
        if (error) return { error: error.message };
        return {};
    };

    const signOut = async () => {
        await authClient.signOut();
        await OfflineService.getInstance().clearUserProfile();
        SocketService.getInstance().disconnect();
        setUser(null);
        setSession(null);
        setIsAuthReady(false);
        // Direct router call to ensure navigation happens if state update is slow
        try {
            const { router } = require('expo-router');
            router.replace('/login');
        } catch (e) {}
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, isAuthReady, signIn, signUp, signOut }}>
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
