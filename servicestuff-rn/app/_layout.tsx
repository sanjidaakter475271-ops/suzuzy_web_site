import "../global.css";
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/auth';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';

import { OfflineBanner } from '../components/OfflineBanner';
import { PermissionManager } from '../components/PermissionManager';
import { LocationTracker } from '../components/LocationTracker';

function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [permissionsDone, setPermissionsDone] = useState(false);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect to dashboard if authenticated
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) return null;

  return (
    <>
      <OfflineBanner />
      {user && !permissionsDone && (
        <PermissionManager onComplete={() => setPermissionsDone(true)} />
      )}
      {user && permissionsDone && <LocationTracker />}
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#020617" />
        <InitialLayout />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
