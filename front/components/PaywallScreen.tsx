import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { createCheckout } from '@/lib/api';

type PlanKey = 'monthly' | 'yearly' | 'lifetime';

type Plan = {
  planKey: PlanKey;
  title: string;
  price: string;
  period: string;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    planKey: 'monthly',
    title: 'Monthly',
    price: '$4.99',
    period: '/ month',
  },
  {
    planKey: 'yearly',
    title: 'Yearly',
    price: '$39.99',
    period: '/ year',
    badge: 'SAVE 33%',
  },
  {
    planKey: 'lifetime',
    title: 'Lifetime',
    price: '$99.99',
    period: 'one-time',
    badge: 'BEST VALUE',
  },
];

async function openCheckoutUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  await Linking.openURL(url);
}

type PaywallScreenProps = {
  onRestorePurchase?: () => void;
  restoreLoading?: boolean;
};

export function PaywallScreen({
  onRestorePurchase,
  restoreLoading = false,
}: PaywallScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const { url } = await createCheckout(selectedPlan);
      await openCheckoutUrl(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      Alert.alert('Premium', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.plans}>
        {PLANS.map((plan) => {
          const selected = selectedPlan === plan.planKey;
          return (
            <Pressable
              key={plan.planKey}
              style={[styles.card, selected && styles.cardSelected]}
              onPress={() => setSelectedPlan(plan.planKey)}
            >
              {plan.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{plan.badge}</Text>
                </View>
              ) : null}
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>{plan.period}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[
          styles.continueButton,
          (!selectedPlan || loading) && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!selectedPlan || loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.surface} />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </Pressable>

      {onRestorePurchase ? (
        <Pressable
          style={styles.restoreButton}
          onPress={onRestorePurchase}
          disabled={restoreLoading}
          hitSlop={12}
        >
          <Text style={[styles.restoreButtonText, restoreLoading && styles.restoreButtonDisabled]}>
            {restoreLoading ? 'Checking...' : 'Restore Purchase'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: 16,
    marginTop: 8,
  },
  plans: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.card,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.surface,
    letterSpacing: 0.3,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  period: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.cta,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreButtonText: {
    fontSize: 13,
    color: Colors.accent,
    textDecorationLine: 'underline',
  },
  restoreButtonDisabled: {
    opacity: 0.5,
  },
});
