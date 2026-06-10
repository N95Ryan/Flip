import { StyleSheet, Text, View } from 'react-native';

import { SerifText } from '@/components/SerifText';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import type { Technique, TechniqueDifficulty } from '@/types/technique';

interface TechniqueCardProps {
  technique: Technique;
}

const DIFFICULTY_COLORS: Record<TechniqueDifficulty, string> = {
  beginner: '#2D6A4F',
  intermediate: '#84714F',
  advanced: '#BF1A2F',
};

function formatDifficulty(difficulty: TechniqueDifficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function formatSubcategory(subcategory: string): string {
  return subcategory
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

export function TechniqueCard({ technique }: TechniqueCardProps) {
  const badgeColor = DIFFICULTY_COLORS[technique.difficulty];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <SerifText style={styles.name}>{technique.name}</SerifText>
          <Text style={styles.subcategory}>{formatSubcategory(technique.subcategory)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{formatDifficulty(technique.difficulty)}</Text>
        </View>
      </View>

      {technique.tags.length > 0 && (
        <View style={styles.tags}>
          {technique.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.textPrimary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subcategory: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.card,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.surface,
    textTransform: 'uppercase',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    backgroundColor: Colors.background,
    borderRadius: Theme.borderRadius.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
