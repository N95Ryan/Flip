import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';
import { Colors } from '@/constants/colors';

type RulesCard = {
  emoji: string;
  borderColor: string;
  title: string;
  subtitle: string;
  description: string;
  route: '/library/rules/ukemi' | '/library/rules/scoring' | '/library/rules/combats';
};

const RULES_CARDS: RulesCard[] = [
  {
    emoji: '🤸',
    borderColor: '#BF1A2F',
    title: 'Ukemi',
    subtitle: 'Breakfalls',
    description: 'The foundation of safe judo practice',
    route: '/library/rules/ukemi',
  },
  {
    emoji: '🏆',
    borderColor: '#84714F',
    title: 'Scoring',
    subtitle: 'Points & penalties',
    description: 'Ippon · Waza-ari · Shido · Hansoku-make',
    route: '/library/rules/scoring',
  },
  {
    emoji: '⚔️',
    borderColor: '#2563EB',
    title: 'Combats',
    subtitle: 'Types of practice',
    description: 'Randori · Shiai · Kata · Newaza',
    route: '/library/rules/combats',
  },
];

export default function RulesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Rules</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {RULES_CARDS.map((card) => (
          <Pressable
            key={card.route}
            style={({ pressed }) => [
              styles.card,
              { borderLeftColor: card.borderColor },
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push(card.route)}
          >
            <Text style={styles.emoji}>{card.emoji}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
    gap: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: Colors.textPrimary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cardPressed: {
    opacity: 0.92,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
