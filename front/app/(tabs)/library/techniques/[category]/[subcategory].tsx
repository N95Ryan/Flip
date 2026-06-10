import { Link, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LibraryScreenHeader } from '@/components/library/LibraryScreenHeader';
import { TechniqueCard } from '@/components/TechniqueCard';
import { Colors } from '@/constants/colors';
import { LibraryRoutes } from '@/constants/libraryRoutes';
import { useTechniques } from '@/hooks/useTechniques';
import type { CategoryFilterValue, SubcategoryFilterValue } from '@/types/technique';

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

export default function SubcategoryTechniquesScreen() {
  const { category, subcategory } = useLocalSearchParams<{
    category: string;
    subcategory: string;
  }>();
  const categoryFilter = category as CategoryFilterValue;
  const subcategoryFilter = subcategory as SubcategoryFilterValue;
  const { techniques, loading, error } = useTechniques(categoryFilter, subcategoryFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LibraryScreenHeader title={formatLabel(subcategory ?? '')} />

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={techniques}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Link
              href={LibraryRoutes.techniqueDetail(
                category ?? '',
                subcategory ?? '',
                item.id,
              )}
              asChild
            >
              <Pressable style={({ pressed }) => pressed && styles.cardPressed}>
                <TechniqueCard technique={item} />
              </Pressable>
            </Link>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Aucune technique trouvée.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  cardPressed: {
    opacity: 0.92,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
