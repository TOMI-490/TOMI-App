import { StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../constants/theme';
import { F } from '../constants/fonts';

export function createLoginPageStyles(T: TomiThemeColors) {
  return StyleSheet.create({
    hero: {
      alignItems: 'center',
      marginBottom: 30,
      paddingTop: 4,
      paddingHorizontal: 6,
    },
    eyebrow: {
      fontSize: 11,
      fontFamily: F.bold,
      color: T.primary,
      letterSpacing: 2.4,
      marginBottom: 10,
    },
    title: {
      fontFamily: F.headline,
      fontSize: 44,
      color: T.textPrimary,
      letterSpacing: -1.6,
      marginBottom: 16,
      lineHeight: 48,
      textAlign: 'center',
    },
    accentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    accentDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: T.primary,
      opacity: 0.42,
      marginHorizontal: 6,
    },
    accentBar: {
      width: 52,
      height: 3,
      borderRadius: 2,
      backgroundColor: T.primary,
    },
    formBlock: {
      marginTop: 4,
      marginBottom: 4,
    },
    forgottenRow: {
      alignSelf: 'flex-end',
      marginTop: 2,
      marginBottom: 18,
    },
  });
}
