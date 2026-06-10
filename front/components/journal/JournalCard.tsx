import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IntensityStars } from '@/components/journal/IntensityStars';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import type { JournalEntry } from '@/types/journal';

type JournalCardProps = {
  entry: JournalEntry;
  onPress: () => void;
};

function formatDate(sessionDate: string): string {
  const [y, m, d] = sessionDate.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function JournalCard({ entry, onPress }: JournalCardProps) {
  const preview =
    entry.notes.trim().length > 0
      ? entry.notes.trim()
      : 'No notes';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(entry.session_date)}</Text>
        <Text style={styles.duration}>{entry.duration_minutes} min</Text>
      </View>
      <IntensityStars value={entry.intensity} size={16} />
      <Text style={styles.notes} numberOfLines={2}>
        {preview}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.card,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    gap: 8,
    shadowColor: Colors.textPrimary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  notes: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
});
