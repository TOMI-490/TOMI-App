import { StyleSheet, Platform } from 'react-native';
import type { TomiThemeColors } from '../../constants/theme';
import { F } from '../../constants/fonts';

export function createWorkoutSummaryStyles(T: TomiThemeColors) {
  const shadowSm = {
    shadowColor: T.textMuted, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14, shadowRadius: 8, elevation: 4,
  } as const;

  const shadowMd = {
    shadowColor: T.textMuted, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.20, shadowRadius: 14, elevation: 6,
  } as const;

  const card = { backgroundColor: T.cardBg, borderRadius: 22, ...shadowSm } as const;

  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.background },
  scroll: { paddingBottom: 40 },

  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.background,
  },
  loadingText: { marginTop: 10, fontSize: 14, fontFamily: F.medium, color: T.textMuted },
  errorContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: T.background,
  },
  errorText: { fontSize: 15, fontFamily: F.medium, color: T.danger, textAlign: 'center', marginBottom: 16 },
  retryButton: {
    paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: T.primary, borderRadius: 16,
  },
  retryButtonText: { color: '#FFF', fontFamily: F.bold, fontSize: 15 },

  /* ── Success Header ──────────────────────────────── */
  headerContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 28,
  },
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: T.success, justifyContent: 'center', alignItems: 'center',
    marginBottom: 18,
    ...shadowMd, shadowColor: T.success, shadowOpacity: 0.35,
  },
  headerTitle: { fontSize: 30, fontFamily: F.headline, color: T.textPrimary, letterSpacing: -1 },
  headerSubtitle: { fontSize: 16, fontFamily: F.medium, color: T.textMuted, marginTop: 4 },

  /* ── Primary stats row ───────────────────────────── */
  primaryRow: {
    flexDirection: 'row', justifyContent: 'space-evenly',
    ...card, marginHorizontal: 18, paddingVertical: 22, marginBottom: 18,
    ...shadowMd,
  },
  primaryStat: { alignItems: 'center', flex: 1 },
  primaryStatLabel: {
    fontSize: 11, fontFamily: F.semiBold, color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4,
  },
  primaryStatValue: { fontSize: 26, fontFamily: F.black, color: T.primary, letterSpacing: -0.6 },
  primaryDivider: { width: 1, backgroundColor: '#F0EDE8', marginVertical: 4 },

  /* ── Stat cards grid ─────────────────────────────── */
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 14,
    marginHorizontal: 18, marginBottom: 18,
  },
  statCard: {
    ...card, borderRadius: 20, paddingVertical: 20, paddingHorizontal: 14,
    alignItems: 'center', width: '30%' as any, flexGrow: 1,
  },
  statIconBox: {
    width: 46, height: 46, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  statValue: { fontSize: 22, fontFamily: F.black, color: T.textPrimary, letterSpacing: -0.4 },
  statLabel: {
    fontSize: 10, fontFamily: F.semiBold, color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 4, textAlign: 'center',
  },

  /* ── Details card ────────────────────────────────── */
  detailsCard: {
    ...card, borderRadius: 22, padding: 22,
    marginHorizontal: 18, marginBottom: 24,
  },
  detailsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  detailsTitle: { fontSize: 18, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.3 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F2ED',
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 14, fontFamily: F.medium, color: T.textMuted },
  detailValue: { fontSize: 14, fontFamily: F.semiBold, color: T.textPrimary },

  /* ── Progress bar (in details card) ───────────────── */
  progressBar: {
    width: '100%', height: 7, backgroundColor: T.borderSubtle,
    borderRadius: 4, overflow: 'hidden', marginTop: 14,
  },
  progressBarFill: { height: '100%', borderRadius: 4, backgroundColor: T.primary },

  /* ── Done button ─────────────────────────────────── */
  doneBtn: {
    marginHorizontal: 18,
    backgroundColor: T.success, borderRadius: 20,
    paddingVertical: 18, alignItems: 'center',
    ...shadowMd, shadowColor: T.success, shadowOpacity: 0.35,
  },
  doneBtnText: { fontSize: 18, fontFamily: F.bold, color: '#FFFFFF' },
  });
}
