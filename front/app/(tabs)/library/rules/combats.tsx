import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';

type RuleItem = {
  title: string;
  description: string;
};

const ITEMS: RuleItem[] = [
  {
    title: 'Randori — Free practice',
    description:
      'Mutual training where both partners attack and defend freely. The goal is learning, not winning.',
  },
  {
    title: 'Shiai — Competition',
    description:
      'An official match with a referee and judges. Full rules apply. The goal is ippon.',
  },
  {
    title: 'Kata — Formal exercise',
    description:
      'Pre-arranged sequences of techniques practiced with a partner. Used to study principles, not to fight.',
  },
  {
    title: 'Newaza — Ground work',
    description:
      'Groundwork randori focused on pins, chokes, and armlocks. A crucial part of complete judo.',
  },
];

const BORDER_COLOR = '#2563EB';

export default function CombatsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Combats</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Judo is practiced in different contexts, each with its own rules and
          spirit.
        </Text>

        {ITEMS.map((item) => (
          <View
            key={item.title}
            style={[styles.card, { borderLeftColor: BORDER_COLOR }]}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2E9',
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
    color: '#34344A',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  intro: {
    fontSize: 14,
    color: '#84714F',
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34344A',
  },
  cardDescription: {
    fontSize: 14,
    color: '#84714F',
    marginTop: 6,
    lineHeight: 22,
  },
});
