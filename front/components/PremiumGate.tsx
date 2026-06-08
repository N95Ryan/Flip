import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PaywallScreen } from '@/components/PaywallScreen';
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
      if (status === 'active') {
        Alert.alert('Premium', 'Your subscription is active!');
      } else {
        Alert.alert(
          'Premium',
          'No active subscription found. Complete checkout or try again in a moment.',
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not refresh status';
      Alert.alert('Premium', message);
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
      <Text style={styles.title}>Unlock your training journal</Text>
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

      <PaywallScreen />

      <Pressable
        style={styles.secondaryButton}
        onPress={handleRestore}
        disabled={restoreLoading}
      >
        {restoreLoading ? (
          <ActivityIndicator color={Colors.accent} />
        ) : (
          <Text style={styles.secondaryButtonText}>Restore purchase</Text>
        )}
      </Pressable>
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
    paddingBottom: 24,
    gap: 12,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
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
  secondaryButton: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },
});
