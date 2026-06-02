import { create } from 'zustand';

import { apiFetch, apiFetchAuth } from '@/lib/api';
import { removeToken, saveToken } from '@/lib/auth';

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

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (username: string) => Promise<void>;
  updateBeltLevel: (belt: string) => Promise<void>;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
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
