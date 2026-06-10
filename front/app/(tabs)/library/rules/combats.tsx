import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LibraryContentCard } from '@/components/library/LibraryContentCard';
import { LibraryScreenHeader } from '@/components/library/LibraryScreenHeader';
import { Colors } from '@/constants/colors';

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

const ACCENT_COLOR = '#34344A';

export default function CombatsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LibraryScreenHeader title="Combats" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Judo is practiced in different contexts, each with its own rules and
          spirit.
        </Text>

        {ITEMS.map((item) => (
          <LibraryContentCard
            key={item.title}
            accentColor={ACCENT_COLOR}
            title={item.title}
            description={item.description}
          />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  intro: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 24,
    lineHeight: 22,
  },
});
