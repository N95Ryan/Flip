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
    title: 'Ippon — Full point',
    description:
      'Awarded for a clean throw landing uke on their back with force and speed, or for a hold lasting 20 seconds, or for a submission.',
  },
  {
    title: 'Waza-ari — Half point',
    description:
      'A throw not quite ippon. Two waza-ari equal one ippon (awasete ippon).',
  },
  {
    title: 'Shido — Penalty',
    description:
      'Given for minor violations: false attacks, stalling, stepping out. Three shido = hansoku-make.',
  },
  {
    title: 'Hansoku-make — Disqualification',
    description:
      'Direct disqualification for dangerous techniques. Ends the match immediately.',
  },
];

const ACCENT_COLOR = '#84714F';

export default function ScoringScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LibraryScreenHeader title="Scoring" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Judo matches are won by scoring points. A single ippon ends the match
          immediately.
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
