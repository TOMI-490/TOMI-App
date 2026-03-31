import { StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../../constants/theme';

export function createAuthCardStyles(T: TomiThemeColors) {
  return StyleSheet.create({
    cardOuter: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: T.cardBg,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: T.borderLight,
      shadowColor: T.textPrimary,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.11,
      shadowRadius: 38,
      elevation: 12,
      overflow: 'hidden',
    },
    cardInner: {
      paddingVertical: 34,
      paddingHorizontal: 28,
    },
  });
}
