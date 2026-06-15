import { useState } from 'react';
import { Alert } from 'react-native';

import { useAuthStore } from '@/store/authStore';

export function useRestorePurchase() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const [loading, setLoading] = useState(false);

  const restorePurchase = async () => {
    setLoading(true);
    try {
      await refreshUser();
      const status = useAuthStore.getState().user?.subscription_status;
      if (status !== 'active') {
        Alert.alert('Premium', 'No active subscription found.');
      }
    } catch {
      Alert.alert('Premium', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { restorePurchase, loading };
}
