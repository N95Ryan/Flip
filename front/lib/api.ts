import { API_URL } from '@/constants/api';
import { getAuthToken } from '@/lib/auth';

function authRouteMessage(status: number, path: string, apiError?: string): string | null {
  if (!path.includes('/auth/')) return null;
  if (status === 503 && apiError?.includes('migration')) {
    return apiError;
  }
  if (status === 500 && apiError === 'could not log in') {
    return 'Schéma Neon incomplet — exécute back/migrations/fix_login_neon.sql dans l’éditeur SQL Neon (même base que Render), puis réessaie.';
  }
  return null;
}

function profileRouteMessage(status: number, path: string): string | null {
  if (!path.includes('/users/me')) return null;
  if (status === 404) {
    if (path.includes('/belt')) {
      return 'Route ceinture absente — redéploie le backend (PATCH /users/me/belt).';
    }
    return 'API Render pas à jour — redéploie le backend (routes profil manquantes).';
  }
  if (status === 401) return 'Session expirée — reconnecte-toi.';
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
      throw new Error(`Réponse invalide du serveur (${res.status})`);
    }
  }

  if (!res.ok) {
    const authMsg = authRouteMessage(res.status, path, data.error);
    const profileMsg = profileRouteMessage(res.status, path);
    const base =
      authMsg ?? profileMsg ?? data.error ?? `Erreur serveur (${res.status})`;
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
        `Impossible de joindre l'API (${API_URL}). Vérifie que le backend tourne et EXPO_PUBLIC_API_URL.`
      );
    }
    return err;
  }
  return new Error('Erreur réseau');
}

export function formatAvatarUploadError(message: string): string {
  if (
    message.includes('could not update profile') ||
    message.includes('Erreur serveur (500)')
  ) {
    return `${message}\n\nSur Render, configure S3_BUCKET et les variables S3/R2 (voir back/.env.example).`;
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
  if (!token) throw new Error('Non connecté — reconnecte-toi');

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

export async function uploadAvatar<T = unknown>(
  uri: string,
  mimeType: string
): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new Error('Non connecté — reconnecte-toi');

  const path = '/users/me/avatar';
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: `avatar.${ext}`,
    type: mimeType,
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
