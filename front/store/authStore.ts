import { create } from 'zustand';

import { apiFetch } from '@/lib/api';
import { removeToken, saveToken } from '@/lib/auth';

type User = {
  id: string;
  email: string;
  stripe_customer_id: string;
  subscription_status: string;
  created_at: string;
};

type AuthResponse = {
  user: User;
  token: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

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
}));
