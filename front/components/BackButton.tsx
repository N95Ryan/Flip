import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/colors";

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
          <AntDesign name="arrowleft" size={24} color={Colors.textPrimary} />
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 8,
    elevation: 2,
    shadowColor: Colors.textPrimary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
});
