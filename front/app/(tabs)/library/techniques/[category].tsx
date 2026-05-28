import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/BackButton";
import { LibraryRoutes } from "@/constants/libraryRoutes";
import type { TechniqueCategory } from "@/types/technique";

type SubcategoryItem = {
  value: string;
  label: string;
  translation: string;
  color: string;
};

const SUBCATEGORIES: Record<TechniqueCategory, SubcategoryItem[]> = {
  "nage-waza": [
    {
      value: "te-waza",
      label: "Te-waza",
      translation: "Arm throws",
      color: "#BF1A2F",
    },
    {
      value: "koshi-waza",
      label: "Koshi-waza",
      translation: "Hip throws",
      color: "#BF1A2F",
    },
    {
      value: "ashi-waza",
      label: "Ashi-waza",
      translation: "Leg sweeps",
      color: "#BF1A2F",
    },
    {
      value: "ma-sutemi-waza",
      label: "Ma-sutemi-waza",
      translation: "Sacrifice throws",
      color: "#BF1A2F",
    },
  ],
  "katame-waza": [
    {
      value: "osaekomi-waza",
      label: "Osaekomi-waza",
      translation: "Pins",
      color: "#2D6A4F",
    },
    {
      value: "shime-waza",
      label: "Shime-waza",
      translation: "Chokes",
      color: "#2D6A4F",
    },
    {
      value: "kansetsu-waza",
      label: "Kansetsu-waza",
      translation: "Armlocks",
      color: "#2D6A4F",
    },
  ],
  "atemi-waza": [
    {
      value: "ude-ate",
      label: "Ude-ate",
      translation: "Arm strikes",
      color: "#2563EB",
    },
    {
      value: "keri-waza",
      label: "Keri-waza",
      translation: "Kicks",
      color: "#2563EB",
    },
  ],
};

function formatCategoryLabel(category: string): string {
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

export default function SubcategoriesScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const categoryKey = category as TechniqueCategory;
  const subcategories = SUBCATEGORIES[categoryKey] ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>{formatCategoryLabel(category ?? "")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {subcategories.map((sub) => (
          <Pressable
            key={sub.value}
            style={({ pressed }) => [
              styles.card,
              { borderLeftColor: sub.color },
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              router.push(
                LibraryRoutes.techniqueSubcategory(category ?? '', sub.value),
              )
            }
          >
            <Text style={styles.label}>{sub.label}</Text>
            <Text style={styles.translation}>{sub.translation}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F2E9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    gap: 12,
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#34344A",
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingTop: 24,
    paddingBottom: 120,
    paddingHorizontal: 20,
    gap: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#34344A",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cardPressed: {
    opacity: 0.92,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#34344A",
    marginBottom: 4,
  },
  translation: {
    fontSize: 14,
    color: "#84714F",
  },
});
