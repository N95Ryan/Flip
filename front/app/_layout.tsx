import 'react-native-gesture-handler';

import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthLaunchScreen } from '@/components/AuthLaunchScreen';
import { API_URL } from '@/constants/api';
import { useSubscriptionRefresh } from '@/hooks/useSubscriptionRefresh';
import { useAuthStore, type SessionStatus } from '@/store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const bootstrapped = useRef(false);
  const [authStatus, setAuthStatus] = useState<SessionStatus | 'pending'>('pending');
  const [showLaunch, setShowLaunch] = useState(false);

  useSubscriptionRefresh();

  useEffect(() => {
    if (__DEV__) {
      console.log('[Flip] API_URL =', API_URL);
    }
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      const status = await restoreSession();
      setAuthStatus(status);

      if (status === 'authenticated' && Platform.OS !== 'web') {
        router.replace('/(tabs)/library');
        setShowLaunch(true);
        return;
      }

      router.replace(status === 'authenticated' ? '/(tabs)/library' : '/auth/login');
      await SplashScreen.hideAsync();
    })();
  }, [restoreSession]);

  const handleLaunchFinish = useCallback(async () => {
    setShowLaunch(false);
    await SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
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
