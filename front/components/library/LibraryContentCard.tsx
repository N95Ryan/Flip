import { StyleSheet, Text, View } from 'react-native';

import { SerifText } from '@/components/SerifText';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type LibraryContentCardProps = {
  accentColor: string;
  title: string;
  description: string;
};

export function LibraryContentCard({
  accentColor,
  title,
  description,
}: LibraryContentCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <SerifText style={styles.title}>{title}</SerifText>
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.card,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: Colors.textPrimary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accentBar: {
    width: Theme.accentBar.width,
    height: Theme.accentBar.height,
    borderRadius: Theme.accentBar.borderRadius,
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    marginLeft: Theme.accentBar.width + 10,
    lineHeight: 22,
  },
});
