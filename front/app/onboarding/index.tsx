import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SerifText } from '@/components/SerifText';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { setOnboardingDone } from '@/lib/onboarding';

const LOGO = require('@/assets/images/Flip-logo.png');
const { width } = Dimensions.get('window');

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  emoji?: string;
};

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    title: 'Welcome to Flip 🥋',
    subtitle: 'Your judo companion',
    emoji: undefined,
  },
  {
    key: 'library',
    title: 'Explore techniques',
    subtitle: 'Rules, moral code, and a full techniques library at your fingertips.',
    emoji: '📚',
  },
  {
    key: 'journal',
    title: 'Track your progress',
    subtitle: 'Log sessions, build habits, and grow as a judoka.',
    emoji: '📓',
  },
];

export default function OnboardingScreen() {
  const listRef = useRef<FlatList<Slide>>(null);
  const [step, setStep] = useState(0);

  const finish = async () => {
    await setOnboardingDone();
    router.replace('/(tabs)/library');
  };

  const goNext = () => {
    if (step >= SLIDES.length - 1) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: step + 1, animated: true });
    setStep(step + 1);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setStep(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        style={styles.list}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width }]}>
            {index === 0 ? (
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            ) : (
              <Text style={styles.emoji}>{item.emoji}</Text>
            )}
            <SerifText style={styles.title}>{item.title}</SerifText>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, index) => (
            <View
              key={slide.key}
              style={[styles.dot, index === step && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable style={styles.button} onPress={goNext}>
          <Text style={styles.buttonText}>
            {step === SLIDES.length - 1 ? 'Get started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.cta,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
