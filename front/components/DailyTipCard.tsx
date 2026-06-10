import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { getDailyTip } from '@/constants/judoTips';
import { Theme } from '@/constants/theme';

export function DailyTipCard() {
  const tip = getDailyTip();

  return (
    <View style={styles.card}>
      <Text style={styles.quote}>"{tip.quote}"</Text>
      <Text style={styles.author}>— {tip.author}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#84714F',
    borderRadius: Theme.borderRadius.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  author: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
  },
});
