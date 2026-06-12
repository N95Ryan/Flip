import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PaywallScreen } from '@/components/PaywallScreen';
import { SerifText } from '@/components/SerifText';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

const LOGO = require('@/assets/images/Flip-logo.png');

const FEATURES = [
  'Log every training session',
  'Track intensity and duration',
  'Unlimited session history',
];

export function PremiumGate() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const handleRestore = async () => {
    setRestoreLoading(true);
    try {
      await refreshUser();
      const status = useAuthStore.getState().user?.subscription_status;
      if (status !== 'active') {
        Alert.alert('Premium', 'No active subscription found.');
      }
    } catch {
      Alert.alert('Premium', 'Something went wrong. Please try again.');
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <SerifText style={styles.title}>Unlock your training journal</SerifText>
      <Text style={styles.subtitle}>
        Track sessions, measure progress, and build a complete training history.
      </Text>

      <View style={styles.features}>
        {FEATURES.map((feature) => (
          <Text key={feature} style={styles.featureItem}>
            • {feature}
          </Text>
        ))}
      </View>

      <PaywallScreen
        onRestorePurchase={handleRestore}
        restoreLoading={restoreLoading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 12,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  features: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  featureItem: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
  },
});
