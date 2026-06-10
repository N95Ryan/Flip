export const Theme = {
  borderRadius: {
    card: 2,
    input: 2,
    cta: 4,
  },
  fontFamily: {
    serif: 'NotoSerifJP-Light',
  },
  kanji: {
    fontSize: 48,
    color: 'rgba(52,52,74,0.06)',
  },
  accentBar: {
    width: 3,
    height: 28,
    borderRadius: 1,
  },
  navbar: {
    backgroundColor: '#34344A',
    iconColor: '#F7F2E9',
    iconActiveOpacity: 1,
    iconInactiveOpacity: 0.35,
    labelFontSize: 9,
    labelLetterSpacing: 1.5,
    activeBackground: 'rgba(247,242,233,0.12)',
    activeBorderRadius: 20,
    activePaddingHorizontal: 14,
    activePaddingVertical: 6,
  },
} as const;
