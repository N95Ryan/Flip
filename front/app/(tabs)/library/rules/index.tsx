import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LibraryNavCard } from '@/components/library/LibraryNavCard';
import { LibraryScreenHeader } from '@/components/library/LibraryScreenHeader';
import { Colors } from '@/constants/colors';

type RulesCard = {
  accentColor: string;
  kanji: string;
  title: string;
  subtitle: string;
  description: string;
  route: '/library/rules/ukemi' | '/library/rules/scoring' | '/library/rules/combats';
};

const RULES_CARDS: RulesCard[] = [
  {
    accentColor: '#BF1A2F',
    kanji: '受',
    title: 'Ukemi',
    subtitle: 'Breakfalls',
    description: 'The foundation of safe judo practice',
    route: '/library/rules/ukemi',
  },
  {
    accentColor: '#84714F',
    kanji: '点',
    title: 'Scoring',
    subtitle: 'Points & penalties',
    description: 'Ippon · Waza-ari · Shido · Hansoku-make',
    route: '/library/rules/scoring',
  },
  {
    accentColor: '#34344A',
    kanji: '戦',
    title: 'Combats',
    subtitle: 'Types of practice',
    description: 'Randori · Shiai · Kata · Newaza',
    route: '/library/rules/combats',
  },
];

export default function RulesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LibraryScreenHeader title="Rules" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cards}>
          {RULES_CARDS.map((card) => (
            <LibraryNavCard
              key={card.route}
              accentColor={card.accentColor}
              kanji={card.kanji}
              title={card.title}
              subtitle={card.subtitle}
              description={card.description}
              href={card.route}
            />
          ))}
        </View>
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  cards: {
    gap: 20,
  },
});
