import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';

type MoralValue = {
  title: string;
  description: string;
};

const MORAL_VALUES: MoralValue[] = [
  {
    title: 'Yūki / Courage',
    description:
      'Act rightly even when it is difficult. On the mat, attack with commitment. In life, face challenges without running away.',
  },
  {
    title: 'Keikō / Respect',
    description:
      'Honor your opponent, your sensei, and the dojo. Bow at the start and end of every match — you are grateful for the challenge.',
  },
  {
    title: 'Rei / Courtesy',
    description:
      'Express respect through action. The rei (bow) is not a formality — it is the physical manifestation of your regard for others.',
  },
  {
    title: 'Seijitsu / Honesty',
    description:
      'Be truthful with yourself about your level, your mistakes, and your progress. Self-deception is the enemy of growth.',
  },
  {
    title: 'Meiyo / Honor',
    description:
      'Your reputation is built over years and lost in moments. Win with dignity. Lose with grace.',
  },
  {
    title: 'Kenson / Modesty',
    description:
      'A full cup cannot receive more water. Stay humble so you can keep learning. The best judoka are never arrogant.',
  },
  {
    title: 'Jita Kyōei / Mutual welfare and benefit',
    description:
      'Judo\'s highest principle. Your progress and your partner\'s progress are linked. Help others improve — you will improve too.',
  },
];

const BORDER_COLOR = '#2D6A4F';

export default function MoralCodeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Moral Code</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          The moral code of judo was established by Jigoro Kano. These 7 values
          guide the judoka on and off the mat.
        </Text>

        {MORAL_VALUES.map((value) => (
          <View
            key={value.title}
            style={[styles.valueCard, { borderLeftColor: BORDER_COLOR }]}
          >
            <Text style={styles.valueTitle}>{value.title}</Text>
            <Text style={styles.valueDescription}>{value.description}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2E9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#34344A',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  intro: {
    fontSize: 14,
    color: '#84714F',
    marginBottom: 16,
    lineHeight: 22,
  },
  valueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  valueTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#34344A',
  },
  valueDescription: {
    fontSize: 14,
    color: '#84714F',
    marginTop: 6,
    lineHeight: 22,
  },
});
