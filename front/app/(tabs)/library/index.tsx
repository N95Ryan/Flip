import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { LibraryRoutes } from '@/constants/libraryRoutes';
import { displayUsername, useAuthStore } from '@/store/authStore';

type LibraryCard = {
  emoji: string;
  borderColor: string;
  title: string;
  subtitle: string;
  description: string;
  route:
    | typeof LibraryRoutes.rules
    | typeof LibraryRoutes.moralCode
    | typeof LibraryRoutes.techniques;
};

const LIBRARY_CARDS: LibraryCard[] = [
  {
    emoji: '📋',
    borderColor: '#BF1A2F',
    title: 'Rules',
    subtitle: 'How judo works',
    description: 'Ukemi · Scoring · Combats',
    route: LibraryRoutes.rules,
  },
  {
    emoji: '🎌',
    borderColor: '#2D6A4F',
    title: 'Moral Code',
    subtitle: 'The values of judo',
    description: '7 core principles of the judoka',
    route: LibraryRoutes.moralCode,
  },
  {
    emoji: '🥋',
    borderColor: '#2563EB',
    title: 'Techniques',
    subtitle: 'Judo techniques library',
    description: 'Throws · Ground work · Strikes',
    route: LibraryRoutes.techniques,
  },
];

export default function LibraryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.welcomeBack}>Welcome back,</Text>
        <Text style={styles.welcomeName}>
          {displayUsername(user)} 👋
        </Text>
        <Text style={styles.date}>{today}</Text>
        <View style={styles.separator} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>What do you want to study?</Text>

        {LIBRARY_CARDS.map((card) => (
          <Pressable
            key={card.route}
            style={({ pressed }) => [
              styles.card,
              { borderLeftColor: card.borderColor },
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push(card.route)}
          >
            <Text style={styles.emoji}>{card.emoji}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
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
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  welcomeBack: {
    fontSize: 14,
    color: '#84714F',
  },
  welcomeName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#34344A',
    marginTop: 2,
  },
  date: {
    fontSize: 13,
    color: '#84714F',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E8E0D0',
    marginTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 120,
    flexGrow: 1,
    gap: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#84714F',
    marginBottom: 12,
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
  },
});
