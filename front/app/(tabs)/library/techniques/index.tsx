import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LibraryNavCard } from '@/components/library/LibraryNavCard';
import { LibraryScreenHeader } from '@/components/library/LibraryScreenHeader';
import { Colors } from '@/constants/colors';
import { LibraryRoutes } from '@/constants/libraryRoutes';
import type { TechniqueCategory } from '@/types/technique';

type CategoryCard = {
  id: TechniqueCategory;
  accentColor: string;
  kanji: string;
  title: string;
  subtitle: string;
  description: string;
  count: string;
};

const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'nage-waza',
    accentColor: '#BF1A2F',
    kanji: '投',
    title: 'Nage-waza',
    subtitle: 'Throwing techniques',
    description: 'Arm throws · Hip throws · Leg sweeps · Sacrifice throws',
    count: '6 techniques',
  },
  {
    id: 'katame-waza',
    accentColor: '#84714F',
    kanji: '固',
    title: 'Katame-waza',
    subtitle: 'Ground techniques',
    description: 'Pins · Chokes · Armlocks',
    count: '4 techniques',
  },
  {
    id: 'atemi-waza',
    accentColor: '#34344A',
    kanji: '打',
    title: 'Atemi-waza',
    subtitle: 'Striking techniques',
    description: 'Arm strikes · Kicks',
    count: '2 techniques',
  },
];

export default function TechniquesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LibraryScreenHeader title="Techniques" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cards}>
          {CATEGORY_CARDS.map((card) => (
            <LibraryNavCard
              key={card.id}
              accentColor={card.accentColor}
              kanji={card.kanji}
              title={card.title}
              subtitle={card.subtitle}
              description={card.description}
              footer={card.count}
              href={LibraryRoutes.techniqueCategory(card.id)}
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
