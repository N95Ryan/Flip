import { StyleSheet, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { SerifText } from '@/components/SerifText';
import { Colors } from '@/constants/colors';

type LibraryScreenHeaderProps = {
  title: string;
};

export function LibraryScreenHeader({ title }: LibraryScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <BackButton />
      <SerifText style={styles.title}>{title}</SerifText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    color: Colors.textPrimary,
    flex: 1,
  },
});
