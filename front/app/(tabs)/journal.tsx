import { AntDesign } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';

export default function JournalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AntDesign name="lock" size={48} color={Colors.textMuted} style={styles.lockIcon} />
        <Text style={styles.title}>Training journal — Premium feature</Text>
        <Pressable style={styles.button} disabled>
          <Text style={styles.buttonText}>Unlock with Stripe</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  lockIcon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    opacity: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
});
