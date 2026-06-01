import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { apiFetchAuth, formatAvatarUploadError, uploadAvatar } from "@/lib/api";
import { normalizeUsernameInput, validateUsername } from "@/lib/username";
import {
  avatarInitial,
  emailUsernameFallback,
  useAuthStore,
  type User,
} from "@/store/authStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, refreshUser, setUser } = useAuthStore();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? emailUsernameFallback(user.email));
    }
  }, [user?.id, user?.username, user?.email]);

  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(() => {
        // pas de session valide
      });
    }, [refreshUser]),
  );

  const handleSignOut = async () => {
    await logout();
    router.replace("/auth/login");
  };

  const handleUsernameBlur = () => {
    const normalized = normalizeUsernameInput(username);
    if (normalized !== username.trim()) {
      setUsername(normalized);
    }
  };

  const handleSaveUsername = async () => {
    const normalized = normalizeUsernameInput(username);
    const validationError = validateUsername(normalized);
    if (validationError) {
      Alert.alert("Username", validationError);
      return;
    }
    setSaving(true);
    try {
      await updateProfile(normalized);
      setUsername(normalized);
      Alert.alert("Profil", "Username enregistré.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      Alert.alert("Profil", message);
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission", "Accès refusé.");
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? "image/jpeg";

    setAvatarLoading(true);
    try {
      const data = await uploadAvatar<{ user: User }>(asset.uri, mimeType);
      setUser(data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      Alert.alert("Photo", formatAvatarUploadError(message));
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarLoading(true);
    try {
      const data = await apiFetchAuth<{ user: typeof user }>(
        "/users/me/avatar",
        {
          method: "DELETE",
        },
      );
      if (data.user) setUser(data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      Alert.alert("Photo", formatAvatarUploadError(message));
    } finally {
      setAvatarLoading(false);
    }
  };

  const showAvatarOptions = () => {
    const hasAvatar = Boolean(user?.avatar_url);
    const options = hasAvatar
      ? ["Ajouter une nouvelle photo", "Supprimer la photo", "Annuler"]
      : ["Ajouter une nouvelle photo", "Annuler"];
    const cancelIndex = options.length - 1;
    const destructiveIndex = hasAvatar ? 1 : undefined;

    const onSelect = (index: number) => {
      if (index === cancelIndex) return;
      if (hasAvatar && index === 1) {
        Alert.alert("Supprimer la photo", "Confirmer la suppression ?", [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: handleDeleteAvatar,
          },
        ]);
        return;
      }
      if (index === 0) {
        if (Platform.OS === "ios") {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: ["Bibliothèque", "Appareil photo", "Annuler"],
              cancelButtonIndex: 2,
            },
            (i) => {
              if (i === 0) pickImage(false);
              if (i === 1) pickImage(true);
            },
          );
        } else {
          Alert.alert("Photo", "Choisir une source", [
            { text: "Bibliothèque", onPress: () => pickImage(false) },
            { text: "Appareil photo", onPress: () => pickImage(true) },
            { text: "Annuler", style: "cancel" },
          ]);
        }
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: cancelIndex,
          destructiveButtonIndex: destructiveIndex,
        },
        onSelect,
      );
    } else {
      const buttons = options.slice(0, -1).map((label, index) => ({
        text: label,
        style: (hasAvatar && index === 1 ? "destructive" : "default") as
          | "default"
          | "destructive"
          | "cancel",
        onPress: () => onSelect(index),
      }));
      Alert.alert("Photo de profil", undefined, [
        ...buttons,
        { text: "Annuler", style: "cancel" },
      ]);
    }
  };

  const initial = avatarInitial(user);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Pressable
          style={styles.avatarPressable}
          onPress={showAvatarOptions}
          disabled={avatarLoading}
        >
          {user?.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
          {avatarLoading && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
        </Pressable>

        <Text style={styles.avatarHint}>Touch to change the avatar</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            onBlur={handleUsernameBlur}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.fieldHint}>
            Letters, numbers and underscore — no space
          </Text>
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveUsername}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
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
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  avatarPressable: {
    width: 80,
    height: 80,
    marginBottom: 8,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#34344A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatarHint: {
    fontSize: 12,
    color: "#84714F",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34344A",
    marginBottom: 32,
  },
  field: {
    width: "100%",
    marginBottom: 32,
  },
  label: {
    fontSize: 13,
    color: "#84714F",
    marginBottom: 4,
  },
  fieldHint: {
    fontSize: 12,
    color: "#84714F",
    marginTop: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E0D0",
    borderRadius: 12,
    padding: 14,
    color: "#34344A",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#BF1A2F",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  signOutButton: {
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#BF1A2F",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 24,
  },
  signOutText: {
    color: "#BF1A2F",
    fontWeight: "700",
    fontSize: 16,
  },
});
