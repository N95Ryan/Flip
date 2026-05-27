import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user?.email) {
      setUsername(user.email.split('@')[0] ?? '');
    }
  }, [user?.email]);

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?';

  const handleSignOut = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <Text style={styles.email}>{user?.email ?? ''}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Pressable
            style={styles.saveButton}
            onPress={() => Alert.alert('Coming soon')}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: 80,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34344A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34344A',
    marginBottom: 32,
  },
  field: {
    width: '100%',
    marginBottom: 32,
  },
  label: {
    fontSize: 13,
    color: '#84714F',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E0D0',
    borderRadius: 12,
    padding: 14,
    color: '#34344A',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#BF1A2F',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  signOutButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#BF1A2F',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  signOutText: {
    color: '#BF1A2F',
    fontWeight: '700',
    fontSize: 16,
  },
});
