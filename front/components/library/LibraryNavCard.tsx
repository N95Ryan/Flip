import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { SerifText } from '@/components/SerifText';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';

type LibraryNavCardProps = {
  accentColor: string;
  title: string;
  subtitle?: string;
  description?: string;
  footer?: string;
  kanji?: string;
  href?: Href;
  onPress?: () => void;
  style?: ViewStyle;
};

export function LibraryNavCard({
  accentColor,
  title,
  subtitle,
  description,
  footer,
  kanji,
  href,
  onPress,
  style,
}: LibraryNavCardProps) {
  const content = (
    <>
      {kanji ? (
        <SerifText style={styles.kanji} pointerEvents="none">
          {kanji}
        </SerifText>
      ) : null}
      <View style={styles.titleRow}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <SerifText style={styles.title}>{title}</SerifText>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </>
  );

  const pressable = (
    <Pressable
      style={({ pressed }) => pressed && styles.pressed}
      onPress={href ? undefined : onPress}
    >
      <View style={[styles.card, style]}>{content}</View>
    </Pressable>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        {pressable}
      </Link>
    );
  }

  if (onPress) {
    return pressable;
  }

  return <View style={[styles.card, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.card,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.textPrimary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  pressed: {
    opacity: 0.92,
  },
  kanji: {
    position: 'absolute',
    right: 12,
    top: 8,
    fontSize: Theme.kanji.fontSize,
    color: Theme.kanji.color,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  accentBar: {
    width: Theme.accentBar.width,
    height: Theme.accentBar.height,
    borderRadius: Theme.accentBar.borderRadius,
  },
  title: {
    fontSize: 18,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  footer: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
