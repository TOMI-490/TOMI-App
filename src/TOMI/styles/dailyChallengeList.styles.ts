import { StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../constants/theme';

export function createDailyChallengeListStyles(T: TomiThemeColors) {
  const shadowSm = {
    shadowColor: T.textMuted,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  } as const;

  const shadowXs = {
    shadowColor: T.textMuted,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  } as const;

  return StyleSheet.create({
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitleAccent: {
      width: 4,
      height: 18,
      borderRadius: 2,
      backgroundColor: T.primary,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Montserrat-Bold',
      color: T.textPrimary,
    },
    viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
    viewAllText: {
      fontSize: 12,
      fontFamily: 'Montserrat-SemiBold',
      color: T.primary,
    },
    inlineErrorPill: {
      backgroundColor: T.glassBgSubtle,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: T.borderSubtle,
      marginBottom: 8,
    },
    inlineErrorText: {
      fontSize: 12,
      fontFamily: 'Montserrat-Regular',
      color: T.textMuted,
      textAlign: 'center',
    },
    questCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: T.cardBg,
      borderRadius: 18,
      padding: 14,
      ...shadowSm,
      marginBottom: 10,
      overflow: 'hidden',
    },
    questIconBox: {
      width: 42,
      height: 42,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
    },
    questContent: { flex: 1, minWidth: 0 },
    questTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3,
    },
    questTitle: {
      fontSize: 14,
      fontFamily: 'Montserrat-Bold',
      color: T.textPrimary,
      flex: 1,
      marginRight: 8,
    },
    questSubtitle: {
      fontSize: 11,
      fontFamily: 'Montserrat-Regular',
      color: T.textMuted,
      marginBottom: 6,
      lineHeight: 15,
    },
    questXpChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: T.warningTint,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(244,166,35,0.28)',
    },
    questXpText: {
      fontSize: 10,
      fontFamily: 'Montserrat-Black',
      color: T.warning,
    },
    questProgressText: {
      fontSize: 11,
      fontFamily: 'Montserrat-Regular',
      color: T.textMuted,
      marginBottom: 7,
    },
    questBarTrack: {
      height: 7,
      backgroundColor: 'rgba(0,0,0,0.055)',
      borderRadius: 3.5,
      overflow: 'hidden',
    },
    questBarFill: {
      height: '100%',
      borderRadius: 3.5,
    },
    challengeStartBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: T.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    challengeStartBtnText: {
      fontSize: 12,
      fontFamily: 'Montserrat-Bold',
      color: '#FFF',
    },
    challengeStartBtnDisabled: {
      opacity: 0.45,
    },
    skeletonCard: {
      backgroundColor: T.glassBgSubtle,
      borderWidth: 1,
      borderColor: T.borderSubtle,
      borderRadius: 18,
      padding: 18,
      marginBottom: 10,
      ...shadowXs,
      overflow: 'hidden',
    },
    skeletonLine: {
      backgroundColor: T.borderSubtle,
      borderRadius: 6,
      marginBottom: 8,
    },
  });
}
