import { StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../../constants/theme';
import { F } from '../../constants/fonts';

export function createSecondaryButtonStyles(T: TomiThemeColors) {
  return StyleSheet.create({
    button: {
      width: '100%',
      height: 54,
      backgroundColor: T.primaryTint,
      borderWidth: 1.5,
      borderColor: T.primary,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 16,
      fontFamily: F.bold,
      color: T.primary,
      letterSpacing: 0.2,
    },
  });
}
