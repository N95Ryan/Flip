import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import type { TechniqueCategory } from '@/types/technique';

type CategoryCard = {
  id: TechniqueCategory;
  emoji: string;
  borderColor: string;
  countColor: string;
  title: string;
  subtitle: string;
  description: string;
  count: string;
};

const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'nage-waza',
    emoji: '🥋',
    borderColor: '#BF1A2F',
    countColor: '#BF1A2F',
    title: 'Nage-waza',
    subtitle: 'Throwing techniques',
    description: 'Arm throws · Hip throws · Leg sweeps · Sacrifice throws',
    count: '6 techniques',
  },
  {
    id: 'katame-waza',
    emoji: '🤼',
    borderColor: '#2D6A4F',
    countColor: '#2D6A4F',
    title: 'Katame-waza',
    subtitle: 'Ground techniques',
    description: 'Pins · Chokes · Armlocks',
    count: '4 techniques',
  },
  {
    id: 'atemi-waza',
    emoji: '👊',
    borderColor: '#2563EB',
    countColor: '#2563EB',
    title: 'Atemi-waza',
    subtitle: 'Striking techniques',
    description: 'Arm strikes · Kicks',
    count: '2 techniques',
  },
];

export default function LibraryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcome}>
          <Text style={styles.welcomeBack}>Welcome back,</Text>
          <Text style={styles.welcomeName}>
            {user?.email.split('@')[0]} 👋
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.sectionSubtitle}>What do you want to study?</Text>
        </View>

        {CATEGORY_CARDS.map((card) => (
          <Pressable
            key={card.id}
            style={({ pressed }) => [
              styles.card,
              { borderLeftColor: card.borderColor },
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push(`/library/${card.id}`)}
          >
            <Text style={styles.emoji}>{card.emoji}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
            <Text style={[styles.cardCount, { color: card.countColor }]}>{card.count}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: 80,
  },
  welcome: {
    marginBottom: 0,
  },
  welcomeBack: {
    fontSize: 14,
    color: '#84714F',
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34344A',
    marginBottom: 24,
  },
  header: {
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#84714F',
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: Colors.textPrimary,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cardPressed: {
    opacity: 0.92,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  cardCount: {
    fontSize: 13,
    fontWeight: '600',
  },
});
