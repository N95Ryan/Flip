import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }

  if (Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host) {
        return `http://${host}:8080`;
      }
    }
  }

  return (envUrl ?? 'http://localhost:8080').replace(/\/$/, '');
}

export const API_URL = resolveApiUrl();
