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
    title: 'Mae Ukemi / Forward breakfall',
    description:
      'Fall forward onto both forearms simultaneously, arms at 45°, slap the mat firmly. Never let your head touch the mat.',
  },
  {
    title: 'Ushiro Ukemi / Backward breakfall',
    description:
      'Roll backward, tuck your chin to your chest, slap both arms flat on the mat at 45° as your back lands.',
  },
  {
    title: 'Yoko Ukemi / Side breakfall',
    description:
      'Fall to the side, slap the mat with the arm on the same side. Keep the lower leg straight, upper leg bent.',
  },
  {
    title: 'Mae Mawari Ukemi / Rolling breakfall',
    description:
      'A forward rolling fall over one arm. Used to absorb throws like seoi nage. The most important ukemi in competition.',
  },
];

const ACCENT_COLOR = '#BF1A2F';

export default function UkemiScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LibraryScreenHeader title="Ukemi" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Ukemi are the first techniques every judoka must master. Falling safely
          is the foundation of judo.
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
