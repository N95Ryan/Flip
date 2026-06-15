import 'react-native-gesture-handler';

import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Stack, router, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthLaunchScreen } from '@/components/AuthLaunchScreen';
import { API_URL } from '@/constants/api';
import { useSubscriptionRefresh } from '@/hooks/useSubscriptionRefresh';
import { isOnboardingDone } from '@/lib/onboarding';
import { useAuthStore, type SessionStatus } from '@/store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

let sessionBootstrapped = false;

type RouteKind = 'entry' | 'auth' | 'app' | 'onboarding' | 'billing' | 'other';

function pathFromDeepLink(url: string): string | null {
  const { path } = Linking.parse(url);
  if (!path) return null;
  return path.startsWith('/') ? path : `/${path}`;
}

function classifyPath(path: string): RouteKind {
  const normalized = path.replace(/\/$/, '') || '/';

  if (normalized === '/' || normalized === '/index') return 'entry';
  if (normalized === '/success' || normalized === '/cancel') return 'billing';
  if (normalized.startsWith('/auth')) return 'auth';
  if (normalized.startsWith('/onboarding')) return 'onboarding';
  if (
    normalized.startsWith('/library') ||
    normalized.startsWith('/journal') ||
    normalized.startsWith('/profile')
  ) {
    return 'app';
  }

  return 'other';
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'NotoSerifJP-Light': require('../assets/fonts/NotoSerifJP-Light.otf'),
  });
  const navigationState = useRootNavigationState();
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [authStatus, setAuthStatus] = useState<SessionStatus | 'pending'>('pending');
  const [showLaunch, setShowLaunch] = useState(false);

  useSubscriptionRefresh();

  useEffect(() => {
    if (__DEV__) {
      console.log('[Flip] API_URL =', API_URL);
    }
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    if (!navigationState?.key) return;
    if (sessionBootstrapped) return;
    sessionBootstrapped = true;

    (async () => {
      const status = await restoreSession();
      setAuthStatus(status);

      const webPath =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.pathname
          : null;
      const initialUrl = webPath ? null : await Linking.getInitialURL();
      const bootstrapPath =
        webPath ?? (initialUrl ? pathFromDeepLink(initialUrl) : null) ?? '/';
      const routeKind = classifyPath(bootstrapPath);

      if (routeKind === 'billing') {
        if (status === 'unauthenticated') {
          router.replace('/auth/login');
        }
        await SplashScreen.hideAsync();
        return;
      }

      if (routeKind === 'app' || routeKind === 'onboarding') {
        if (status === 'unauthenticated') {
          router.replace('/auth/login');
        }
        await SplashScreen.hideAsync();
        return;
      }

      if (routeKind !== 'entry' && routeKind !== 'auth') {
        await SplashScreen.hideAsync();
        return;
      }

      if (status === 'authenticated') {
        const done = await isOnboardingDone();
        const destination = done ? '/(tabs)/library' : '/onboarding';

        if (Platform.OS !== 'web' && done) {
          router.replace('/(tabs)/library');
          setShowLaunch(true);
          return;
        }

        router.replace(destination);
        await SplashScreen.hideAsync();
        return;
      }

      router.replace('/auth/login');
      await SplashScreen.hideAsync();
    })();
  }, [fontsLoaded, navigationState?.key, restoreSession]);

  const handleLaunchFinish = useCallback(async () => {
    setShowLaunch(false);
    await SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Suspense
          fallback={
            <View style={{ flex: 1, backgroundColor: '#F7F2E9' }} />
          }
        >
          <Stack
            screenOptions={{
              headerShown: false,
              freezeOnBlur: true,
              animation: Platform.OS === 'web' ? 'none' : 'default',
            }}
          />
        </Suspense>
        {showLaunch && authStatus === 'authenticated' ? (
          <AuthLaunchScreen
            sessionReady={authStatus === 'authenticated'}
            onFinish={handleLaunchFinish}
          />
        ) : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
