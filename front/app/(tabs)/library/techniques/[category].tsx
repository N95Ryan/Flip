import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LibraryNavCard } from '@/components/library/LibraryNavCard';
import { LibraryScreenHeader } from '@/components/library/LibraryScreenHeader';
import { Colors } from '@/constants/colors';
import { LibraryRoutes } from '@/constants/libraryRoutes';
import type { TechniqueCategory } from '@/types/technique';

type SubcategoryItem = {
  value: string;
  label: string;
  translation: string;
  accentColor: string;
};

const SUBCATEGORIES: Record<TechniqueCategory, SubcategoryItem[]> = {
  'nage-waza': [
    { value: 'te-waza', label: 'Te-waza', translation: 'Arm throws', accentColor: '#BF1A2F' },
    { value: 'koshi-waza', label: 'Koshi-waza', translation: 'Hip throws', accentColor: '#BF1A2F' },
    { value: 'ashi-waza', label: 'Ashi-waza', translation: 'Leg sweeps', accentColor: '#BF1A2F' },
    {
      value: 'ma-sutemi-waza',
      label: 'Ma-sutemi-waza',
      translation: 'Sacrifice throws',
      accentColor: '#BF1A2F',
    },
  ],
  'katame-waza': [
    { value: 'osaekomi-waza', label: 'Osaekomi-waza', translation: 'Pins', accentColor: '#84714F' },
    { value: 'shime-waza', label: 'Shime-waza', translation: 'Chokes', accentColor: '#84714F' },
    { value: 'kansetsu-waza', label: 'Kansetsu-waza', translation: 'Armlocks', accentColor: '#84714F' },
  ],
  'atemi-waza': [
    { value: 'ude-ate', label: 'Ude-ate', translation: 'Arm strikes', accentColor: '#34344A' },
    { value: 'keri-waza', label: 'Keri-waza', translation: 'Kicks', accentColor: '#34344A' },
  ],
};

function formatCategoryLabel(category: string): string {
  return category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

export default function SubcategoriesScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const categoryKey = category as TechniqueCategory;
  const subcategories = SUBCATEGORIES[categoryKey] ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LibraryScreenHeader title={formatCategoryLabel(category ?? '')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cards}>
          {subcategories.map((sub) => (
            <LibraryNavCard
              key={sub.value}
              accentColor={sub.accentColor}
              title={sub.label}
              subtitle={sub.translation}
              href={LibraryRoutes.techniqueSubcategory(category ?? '', sub.value)}
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
