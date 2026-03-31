/**
 * Shared decorative shell for Login & Register — TOMI brand warmth.
 */
import { StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../constants/theme';
import { F } from '../constants/fonts';

export function createAuthScreenShellStyles(T: TomiThemeColors) {
  return StyleSheet.create({
    pageWrap: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    cardStack: {
      width: '100%',
      position: 'relative',
    },
    floatOrb1: {
      position: 'absolute',
      top: -28,
      right: -24,
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: T.primaryTint,
      zIndex: 0,
      opacity: 0.55,
    },
    floatOrb2: {
      position: 'absolute',
      top: 72,
      left: -24,
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: T.secondaryTint,
      zIndex: 0,
      opacity: 0.5,
    },
    floatOrb3: {
      position: 'absolute',
      bottom: 140,
      right: -12,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: T.warningTint,
      zIndex: 0,
      opacity: 0.45,
    },
    cardElevated: {
      zIndex: 1,
    },
    hero: {
      alignItems: 'center',
      marginBottom: 26,
      paddingTop: 4,
    },
    heroLogin: {
      alignItems: 'center',
      marginBottom: 24,
      paddingTop: 2,
    },
    heroCompact: {
      alignItems: 'center',
      marginBottom: 26,
      paddingTop: 4,
      paddingHorizontal: 4,
    },
    companionPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: T.successTint,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 100,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: T.borderLight,
      shadowColor: T.success,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    companionPillText: {
      fontFamily: F.semiBold,
      fontSize: 12,
      color: T.success,
      letterSpacing: 0.3,
    },
    titleLogin: {
      fontFamily: F.headline,
      fontSize: 34,
      color: T.textPrimary,
      letterSpacing: -1.1,
      marginBottom: 8,
    },
    titleRegister: {
      fontFamily: F.headlineMd,
      fontSize: 28,
      color: T.textPrimary,
      letterSpacing: -0.7,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: F.medium,
      fontSize: 15,
      color: T.textMuted,
      textAlign: 'center',
      lineHeight: 23,
      paddingHorizontal: 12,
      maxWidth: 320,
    },
    accentBar: {
      width: 56,
      height: 3,
      borderRadius: 2,
      backgroundColor: T.primary,
      marginTop: 16,
      opacity: 0.95,
    },
    forgottenRow: {
      alignSelf: 'flex-end',
      marginTop: -4,
      marginBottom: 12,
    },
    formBlock: {
      marginBottom: 6,
    },
  });
}
