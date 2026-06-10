'use client';

import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthInput } from "@/components/auth/AuthInput";
import { SerifText } from "@/components/SerifText";
import { Colors } from "@/constants/colors";
import { Theme } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";

const LOGO = require("@/assets/images/Flip-logo.png");

/** Fond du bouton Apple → couleur de l'icône Google */
const GOOGLE_ICON_COLOR = "#34344A";
/** Fond du bouton Google → couleur de l'icône Apple */
const APPLE_ICON_COLOR = "#FFFFFF";

const SOCIAL_ICON_SIZE = 20;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState(Platform.OS !== "web");
  const { login, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (Platform.OS === "web") {
      setIsInteractive(true);
    }
  }, []);

  const handleSignIn = async () => {
    console.log('handleSignIn called');
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setLocalError('Email is required');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }

    setLocalError(null);
    try {
      await login(trimmedEmail, password);
      router.replace("/(tabs)/library");
    } catch {
      // error is set in the store
    }
  };

  const displayError = localError ?? error;

  const signInButtonStyle = [
    styles.signInButton,
    isLoading && styles.signInButtonDisabled,
  ];

  const signInButtonLabel = isLoading ? (
    <ActivityIndicator color="#FFFFFF" />
  ) : (
    <Text style={styles.signInButtonText}>Sign in</Text>
  );
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />
          <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <SerifText style={styles.title}>Flip</SerifText>
        <Text style={styles.subtitle}>Your judo companion</Text>

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
            autoComplete="password"
            textContentType="password"
            importantForAutofill="no"
            value={password}
            onChangeText={setPassword}
            containerStyle={styles.inputSpacing}
          />
          {Platform.OS === "web" && isInteractive ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                void handleSignIn();
              }}
              style={{
                ...(StyleSheet.flatten(signInButtonStyle) as object),
                display: "flex",
                width: "100%",
                boxSizing: "border-box",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <span
                  style={StyleSheet.flatten(styles.signInButtonText) as object}
                >
                  Sign in
                </span>
              )}
            </button>
          ) : Platform.OS === "web" ? (
            <View style={signInButtonStyle}>{signInButtonLabel}</View>
          ) : (
            <TouchableOpacity
              style={signInButtonStyle}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {signInButtonLabel}
            </TouchableOpacity>
          )}
          {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}
        </View>

        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>— or —</Text>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.socialButtons}>
          <Pressable style={styles.googleButton}>
            <AntDesign
              name="google"
              size={SOCIAL_ICON_SIZE}
              color={GOOGLE_ICON_COLOR}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>
          <Pressable style={styles.appleButton}>
            <Ionicons
              name="logo-apple"
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          {Platform.OS === "web" && isInteractive ? (
            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <span
                style={StyleSheet.flatten(styles.footerLink) as object}
              >
                Sign up
              </span>
            </button>
          ) : (
            <Pressable onPress={() => router.push("/auth/register")}>
              <Text style={styles.footerLink}>Sign up</Text>
            </Pressable>
          )}
        </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 80, height: 80, marginTop: 24 },
  title: { fontSize: 32, color: Colors.textPrimary, marginTop: 16 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4, marginBottom: 32 },
  form: { width: "100%" },
  inputSpacing: { marginBottom: 12 },
  signInButton: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.cta,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  signInButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  signInButtonDisabled: { opacity: 0.6 },
  errorText: {
    color: Colors.primary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 28,
    gap: 12,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  separatorText: { color: Colors.textMuted, fontSize: 14 },
  socialButtons: { width: "100%", gap: 12 },
  googleButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    borderRadius: Theme.borderRadius.card,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleButtonText: { color: Colors.textPrimary, fontSize: 16, fontWeight: "600" },
  appleButton: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Theme.borderRadius.card,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  appleButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  footer: { flexDirection: "row", marginTop: 32, alignItems: "center" },
  footerText: { color: Colors.textPrimary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
});
