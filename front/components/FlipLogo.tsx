import { Platform, Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const LOGO_PNG = require('@/assets/images/Flip-logo.png');

type FlipLogoProps = {
  width?: number;
  height?: number;
};

function FlipLogoSvg({ width = 200, height = 200 }: FlipLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 200" fill="none">
      <Circle cx="100" cy="100" r="88" fill="#BF1A2F" />
      <Circle cx="100" cy="100" r="72" fill="#F7F2E9" />
      <Path
        fill="#34344A"
        d="M62 118V82h52c8 0 14 6 14 14v8c0 8-6 14-14 14H82v-14h28c2 0 3-1 3-3v-4c0-2-1-3-3-3H82v28H62z"
      />
      <Path fill="#BF1A2F" d="M118 82h20v36h-20V82z" />
    </Svg>
  );
}

export function FlipLogo({ width = 200, height = 200 }: FlipLogoProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webWrap, { width, height }]}>
        <Image source={LOGO_PNG} style={{ width, height }} resizeMode="contain" />
      </View>
    );
  }

  return <FlipLogoSvg width={width} height={height} />;
}

const styles = StyleSheet.create({
  webWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
