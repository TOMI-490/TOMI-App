import { StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../../constants/theme';

export function createAuthContainerStyles(T: TomiThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: T.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 22,
    },
  });
}
