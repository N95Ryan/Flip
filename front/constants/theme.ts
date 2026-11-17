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
    iconInactiveOpacity: 0.45,
    height: 56,
    labelFontSize: 10,
    labelLetterSpacing: 0.3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;