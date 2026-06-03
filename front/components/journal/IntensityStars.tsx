import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

type IntensityStarsProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
};

export function IntensityStars({ value, onChange, size = 18 }: IntensityStarsProps) {
  const interactive = Boolean(onChange);

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const StarWrapper = interactive ? Pressable : View;
        return (
          <StarWrapper
            key={star}
            onPress={interactive ? () => onChange?.(star) : undefined}
            style={styles.starHit}
          >
            <Text style={[styles.star, { fontSize: size, opacity: filled ? 1 : 0.25 }]}>
              ★
            </Text>
          </StarWrapper>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starHit: {
    padding: 2,
  },
  star: {
    color: Colors.accent,
  },
});
