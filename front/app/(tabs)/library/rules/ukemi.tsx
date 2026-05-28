import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';

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

const BORDER_COLOR = '#BF1A2F';

export default function UkemiScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Ukemi</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Ukemi are the first techniques every judoka must master. Falling safely
          is the foundation of judo.
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
