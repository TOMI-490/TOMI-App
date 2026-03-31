import { Platform, StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../../constants/theme';
import { F } from '../../constants/fonts';

export function createFormInputStyles(T: TomiThemeColors) {
  const inputFocusedShadow =
    Platform.OS === 'ios'
      ? {
          shadowColor: T.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.22,
          shadowRadius: 10,
        }
      : { elevation: 2 };

  return StyleSheet.create({
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 13,
      fontFamily: F.semiBold,
      color: T.textSecondary,
      marginBottom: 9,
      letterSpacing: 0.15,
    },
    labelFocused: {
      color: T.primary,
    },
    input: {
      height: 54,
      backgroundColor: T.cardBgAlt,
      borderWidth: 1,
      borderColor: T.borderLight,
      borderRadius: 18,
      paddingHorizontal: 18,
      fontSize: 16,
      fontFamily: F.regular,
      color: T.textPrimary,
    },
    inputFocused: {
      borderColor: T.primary,
      borderWidth: 1.5,
      backgroundColor: T.cardBg,
      ...inputFocusedShadow,
    },
    inputError: {
      borderColor: T.danger,
      borderWidth: 1.5,
    },
    errorText: {
      fontSize: 12,
      fontFamily: F.medium,
      color: T.danger,
      marginTop: 6,
    },
  });
}
