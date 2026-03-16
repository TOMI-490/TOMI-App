import { StyleSheet } from 'react-native';
import { TOMI_THEME as T } from '../constants/theme';
import { F } from '../constants/fonts';

const shadowSm = {
  shadowColor:   '#8891A5',
  shadowOffset:  { width: 0, height: 3 },
  shadowOpacity: 0.22,
  shadowRadius:  10,
  elevation:     5,
} as const;

const shadowMd = {
  shadowColor:   '#8891A5',
  shadowOffset:  { width: 0, height: 6 },
  shadowOpacity: 0.28,
  shadowRadius:  16,
  elevation:     8,
} as const;

const card = {
  backgroundColor: T.cardBg,
  borderRadius:    20,
} as const;

export const friendProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEAE3',
  },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 56,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 44,
    minWidth: 44,
  },
  backButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: T.secondary,
  },
  headerTitle: {
    fontFamily: F.headlineMd,
    fontSize: 18,
    color: T.textPrimary,
    letterSpacing: -0.3,
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  removeButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: T.danger,
  },

  // ─── Scroll ───
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 108,
  },

  // ─── Buddy Card ───
  buddyCard: {
    ...card,
    borderRadius: 24,
    padding: 0,
    marginBottom: 18,
    overflow: 'hidden',
    position: 'relative',
    ...shadowMd,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.055)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
  },
  progressFill: {
    height: '100%',
    borderTopLeftRadius: 24,
  },
  buddyAvatar: {
    width: 160,
    height: 160,
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  buddyIdentity: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  buddyName: {
    fontFamily: F.headline,
    fontSize: 26,
    color: T.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  buddySubtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: T.textMuted,
    marginBottom: 6,
  },
  buddyLevel: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: T.secondary,
    marginBottom: 4,
  },
  buddyXpText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 13,
    color: T.textMuted,
  },

  // ─── Streak Badge ───
  streakBadge: {
    backgroundColor: T.warningTint,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(244,166,35,0.28)',
  },
  streakIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  streakText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: T.warning,
  },

  // ─── This Week ───
  thisWeekSection: {
    borderTopWidth: 1,
    borderTopColor: T.borderLight,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  thisWeekTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 10,
    color: T.textMuted,
    textTransform: 'uppercase',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 1,
  },
  thisWeekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  thisWeekStat: {
    flex: 1,
    alignItems: 'center',
  },
  thisWeekValue: {
    fontFamily: 'Montserrat-Black',
    fontSize: 26,
    color: T.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.8,
  },
  thisWeekLabel: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 10,
    color: T.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // ─── Section Container ───
  section: {
    ...card,
    padding: 18,
    marginBottom: 16,
    ...shadowSm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontFamily: F.headlineMd,
    fontSize: 17,
    color: T.textPrimary,
    letterSpacing: -0.3,
  },
  sectionHeaderAction: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    color: T.primary,
  },

  // ─── Workout Cards ───
  workoutsList: {
    gap: 10,
  },
  workoutCard: {
    backgroundColor: T.cardBgAlt,
    borderRadius: 14,
    padding: 14,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutType: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: T.textPrimary,
  },
  workoutDate: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: T.textMuted,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutStat: {
    flex: 1,
  },
  workoutStatLabel: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 10,
    color: T.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  workoutStatValue: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 15,
    color: T.textPrimary,
  },
  emptyWorkouts: {
    padding: 32,
    alignItems: 'center',
  },
  emptyWorkoutsText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: T.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ─── Loading / Error ───
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEAE3',
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
    backgroundColor: '#EDEAE3',
  },
  errorText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: T.danger,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: T.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    ...shadowSm,
  },
  retryButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Legacy styles kept for compatibility
  profileHeader: { alignItems: 'center', marginBottom: 16 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: T.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarInitials: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  displayName: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: T.textPrimary, marginBottom: 4 },
  levelText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: T.textMuted },
  bioSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.borderLight },
  sectionLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: T.textMuted, marginBottom: 4 },
  bioText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: T.textSecondary, lineHeight: 20 },
  sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: T.textPrimary, marginBottom: 12 },
  previewRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  previewColumn: { flex: 1, ...card, padding: 12 },
  previewColumnTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: T.textPrimary, marginBottom: 8 },
  previewBox: { backgroundColor: T.cardBgAlt, borderRadius: 8, height: 140, justifyContent: 'center', alignItems: 'center' },
  previewBoxTall: { backgroundColor: T.cardBgAlt, borderRadius: 8, height: 200, justifyContent: 'center', alignItems: 'center' },
  avatarPreviewCard: { backgroundColor: T.cardBgAlt, borderRadius: 8, height: 200, justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: '100%', borderRadius: 8 },
  placeholderAvatarIcon: { marginBottom: 8 },
  placeholderHomeIcon: { marginBottom: 8 },
  placeholderText: { fontSize: 48 },
  placeholderLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: T.textMuted, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  statCard: { flex: 1, backgroundColor: T.cardBgAlt, borderRadius: 14, padding: 16, alignItems: 'center' },
  statValue: { fontFamily: 'Montserrat-Black', fontSize: 24, color: T.textPrimary, marginBottom: 4, letterSpacing: -0.5 },
  statLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 10, color: T.textMuted, textAlign: 'center', letterSpacing: 0.4 },
  overallStats: { gap: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  statRowLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: T.textMuted },
  statRowValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: T.textPrimary },
});
