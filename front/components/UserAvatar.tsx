import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { resolveAvatarUrl } from '@/lib/media';
import { avatarInitial, useAuthStore } from '@/store/authStore';

type UserAvatarProps = {
  size?: number;
  cacheKey?: string | number;
  loading?: boolean;
};

export function UserAvatar({ size = 40, cacheKey, loading }: UserAvatarProps) {
  const user = useAuthStore((s) => s.user);
  const initial = avatarInitial(user);
  const radius = size / 2;

  const rawUrl = resolveAvatarUrl(user?.avatar_url);
  const uri = rawUrl
    ? cacheKey != null
      ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}t=${cacheKey}`
      : rawUrl
    : null;

  return (
    <View style={[styles.wrapper, { width: size, height: size, borderRadius: radius }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: radius }}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: radius },
          ]}
        >
          <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
        </View>
      )}
      {loading ? (
        <View style={[styles.overlay, { borderRadius: radius }]}>
          <ActivityIndicator color="#FFFFFF" size="small" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: '#34344A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
