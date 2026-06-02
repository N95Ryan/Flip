import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { apiFetchAuth, formatAvatarUploadError, uploadAvatar } from "@/lib/api";
import { normalizeUsernameInput, validateUsername } from "@/lib/username";
import {
  avatarInitial,
  displayUsername,
  emailUsernameFallback,
  useAuthStore,
  type User,
} from "@/store/authStore";

const BELTS = [
  { value: "white", emoji: "⚪", label: "White" },
  { value: "yellow", emoji: "🟡", label: "Yellow" },
  { value: "orange", emoji: "🟠", label: "Orange" },
  { value: "green", emoji: "🟢", label: "Green" },
  { value: "blue", emoji: "🔵", label: "Blue" },
  { value: "brown", emoji: "🟤", label: "Brown" },
  { value: "black", emoji: "⚫", label: "Black" },
] as const;

function beltEntry(belt: string) {
  const normalized = belt?.toLowerCase() ?? "white";
  return BELTS.find((b) => b.value === normalized) ?? BELTS[0];
}

function memberYear(createdAt: string): string {
  const year = new Date(createdAt).getFullYear();
  return Number.isNaN(year) ? "—" : String(year);
}

type SettingsRowProps = {
  label: string;
  onPress: () => void;
  labelColor?: string;
};

function SettingsRow({ label, onPress, labelColor }: SettingsRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[styles.rowLabel, labelColor ? { color: labelColor } : null]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#84714F" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, updateBeltLevel, refreshUser, setUser } =
    useAuthStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [beltModalVisible, setBeltModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedBelt, setSelectedBelt] = useState("white");
  const [saving, setSaving] = useState(false);
  const [beltSaving, setBeltSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? emailUsernameFallback(user.email));
      setSelectedBelt(user.belt_level || "white");
    }
  }, [user?.id, user?.username, user?.email, user?.belt_level]);

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

  const openEditModal = () => {
    if (user) {
      setUsername(user.username ?? emailUsernameFallback(user.email));
    }
    setEditModalVisible(true);
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
      setEditModalVisible(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      Alert.alert("Profil", message);
    } finally {
      setSaving(false);
    }
  };

  const openBeltModal = () => {
    setSelectedBelt(user?.belt_level ?? "white");
    setBeltModalVisible(true);
  };

  const handleConfirmBelt = async () => {
    setBeltSaving(true);
    try {
      await updateBeltLevel(selectedBelt);
      setBeltModalVisible(false);
      Alert.alert("Belt Level", "Ceinture mise à jour.");
    } catch (err) {
      setBeltModalVisible(false);
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      Alert.alert(
        "Belt Level",
        `Impossible d'enregistrer la ceinture : ${message}`,
      );
    } finally {
      setBeltSaving(false);
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

  const showAvatarOptions = () => {
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
  };

  const initial = avatarInitial(user);
  const isPremium = user?.subscription_status === "active";
  const belt = user?.belt_level ?? "white";
  const studied = user?.techniques_studied ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>My Profile</Text>

        <Pressable
          style={styles.avatarPressable}
          onPress={showAvatarOptions}
          disabled={avatarLoading}
        >
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
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

        <Text style={styles.username}>{displayUsername(user)}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>{beltEntry(belt).emoji}</Text>
            <Text style={styles.statValue}>{beltEntry(belt).label}</Text>
            <Text style={styles.statLabel}>Belt level</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statValue}>
              {user?.created_at ? memberYear(user.created_at) : "—"}
            </Text>
            <Text style={styles.statLabel}>Member since</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📖</Text>
            <Text style={styles.statValue}>{studied}</Text>
            <Text style={styles.statLabel}>Studied</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>{isPremium ? "⭐" : "🔓"}</Text>
            <Text
              style={[
                styles.statValue,
                { color: isPremium ? "#2D6A4F" : "#84714F" },
              ]}
            >
              {isPremium ? "Premium" : "Free"}
            </Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Settings</Text>
        <SettingsRow label="Edit Profile" onPress={openEditModal} />
        <SettingsRow label="Belt Level" onPress={openBeltModal} />

        <Text style={styles.sectionLabel}>Account</Text>
        <SettingsRow
          label="Privacy Policy"
          onPress={() => Alert.alert("Privacy Policy", "Coming soon")}
        />
        <SettingsRow
          label="Sign out"
          onPress={handleSignOut}
          labelColor="#BF1A2F"
        />
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <Text style={styles.modalFieldLabel}>Username</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <View style={styles.modalActions}>
                    <Pressable
                      style={styles.modalCancel}
                      onPress={() => setEditModalVisible(false)}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.modalConfirm,
                        saving && styles.buttonDisabled,
                      ]}
                      onPress={handleSaveUsername}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.modalConfirmText}>Save</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={beltModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBeltModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Belt Level</Text>
            <ScrollView
              style={styles.beltList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {BELTS.map((b) => {
                const isSelected = selectedBelt === b.value;
                return (
                  <Pressable
                    key={b.value}
                    style={[
                      styles.beltOption,
                      isSelected && styles.beltOptionSelected,
                    ]}
                    onPress={() => setSelectedBelt(b.value)}
                  >
                    <Text
                      style={[
                        styles.beltOptionLabel,
                        isSelected && styles.beltOptionLabelSelected,
                      ]}
                    >
                      {`${b.emoji} ${b.label}`}
                    </Text>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#BF1A2F"
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setBeltModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalConfirm, beltSaving && styles.buttonDisabled]}
                onPress={handleConfirmBelt}
                disabled={beltSaving}
              >
                {beltSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: 80,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34344A",
    textAlign: "center",
    marginBottom: 24,
  },
  avatarPressable: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 12,
    position: "relative",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#34344A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34344A",
    textAlign: "center",
  },
  email: {
    fontSize: 13,
    color: "#84714F",
    textAlign: "center",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#34344A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#84714F",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#84714F",
    marginTop: 24,
    marginBottom: 8,
  },
  row: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 16,
    color: "#34344A",
    fontWeight: "500",
  },
  keyboardAvoid: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#34344A",
    marginBottom: 16,
    textAlign: "center",
  },
  modalFieldLabel: {
    fontSize: 13,
    color: "#84714F",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#34344A",
    marginBottom: 20,
  },
  beltList: {
    maxHeight: 280,
    marginBottom: 16,
  },
  beltOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: "transparent",
  },
  beltOptionSelected: {
    borderColor: "#BF1A2F",
    backgroundColor: "#FFF8F9",
  },
  beltOptionLabel: {
    fontSize: 16,
    color: "#34344A",
    fontWeight: "500",
  },
  beltOptionLabelSelected: {
    fontWeight: "700",
    color: "#BF1A2F",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  modalCancelText: {
    color: "#84714F",
    fontWeight: "600",
    fontSize: 16,
  },
  modalConfirm: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#BF1A2F",
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
