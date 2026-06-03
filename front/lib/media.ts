import { API_URL } from '@/constants/api';

export function resolveAvatarUrl(url?: string): string | undefined {
  if (!url) return undefined;

  try {
    const api = new URL(API_URL);
    const parsed = new URL(url);

    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      parsed.hostname = api.hostname;
      parsed.port = api.port;
      parsed.protocol = api.protocol;
      return parsed.toString();
    }

    return url;
  } catch {
    return url;
  }
}
