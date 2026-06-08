import { API_URL } from '@/constants/api';
import { getAuthToken } from '@/lib/auth';

function authRouteMessage(status: number, path: string, apiError?: string): string | null {
  if (!path.includes('/auth/')) return null;
  if (status === 409) {
    return 'This email is already registered. Try signing in instead.';
  }
  if (status === 503 && apiError?.includes('migration')) {
    return apiError;
  }
  if (status === 500 && apiError === 'could not log in') {
    return 'Incomplete Neon schema — run back/migrations/fix_login_neon.sql in the Neon SQL editor (same DB as Render), then retry.';
  }
  return null;
}

function profileRouteMessage(status: number, path: string): string | null {
  if (!path.includes('/users/me')) return null;
  if (status === 404) {
    if (path.includes('/belt')) {
      return 'Belt route missing — redeploy the backend (PATCH /users/me/belt).';
    }
    return 'Render API outdated — redeploy the backend (profile routes missing).';
  }
  if (status === 401) return 'Session expired — please sign in again.';
  return null;
}

async function parseResponse<T>(res: Response, path = ''): Promise<T> {
  const text = await res.text();
  let data: { error?: string } = {};

  if (text) {
    try {
      data = JSON.parse(text) as { error?: string };
    } catch {
      const profileMsg = profileRouteMessage(res.status, path);
      if (profileMsg) throw new Error(profileMsg);
      throw new Error(`Invalid server response (${res.status})`);
    }
  }

  if (!res.ok) {
    const authMsg = authRouteMessage(res.status, path, data.error);
    const profileMsg = profileRouteMessage(res.status, path);
    const base =
      authMsg ?? profileMsg ?? data.error ?? `Server error (${res.status})`;
    if (__DEV__ && data.error && !base.includes(`(${res.status})`)) {
      throw new Error(`${data.error} (${res.status})`);
    }
    throw new Error(base);
  }

  return data as T;
}

function wrapFetchError(err: unknown): Error {
  if (err instanceof Error) {
    if (err.message === 'Failed to fetch' || err.message.includes('Network request failed')) {
      return new Error(
        `Cannot reach the API (${API_URL}). Check that the backend is running and EXPO_PUBLIC_API_URL is set.`
      );
    }
    return err;
  }
  return new Error('Network error');
}

export function formatAvatarUploadError(message: string): string {
  if (
    message.includes('could not update profile') ||
    message.includes('Server error (500)')
  ) {
    return `${message}\n\nOn Render, configure S3_BUCKET and S3/R2 variables (see back/.env.example).`;
  }
  return message;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return parseResponse<T>(res, path);
  } catch (err) {
    throw wrapFetchError(err);
  }
}

export async function apiFetchAuth<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new Error('Not signed in — please sign in again');

  const isFormData = options?.body instanceof FormData;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options?.headers as Record<string, string>),
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
    return parseResponse<T>(res, path);
  } catch (err) {
    throw wrapFetchError(err);
  }
}

export async function trackTechniqueView(token: string): Promise<void> {
  try {
    await fetch(`${API_URL}/users/me/technique-viewed`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch {
    // fire and forget
  }
}

export async function createCheckout(priceId: string): Promise<{ url: string }> {
  return apiFetchAuth<{ url: string }>('/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ price_id: priceId }),
  });
}

export async function uploadAvatar<T = unknown>(
  uri: string,
  mimeType: string
): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new Error('Not signed in — please sign in again');

  const path = '/users/me/avatar';
  const normalizedMime =
    mimeType.includes('heic') || mimeType.includes('heif')
      ? 'image/jpeg'
      : mimeType;
  const ext =
    normalizedMime === 'image/png'
      ? 'png'
      : normalizedMime === 'image/webp'
        ? 'webp'
        : 'jpg';
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: `avatar.${ext}`,
    type: normalizedMime,
  } as unknown as Blob);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return parseResponse<T>(res, path);
  } catch (err) {
    throw wrapFetchError(err);
  }
}
