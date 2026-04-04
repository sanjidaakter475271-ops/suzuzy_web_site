import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { useFonts, MPLUSRounded1c_100Thin, MPLUSRounded1c_300Light, MPLUSRounded1c_400Regular, MPLUSRounded1c_500Medium, MPLUSRounded1c_700Bold, MPLUSRounded1c_800ExtraBold, MPLUSRounded1c_900Black } from '@expo-google-fonts/m-plus-rounded-1c';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { Platform, View } from 'react-native';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/authStore';
import { useJobStore } from '@/stores/jobStore';
import { registerBackgroundSync } from '@/lib/backgroundTasks';
import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { PermissionManager } from '@/features/auth/components/PermissionManager';
import { LocationTracker } from '@/features/tracking/components/LocationTracker';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { TechnicianAPI } from '@/lib/api';
import { COLORS } from '@/constants/theme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.pageBg,
    card: COLORS.cardBg,
    text: COLORS.textPrimary,
    border: COLORS.border,
    primary: COLORS.primary,
  },
};

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async (_notification: Notifications.Notification) => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  // Expo Go doesn't support remote notifications starting from SDK 53
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    console.log('Skipping push notification registration: Remote notifications are not supported in Expo Go on SDK 53+. Use a development build.');
    return;
  }

  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

function InitialLayout() {
  const { user, loading, isAuthReady, initialize: initAuth } = useAuthStore();
  const { initializeSocketListeners } = useJobStore();
  const [fontsLoaded, fontError] = useFonts({
    MPLUSRounded1c_100Thin,
    MPLUSRounded1c_300Light,
    MPLUSRounded1c_400Regular,
    MPLUSRounded1c_500Medium,
    MPLUSRounded1c_700Bold,
    MPLUSRounded1c_800ExtraBold,
    MPLUSRounded1c_900Black,
  });

  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [permissionsDone, setPermissionsDone] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Initialize stores on mount
  useEffect(() => {
    initAuth();
    initializeSocketListeners();
    registerBackgroundSync();
  }, []);

  // Check onboarding status
  useEffect(() => {
    const onboarded = storage.getBoolean('servicemate_onboarded');
    setIsOnboarded(!!onboarded);
    setOnboardingChecked(true);
  }, []);

  // Handle splash screen and navigation
  useEffect(() => {
    if (loading || !onboardingChecked || !rootNavigationState?.key || !fontsLoaded) return;

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Ignore errors if splash already hidden
      }
    };
    hideSplash();

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      if (isOnboarded) {
        router.replace('/login');
      } else {
        router.replace('/splash');
      }
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, loading, segments, onboardingChecked, isOnboarded, rootNavigationState?.key, fontsLoaded]);

  // Handle Push Notifications
  useEffect(() => {
    if (isAuthReady && user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          TechnicianAPI.registerPushToken(token, Platform.OS, Device.modelName || 'Unknown');
        }
      });

      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('[NOTIFICATION] Received:', notification);
      });

      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('[NOTIFICATION] Response:', response);
      });

      return () => {
        subscription.remove();
        responseSubscription.remove();
      };
    }
  }, [isAuthReady, user]);

  // Handle Deep Linking
  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      console.log('[DEEP_LINK] Received URL:', event.url);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) console.log('[DEEP_LINK] Initial URL:', url);
    });

    return () => subscription.remove();
  }, []);

  if (loading || !onboardingChecked || !fontsLoaded) return null;

  const inAuthGroup = segments[0] === '(auth)';

  return (
    <ThemeProvider value={inAuthGroup ? { ...NavTheme, colors: { ...NavTheme.colors, background: "#020617" } } : NavTheme}>
      <View style={{ flex: 1, backgroundColor: inAuthGroup ? "#020617" : COLORS.pageBg }}>
        <StatusBar
          style={inAuthGroup ? "light" : "dark"}
          backgroundColor={inAuthGroup ? "#020617" : COLORS.pageBg}
        />
        <OfflineBanner />
        {user && !permissionsDone && (
          <PermissionManager onComplete={() => setPermissionsDone(true)} />
        )}
        {user && permissionsDone && isAuthReady && <LocationTracker />}
        <Slot />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <InitialLayout />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
