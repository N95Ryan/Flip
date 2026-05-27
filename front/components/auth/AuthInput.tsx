import {
  Platform,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

type AuthInputProps = TextInputProps & {
  containerStyle?: ViewStyle;
};

const webIgnoreAutofillProps: Partial<TextInputProps> =
  Platform.OS === 'web'
    ? ({
        // Empêche Bitwarden, 1Password, LastPass d'injecter leurs icônes dans le champ
        'data-1p-ignore': 'true',
        'data-lpignore': 'true',
        'data-bwignore': 'true',
        'data-form-type': 'other',
      } as TextInputProps)
    : {};

export function AuthInput({
  style,
  containerStyle,
  onChangeText,
  ...props
}: AuthInputProps) {
  const syncWebValue = (event: unknown) => {
    if (Platform.OS !== 'web' || !onChangeText) return;
    const value = (event as { target?: { value?: string } }).target?.value;
    if (typeof value === 'string') {
      onChangeText(value);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        placeholderTextColor="#84714F"
        {...webIgnoreAutofillProps}
        {...props}
        onChangeText={onChangeText}
        {...(Platform.OS === 'web'
          ? ({
              onInput: syncWebValue,
              onChange: syncWebValue,
            } as TextInputProps)
          : {})}
        style={[styles.input, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#84714F',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#34344A',
    fontSize: 16,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
      default: {},
    }),
  },
});
