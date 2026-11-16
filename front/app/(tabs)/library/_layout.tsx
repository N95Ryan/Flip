import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function LibraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'web' ? 'none' : 'default',
      }}
    />
  );
}
