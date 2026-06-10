import { StyleSheet, Text, type TextProps } from 'react-native';

import { Theme } from '@/constants/theme';

export function SerifText({ style, ...props }: TextProps) {
  return <Text style={[styles.serif, style]} {...props} />;
}

const styles = StyleSheet.create({
  serif: {
    fontFamily: Theme.fontFamily.serif,
  },
});
