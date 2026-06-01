import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { API_URL } from '@/constants/api';

export default function RootLayout() {
  useEffect(() => {
    if (__DEV__) {
      console.log('[Flip] API_URL =', API_URL);
    }
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
