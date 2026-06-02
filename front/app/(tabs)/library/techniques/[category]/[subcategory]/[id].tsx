import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';
import { Colors } from '@/constants/colors';
import { useTechnique } from '@/hooks/useTechnique';
import { trackTechniqueView } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import type { TechniqueDifficulty } from '@/types/technique';

const DIFFICULTY_COLORS: Record<TechniqueDifficulty, string> = {
  beginner: '#2D6A4F',
  intermediate: '#84714F',
  advanced: '#BF1A2F',
};

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

function formatDifficulty(difficulty: TechniqueDifficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export default function TechniqueDetailScreen() {
  const { id, category } = useLocalSearchParams<{ id: string; category: string }>();
  const { technique, loading, error } = useTechnique(id ?? '');
  const refreshUser = useAuthStore((s) => s.refreshUser);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      await trackTechniqueView(token);
      if (!cancelled) {
        refreshUser().catch(() => {
          // silent
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, refreshUser]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
      </View>

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

      {!loading && !error && technique && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.name}>{technique.name}</Text>

          <View
            style={[
              styles.badge,
              { backgroundColor: DIFFICULTY_COLORS[technique.difficulty] },
            ]}
          >
            <Text style={styles.badgeText}>{formatDifficulty(technique.difficulty)}</Text>
          </View>

          <Text style={styles.meta}>
            {formatLabel(technique.subcategory)} ·{' '}
            {formatLabel(category ?? technique.category)}
          </Text>

          <Text style={styles.description}>{technique.description}</Text>

          {technique.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsTitle}>Tags</Text>
              <View style={styles.tags}>
                {technique.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.surface,
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  tagsSection: {
    marginTop: 8,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 13,
    color: Colors.textMuted,
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
});
