import { StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../../constants/theme';
import { F } from '../../constants/fonts';

export function createPickerInputStyles(T: TomiThemeColors) {
  return StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 13,
      fontFamily: F.semiBold,
      color: T.textSecondary,
      marginBottom: 9,
      letterSpacing: 0.15,
    },
    pickerContainer: {
      height: 54,
      backgroundColor: T.cardBgAlt,
      borderWidth: 1,
      borderColor: T.borderLight,
      borderRadius: 18,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pickerError: {
      borderColor: T.danger,
    },
    selectedText: {
      fontSize: 16,
      fontFamily: F.regular,
      color: T.textPrimary,
      flex: 1,
    },
    arrow: {
      fontSize: 12,
      color: T.textMuted,
      marginLeft: 8,
    },
    errorText: {
      fontSize: 12,
      fontFamily: F.medium,
      color: T.danger,
      marginTop: 6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: T.cardBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '70%',
      shadowColor: T.primary,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: T.borderLight,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: F.headlineMd,
      color: T.textPrimary,
      letterSpacing: -0.3,
    },
    closeButton: {
      fontSize: 22,
      color: T.textMuted,
      fontFamily: F.medium,
    },
    optionItem: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: T.borderSubtle,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedOption: {
      backgroundColor: T.primaryTint,
    },
    optionText: {
      fontSize: 16,
      fontFamily: F.regular,
      color: T.textPrimary,
      flex: 1,
    },
    selectedOptionText: {
      fontFamily: F.bold,
      color: T.primary,
    },
    checkmark: {
      fontSize: 20,
      color: T.success,
      fontFamily: F.bold,
    },
  });
}
