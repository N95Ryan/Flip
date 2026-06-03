import { create } from 'zustand';

import { apiFetch, apiFetchAuth } from '@/lib/api';
import { getToken, removeToken, saveToken } from '@/lib/auth';

export type User = {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  stripe_customer_id: string;
  subscription_status: string;
  belt_level: string;
  techniques_studied: number;
  created_at: string;
};

type AuthResponse = {
  user: User;
  token: string;
};

type ProfileResponse = {
  user: User;
};

export type SessionStatus = 'authenticated' | 'unauthenticated';

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<SessionStatus>;
  refreshUser: () => Promise<void>;
  updateProfile: (username: string) => Promise<void>;
  updateBeltLevel: (belt: string) => Promise<void>;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isBootstrapping: true,
  error: null,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const trimmedEmail = email.trim();
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      await saveToken(data.token);
      set({ user: data.user, token: data.token });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password) => {
    const trimmedEmail = email.trim();
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      await saveToken(data.token);
      set({ user: data.user, token: data.token });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await removeToken();
    set({ user: null, token: null, error: null });
  },

  restoreSession: async () => {
    set({ isBootstrapping: true });
    try {
      const token = await getToken();
      if (!token) {
        set({ user: null, token: null });
        return 'unauthenticated';
      }

      try {
        const data = await apiFetchAuth<ProfileResponse>('/users/me');
        set({ user: data.user, token });
        return 'authenticated';
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        const isExpired =
          message.includes('Session expired') ||
          message.includes('401') ||
          message.toLowerCase().includes('unauthorized');

        if (isExpired) {
          await removeToken();
          set({ user: null, token: null });
        } else {
          set({ user: null, token });
        }
        return 'unauthenticated';
      }
    } finally {
      set({ isBootstrapping: false });
    }
  },

  refreshUser: async () => {
    const data = await apiFetchAuth<ProfileResponse>('/users/me');
    set({ user: data.user });
  },

  updateProfile: async (username) => {
    const data = await apiFetchAuth<ProfileResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ username: username.trim() }),
    });
    set({ user: data.user });
  },

  updateBeltLevel: async (belt) => {
    const data = await apiFetchAuth<ProfileResponse>('/users/me/belt', {
      method: 'PATCH',
      body: JSON.stringify({ belt_level: belt }),
    });
    set({ user: data.user });
  },
}));

export function emailUsernameFallback(email: string): string {
  return email.split('@')[0] ?? '';
}

export function displayUsername(user: User | null): string {
  if (!user) return '';
  if (user.username) return user.username;
  return emailUsernameFallback(user.email);
}

export function avatarInitial(user: User | null): string {
  const name = displayUsername(user) || user?.email || '?';
  return name.charAt(0).toUpperCase();
}
