import { StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../constants/theme';
import { F } from '../constants/fonts';

export function createAuthStyles(T: TomiThemeColors) {
  return StyleSheet.create({
    formContainer: {
      marginBottom: 20,
    },
    footerDivider: {
      height: 1,
      width: '100%',
      backgroundColor: T.borderSubtle,
      marginTop: 12,
      marginBottom: 6,
      opacity: 0.75,
    },
    bottomSection: {
      alignItems: 'center',
      paddingTop: 22,
      paddingBottom: 4,
    },
    hintText: {
      fontSize: 14,
      fontFamily: F.medium,
      color: T.textMuted,
      marginBottom: 14,
      textAlign: 'center',
      lineHeight: 22,
    },
    headerSection: {
      marginBottom: 28,
      alignItems: 'flex-start',
    },
    title: {
      fontSize: 28,
      fontFamily: F.headlineMd,
      color: T.textPrimary,
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      fontFamily: F.regular,
      color: T.textMuted,
      lineHeight: 22,
    },
    linkText: {
      fontSize: 14,
      fontFamily: F.semiBold,
      color: T.primary,
      letterSpacing: 0.15,
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
  });
}
