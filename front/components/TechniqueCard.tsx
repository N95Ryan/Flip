import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import type { Technique, TechniqueDifficulty } from '@/types/technique';

interface TechniqueCardProps {
  technique: Technique;
}

const DIFFICULTY_COLORS: Record<TechniqueDifficulty, string> = {
  beginner: '#27AE60',
  intermediate: '#E67E22',
  advanced: '#C0392B',
};

function formatDifficulty(difficulty: TechniqueDifficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export function TechniqueCard({ technique }: TechniqueCardProps) {
  const badgeColor = DIFFICULTY_COLORS[technique.difficulty];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{technique.name}</Text>
          <Text style={styles.subcategory}>{technique.subcategory}</Text>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
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
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subcategory: {
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
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
    borderRadius: 8,
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
