import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

const LOGO = require('@/assets/images/Flip-logo.png');

const useNativeDriver = Platform.OS !== 'web';

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.01)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver,
      }),
      Animated.spring(opacity, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver,
      }),
    ]).start();
  }, [scale, opacity]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Animated.Image
        source={LOGO}
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
