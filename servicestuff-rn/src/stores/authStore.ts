import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';
import { authClient } from '@/lib/auth-client';
import { User, Session } from '@/types';
import { OfflineService } from '@/lib/offline';
import { SocketService } from '@/lib/socket';
import { setUnauthorizedHandler } from '@/lib/api';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthReady: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isAuthReady: false,

  initialize: async () => {
    // Set up the unauthorized handler from API
    setUnauthorizedHandler(() => {
      console.log('[AUTH] Unauthorized signal received - logging out');
      get().signOut();
    });

    await get().refreshSession();

    // Handle offline to online transition using NetInfo
    let wasOffline = false;
    NetInfo.addEventListener(state => {
      const currentlyOnline = state.isConnected && state.isInternetReachable !== false;
      const { user, session } = get();

      if (currentlyOnline && wasOffline) {
        console.log("App back online - checking for pending offline actions...");

        if (session?.token === "cached" || !user?.id) {
          console.log("Was in offline mode, verifying session...");
          setTimeout(async () => {
            const { data, error } = await authClient.getMe();
            if (error || !data) {
              get().signOut();
            } else {
              set({ user: data.user, session: data.session });
            }
          }, 2000);
        }
      }
      wasOffline = !currentlyOnline;
    });
  },

  refreshSession: async () => {
    set({ loading: true });
    const { data, error } = await authClient.getMe();

    if (data && !error) {
      set({
        user: data.user,
        session: data.session,
        isAuthReady: true,
        loading: false
      });

      // Cache profile for offline access
      await OfflineService.getInstance().cacheUserProfile(data.user);

      // Connect socket
      const connectionId = data.user.staff_id || data.user.id;
      SocketService.getInstance().connect(connectionId);
    } else {
      // Attempt to get cached profile if portal is down
      const cachedUser = await OfflineService.getInstance().getCachedUserProfile();
      if (cachedUser) {
        set({
          user: cachedUser,
          session: { token: "cached", accessToken: "cached" } as Session,
          isAuthReady: true,
          loading: false
        });
      } else {
        set({
          user: null,
          session: null,
          isAuthReady: false,
          loading: false
        });
      }
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { data, error } = await authClient.signIn.email({ email, password });

    if (error) {
      set({ loading: false });
      return { error: error.message };
    }

    if (data?.user) {
      const token = data.session?.accessToken || data.session?.token;
      const sessionData: Session = {
        ...data.session,
        token,
        accessToken: token
      };

      set({
        user: data.user,
        session: sessionData,
        isAuthReady: true,
        loading: false
      });

      await OfflineService.getInstance().cacheUserProfile(data.user);

      const connectionId = data.user.staff_id || data.user.id;
      SocketService.getInstance().connect(connectionId);

      return {};
    }

    set({ loading: false });
    return { error: "Unknown error during sign in" };
  },

  signUp: async (email, password, name) => {
    const { error } = await authClient.signUp.email({ email, password, name });
    if (error) return { error: error.message };
    return {};
  },

  signOut: async () => {
    await authClient.signOut();
    await OfflineService.getInstance().clearUserProfile();
    SocketService.getInstance().disconnect();

    set({
      user: null,
      session: null,
      isAuthReady: false,
      loading: false
    });

    try {
      const { router } = require('expo-router');
      router.replace('/login');
    } catch (e) {}
  },
}));
