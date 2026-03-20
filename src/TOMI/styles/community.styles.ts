import { StyleSheet } from 'react-native';
import type { TomiThemeColors } from '../constants/theme';
import { F } from '../constants/fonts';

export function createCommunityStyles(T: TomiThemeColors) {
  const shadowXs = {
    shadowColor:   T.textMuted,
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius:  6,
    elevation:     3,
  } as const;

  const shadowSm = {
    shadowColor:   T.textMuted,
    shadowOffset:  { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius:  10,
    elevation:     5,
  } as const;

  const shadowMd = {
    shadowColor:   T.textMuted,
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius:  16,
    elevation:     8,
  } as const;

  const card = {
    backgroundColor: T.cardBg,
    borderRadius:    20,
  } as const;

  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.background,
  },

  // ─── Header ───
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: T.secondaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: F.headline,
    fontSize: 28,
    color: T.textPrimary,
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 13,
    color: T.textMuted,
    marginTop: 2,
  },

  // ─── Tab Control ───
  tabContainer: {
    paddingBottom: 6,
  },
  tabControl: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 6,
    gap: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 22,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: T.secondary,
    borderWidth: 2,
    borderColor: T.primary,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 15,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  tabButtonTextInactive: {
    color: T.textMuted,
  },

  // ─── Content Scroll ───
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 108,
  },

  // ─── Add New Friend ───
  addNewFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    ...card,
    borderRadius: 16,
    marginBottom: 20,
    gap: 8,
    ...shadowXs,
  },
  addNewFriendButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: T.primary,
  },

  // ─── Your Squad ───
  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: T.primary,
  },
  requestSubheading: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    color: T.textMuted,
    marginBottom: 8,
    marginTop: 4,
  },

  squadSection: {
    marginBottom: 20,
  },
  squadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  squadTitle: {
    fontFamily: F.headlineMd,
    fontSize: 20,
    color: T.textPrimary,
    letterSpacing: -0.3,
  },

  // ─── Squad Cards ───
  squadCard: {
    ...card,
    padding: 16,
    marginBottom: 12,
    ...shadowSm,
  },
  squadCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  squadCardContent: {
    flex: 1,
  },
  squadCardMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 14,
  },
  squadCardMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  squadCardMetricText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    color: T.textMuted,
  },
  squadCardMetricLevel: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    color: T.primary,
  },
  squadCardMetricBadge: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    color: T.danger,
  },
  squadCardProgress: {
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.055)',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  squadCardProgressFill: {
    height: '100%',
    backgroundColor: T.primary,
    borderRadius: 3,
  },
  squadCardXpText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: T.textMuted,
    marginTop: 5,
  },
  squadCardRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.cardBgAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.borderLight,
    marginLeft: 10,
  },
  squadCardRankCrown: {
    backgroundColor: T.warningTint,
    borderColor: T.warning,
  },

  // ─── Friend Name ───
  friendName: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 17,
    color: T.textPrimary,
    letterSpacing: -0.2,
  },

  // ─── Find More Friends ───
  findMoreFriendsCard: {
    ...card,
    borderRadius: 24,
    padding: 28,
    marginBottom: 16,
    alignItems: 'center',
    ...shadowMd,
  },
  findMoreFriendsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  findMoreFriendsTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: T.textPrimary,
    marginBottom: 6,
  },
  findMoreFriendsSubtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: T.textMuted,
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 20,
  },
  browseUsersButton: {
    backgroundColor: T.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    ...shadowSm,
    shadowColor: T.primary,
    shadowOpacity: 0.32,
  },
  browseUsersButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },

  // ─── Leaderboard Header ───
  leaderboardWeeklyCard: {
    ...card,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 8,
    alignItems: 'center',
    ...shadowMd,
  },
  leaderboardTrophyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: T.warningTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(244,166,35,0.28)',
  },
  leaderboardWeeklyTitle: {
    fontFamily: F.headline,
    fontSize: 24,
    color: T.textPrimary,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  leaderboardWeeklySubtitle: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 13,
    color: T.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  // ─── Podium ───
  leaderboardTop3: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  leaderboardPodiumCard: {
    ...card,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  leaderboardPodiumFirst: {
    backgroundColor: T.primaryTint,
    borderWidth: 2,
    borderColor: T.secondary,
    marginBottom: 14,
    paddingVertical: 18,
    ...shadowMd,
  },
  leaderboardPodiumSecond: {
    backgroundColor: T.cardBg,
    ...shadowSm,
  },
  leaderboardPodiumThird: {
    backgroundColor: T.cardBg,
    ...shadowSm,
  },

  // ─── Divider ───
  leaderboardDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  leaderboardDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: T.borderLight,
  },
  leaderboardDividerText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 11,
    color: T.textLight,
    marginHorizontal: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  podiumAvatarWrap: {
    position: 'relative',
  },
  podiumFirstAvatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: T.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  podiumBadgeGold: {
    backgroundColor: T.primary,
  },
  podiumBadgeSilver: {
    backgroundColor: T.textMuted,
  },
  podiumBadgeBronze: {
    backgroundColor: T.warning,
  },
  podiumName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    color: T.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  podiumXp: {
    fontFamily: 'Montserrat-Black',
    fontSize: 18,
    color: T.textPrimary,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  podiumXpFirst: {
    fontFamily: 'Montserrat-Black',
    fontSize: 20,
    color: T.primary,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  podiumXpLabel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: T.textMuted,
  },

  // ─── Leaderboard Rows ───
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingVertical: 12,
    ...card,
    borderRadius: 18,
    marginBottom: 10,
    ...shadowSm,
  },
  leaderboardRowCurrent: {
    backgroundColor: T.primaryTint,
    borderWidth: 1.5,
    borderColor: T.primaryTintMed,
  },
  leaderboardRankText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 15,
    color: T.textMuted,
    minWidth: 24,
    textAlign: 'center',
    marginRight: 12,
  },
  leaderboardYouAvatar: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: T.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 15,
    color: T.textPrimary,
  },
  leaderboardLevel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: T.textMuted,
    marginTop: 2,
  },
  leaderboardXp: {
    fontFamily: 'Montserrat-Black',
    fontSize: 16,
    color: T.textPrimary,
    letterSpacing: -0.3,
  },
  leaderboardXpColumn: {
    alignItems: 'flex-end',
  },
  leaderboardXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardXpLabel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 11,
    color: T.textMuted,
    textAlign: 'right',
    marginTop: 1,
  },
  leaderboardYouPill: {
    backgroundColor: T.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 5,
  },
  leaderboardYouPillText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 11,
    color: T.primary,
  },

  // ─── Search ───
  searchCard: {
    ...card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    ...shadowXs,
  },
  searchLabel: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    color: T.textMuted,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: T.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: 'Montserrat-Regular',
    fontSize: 15,
    color: T.textPrimary,
    borderWidth: 1,
    borderColor: T.borderLight,
  },
  searchResults: {
    marginTop: 10,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: T.cardBgAlt,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 15,
    color: T.textPrimary,
  },
  searchResultLevel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: T.textMuted,
    marginTop: 2,
  },
  searchResultAction: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  searchResultActionPrimary: {
    backgroundColor: T.secondary,
  },
  searchResultActionSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: T.borderLight,
  },
  searchResultActionDisabled: {
    backgroundColor: T.background,
  },
  searchResultActionText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
  },
  searchResultActionTextPrimary: {
    color: '#FFFFFF',
  },
  searchResultActionTextSecondary: {
    color: T.textMuted,
  },

  // ─── Friend Requests ───
  requestsSection: {
    ...card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...shadowXs,
  },
  requestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestsTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: T.textPrimary,
  },
  requestsCount: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: T.secondary,
  },
  requestsList: {},
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: T.cardBgAlt,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 15,
    color: T.textPrimary,
  },
  requestLevel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: T.textMuted,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 6,
  },
  requestButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  requestButtonPrimary: {
    backgroundColor: T.success,
  },
  requestButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: T.danger,
  },
  requestButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
  },
  requestButtonTextPrimary: {
    color: '#FFFFFF',
  },
  requestButtonTextSecondary: {
    color: T.danger,
  },

  // ─── Leaderboard Filters ───
  leaderboardFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: T.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.borderLight,
  },
  filterButtonActive: {
    backgroundColor: T.secondary,
    borderColor: T.secondary,
  },
  filterButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    color: T.textMuted,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },

  // ─── Empty / Loading / Error ───
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 15,
    color: T.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: T.background,
  },
  loadingText: {
    fontFamily: 'Montserrat-Medium',
    marginTop: 16,
    fontSize: 16,
    color: T.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: T.background,
  },
  errorText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: T.danger,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  errorRetryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: T.primary,
    borderRadius: 14,
    ...shadowSm,
  },
  errorRetryButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  });
}
