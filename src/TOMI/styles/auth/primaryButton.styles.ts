import { StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../../constants/theme';
import { F } from '../../constants/fonts';

export function createPrimaryButtonStyles(T: TomiThemeColors) {
  return StyleSheet.create({
    button: {
      height: 54,
      backgroundColor: T.primary,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      shadowColor: T.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
      elevation: 8,
    },
    disabled: {
      opacity: 0.55,
    },
    text: {
      fontSize: 16,
      fontFamily: F.bold,
      color: '#FFFFFF',
      letterSpacing: 0.2,
    },
  });
}
