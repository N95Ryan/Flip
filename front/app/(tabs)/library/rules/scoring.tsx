import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';

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

const BORDER_COLOR = '#84714F';

export default function ScoringScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Scoring</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Judo matches are won by scoring points. A single ippon ends the match
          immediately.
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
