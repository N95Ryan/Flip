import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { FlipLogo } from '@/components/FlipLogo';

const useNativeDriver = Platform.OS !== 'web';

type AuthLaunchScreenProps = {
  sessionReady: boolean;
  onFinish: () => void;
};

export function AuthLaunchScreen({ sessionReady, onFinish }: AuthLaunchScreenProps) {
  const scale = useRef(new Animated.Value(0.01)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const popStarted = useRef(false);

  useEffect(() => {
    if (!sessionReady || popStarted.current) return;
    popStarted.current = true;

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver,
      }),
      Animated.spring(logoOpacity, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setTimeout(() => {
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver,
        }).start(({ finished: fadeDone }) => {
          if (fadeDone) onFinish();
        });
      }, 400);
    });
  }, [sessionReady, scale, logoOpacity, overlayOpacity, onFinish]);

  return (
    <Animated.View
      style={[styles.overlay, { opacity: overlayOpacity }]}
      pointerEvents="auto"
    >
      <View style={styles.center}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale }] }}>
          <FlipLogo width={200} height={200} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F7F2E9',
    zIndex: 999,
    elevation: 999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
