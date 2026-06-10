import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Theme } from "@/constants/theme";

type BackButtonProps = {
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function BackButton({
  onPress,
  accessibilityLabel = "Retour",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={onPress ?? (() => router.back())}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="chevron-back" size={24} color="#34344A" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 40,
  },
  iconWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.borderRadius.card,
    padding: 8,
    elevation: 2,
    shadowColor: "#34344A",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
});
