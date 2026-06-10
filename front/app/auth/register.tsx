'use client';

import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AntDesign, Ionicons } from '@expo/vector-icons';
import { AuthInput } from '@/components/auth/AuthInput';
import { SerifText } from '@/components/SerifText';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { isOnboardingDone } from '@/lib/onboarding';
import { useAuthStore } from '@/store/authStore';

const LOGO = require('@/assets/images/Flip-logo.png');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOCIAL_ICON_SIZE = 20;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState(Platform.OS !== 'web');
  const { register, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsInteractive(true);
    }
  }, []);

  const handleSignUp = async () => {
    console.log('handleSignUp called');
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setLocalError('Email is required');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setLocalError(null);
    try {
      await register(trimmedEmail, password);
      const done = await isOnboardingDone();
      router.replace((done ? '/(tabs)/library' : '/onboarding') as Href);
    } catch {
      // error is set in the store
    }
  };

  const displayError = localError ?? error;

  const signUpButtonStyle = [
    styles.signUpButton,
    isLoading && styles.signUpButtonDisabled,
  ];

  const signUpButtonLabel = isLoading ? (
    <ActivityIndicator color="#FFFFFF" />
  ) : (
    <Text style={styles.signUpButtonText}>Sign up</Text>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <SerifText style={styles.title}>Flip</SerifText>
        <Text style={styles.subtitle}>Create your account</Text>

        <View style={styles.form}>
          <AuthInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            importantForAutofill="no"
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.inputSpacing}
          />
          <AuthInput
            placeholder="Password"
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
            importantForAutofill="no"
            value={password}
            onChangeText={setPassword}
            containerStyle={styles.inputSpacing}
          />
          <AuthInput
            placeholder="Confirm password"
            secureTextEntry
            autoComplete="password-new"
            textContentType="newPassword"
            importantForAutofill="no"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            containerStyle={styles.inputSpacing}
          />
          {Platform.OS === 'web' && isInteractive ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                void handleSignUp();
              }}
              style={{
                ...(StyleSheet.flatten(signUpButtonStyle) as object),
                display: 'flex',
                width: '100%',
                boxSizing: 'border-box',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <span
                  style={StyleSheet.flatten(styles.signUpButtonText) as object}
                >
                  Sign up
                </span>
              )}
            </button>
          ) : Platform.OS === 'web' ? (
            <View style={signUpButtonStyle}>{signUpButtonLabel}</View>
          ) : (
            <TouchableOpacity
              style={signUpButtonStyle}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {signUpButtonLabel}
            </TouchableOpacity>
          )}
          {displayError ? (
            <Text style={styles.errorText}>{displayError}</Text>
          ) : null}
        </View>

        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>— ou —</Text>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.socialButtons}>
          <Pressable style={styles.googleButton}>
            <AntDesign name="google" size={SOCIAL_ICON_SIZE} color={Colors.textPrimary} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>
          <Pressable style={styles.appleButton}>
            <Ionicons name="logo-apple" size={18} color={Colors.surface} />
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          {Platform.OS === 'web' && isInteractive ? (
            <button
              type="button"
              onClick={() => router.replace('/auth/login')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <span
                style={StyleSheet.flatten(styles.footerLink) as object}
              >
                Sign in
              </span>
            </button>
          ) : (
            <Pressable onPress={() => router.replace('/auth/login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginTop: 24,
  },
  title: {
    fontSize: 32,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputSpacing: {
    marginBottom: 12,
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.cta,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: Colors.primary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 28,
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  separatorText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  socialButtons: {
    width: '100%',
    gap: 12,
  },
  googleButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    borderRadius: Theme.borderRadius.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Theme.borderRadius.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
