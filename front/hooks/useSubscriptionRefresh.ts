import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuthStore } from '@/store/authStore';

export function useSubscriptionRefresh() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && user) {
        refreshUser().catch(() => {});
      }
    });
    return () => sub.remove();
  }, [refreshUser, user]);
}
