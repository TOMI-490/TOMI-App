import { StyleSheet } from 'react-native';
import { TOMI_THEME as T } from '../constants/theme';
import { F } from '../constants/fonts';

const shadowSm = {
  shadowColor: '#8891A5', shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.16, shadowRadius: 8, elevation: 4,
} as const;

const shadowMd = {
  shadowColor: '#8891A5', shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.22, shadowRadius: 14, elevation: 6,
} as const;

const card = { backgroundColor: '#FFFFFF', borderRadius: 22, ...shadowSm } as const;

export const historyStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EDEAE3' },
  scroll: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 120 },

  /* ── Header ────────────────────────────────────── */
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  headerIconBox: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: T.successTint, justifyContent: 'center', alignItems: 'center',
    ...shadowSm, shadowColor: T.success, shadowOpacity: 0.2,
  },
  headerTitle: { fontSize: 30, fontFamily: F.headline, color: T.textPrimary, letterSpacing: -1 },
  headerSubtitle: { fontSize: 13, fontFamily: F.medium, color: T.textMuted, marginTop: 2 },

  /* ── Stats row ─────────────────────────────────── */
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statPill: {
    flex: 1, ...card, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 6,
    alignItems: 'center',
  },
  statIconBox: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  statValue: { fontSize: 22, fontFamily: F.black, color: T.textPrimary, letterSpacing: -0.5 },
  statLabel: {
    fontSize: 9, fontFamily: F.semiBold, color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center', marginTop: 3,
  },

  /* ── Period toggle ─────────────────────────────── */
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 13, borderRadius: 16,
    backgroundColor: '#FFFFFF', ...shadowSm,
  },
  toggleBtnActive: {
    backgroundColor: T.primary,
    ...shadowMd, shadowColor: T.primary, shadowOpacity: 0.35,
  },
  toggleBtnText: { fontSize: 14, fontFamily: F.bold, color: T.textMuted },
  toggleBtnTextActive: { color: '#FFFFFF' },

  /* ── Weekly Activity card ──────────────────────── */
  activityCard: { ...card, borderRadius: 24, padding: 20, marginBottom: 22 },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  activityTitle: { fontSize: 17, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.3 },
  barChartRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    height: 72, paddingHorizontal: 4,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 20, minHeight: 20, borderRadius: 10, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  barFill: { backgroundColor: '#FF884D' },
  barEmpty: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  barLabel: { fontSize: 10, fontFamily: F.semiBold, marginTop: 8, minWidth: 24, textAlign: 'center' },
  barLabelActive: { color: T.textPrimary },
  barLabelInactive: { color: T.textMuted },
  barValue: {
    fontSize: 11,
    fontFamily: F.bold,
    color: '#FFFFFF',
  },

  /* ── Calendar card ─────────────────────────────── */
  calendarCard: { ...card, borderRadius: 22, padding: 18, marginBottom: 22 },
  calendarHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 14,
  },
  calendarTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  calendarTitle: { fontSize: 18, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.3 },
  calendarNav: { flexDirection: 'row', gap: 6 },
  calendarNavBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F5F2ED', justifyContent: 'center', alignItems: 'center',
  },
  calendarGrid: { marginTop: 4 },
  calendarWeekdays: { flexDirection: 'row', marginBottom: 8 },
  weekdayText: {
    width: '14.285%' as any, textAlign: 'center',
    fontSize: 11, fontFamily: F.semiBold, color: T.textMuted, letterSpacing: 0.4,
  },
  calendarDays: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDay: {
    width: '14.285%' as any, aspectRatio: 1,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  calendarDayInner: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  calendarDayActive: { backgroundColor: '#B8F0D2' },
  calendarDaySelected: {
    backgroundColor: T.success,
    ...shadowSm, shadowColor: T.success, shadowOpacity: 0.4,
  },
  calendarDayToday: { borderWidth: 2.5, borderColor: T.success, backgroundColor: '#D0F5E3' },
  calendarDayTodaySelected: { backgroundColor: '#1AA06C', borderWidth: 2.5, borderColor: '#FFF' },
  calendarDayText: { fontSize: 14, fontFamily: F.medium, color: T.textMuted },
  calendarDayTextActive: { color: '#0F7B4F', fontFamily: F.bold },
  calendarDayTextSelected: { color: '#FFFFFF', fontFamily: F.bold },
  todayDot: {
    position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2,
    backgroundColor: T.success,
  },
  todayDotSelected: { backgroundColor: '#FFF' },
  calendarLegend: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12, paddingHorizontal: 4,
  },
  legendText: { fontSize: 11, fontFamily: F.medium, color: T.textMuted },
  legendDots: { flexDirection: 'row', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  emptyCalendar: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontSize: 13, fontFamily: F.medium, color: T.textMuted },

  /* ── Section header ────────────────────────────── */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 22, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.5 },
  sectionAction: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: T.primaryTint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  sectionActionText: { fontSize: 12, fontFamily: F.semiBold, color: T.primary },

  /* ── Workout card (wireframe style) ────────────── */
  workoutCard: {
    ...card, borderRadius: 20, padding: 16, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
    ...shadowMd,
  },
  workoutAccent: { width: 4, alignSelf: 'stretch', borderRadius: 2, marginRight: 12 },
  workoutIconBox: {
    width: 48, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  workoutInfo: { flex: 1 },
  workoutType: { fontSize: 16, fontFamily: F.headlineMd, color: T.textPrimary, letterSpacing: -0.2 },
  workoutDate: { fontSize: 11, fontFamily: F.regular, color: T.textMuted, marginTop: 2 },
  workoutMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  workoutMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workoutMetaText: { fontSize: 11, fontFamily: F.medium, color: T.textMuted },
  workoutRight: { alignItems: 'flex-end', gap: 6 },
  xpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: T.primaryTint, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  xpBadgeText: { fontSize: 12, fontFamily: F.bold, color: T.primary },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryTagText: { fontSize: 10, fontFamily: F.bold, color: '#FFF', letterSpacing: 0.3 },

  /* ── Empty / Error / Loading ───────────────────── */
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 10, fontSize: 14, fontFamily: F.medium, color: T.textMuted },
  emptyContainer: { paddingVertical: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontFamily: F.headlineMd, color: T.textPrimary, marginBottom: 6 },
  emptyMessage: { fontSize: 13, fontFamily: F.regular, color: T.textMuted, textAlign: 'center' },
  errorContainer: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 14, fontFamily: F.medium, color: T.danger, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: T.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  retryButtonText: { fontSize: 14, fontFamily: F.bold, color: '#FFF' },

  /* ── Skeleton ──────────────────────────────────── */
  skeletonCard: { ...card, padding: 16, marginBottom: 12 },
  skeletonLine: { height: 12, backgroundColor: '#F0EDE8', borderRadius: 6, marginBottom: 8 },
  skeletonCircle: { width: 40, height: 40, backgroundColor: '#F0EDE8', borderRadius: 20 },
  skeletonMetric: { flex: 1, alignItems: 'center' },
  skeletonMetricValue: { width: 50, height: 20, backgroundColor: '#F0EDE8', borderRadius: 4, marginBottom: 4 },
  skeletonMetricLabel: { width: 36, height: 10, backgroundColor: '#F0EDE8', borderRadius: 4 },

  /* ── XP Chart (kept for overview) ──────────────── */
  chartContainer: { backgroundColor: '#FAFAF8', borderRadius: 14, overflow: 'hidden' },
  chartEmptyContainer: {
    backgroundColor: '#FAFAF8', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  chartEmptyText: { fontSize: 14, fontFamily: F.medium, color: T.textMuted },
  chartRangeLabel: {
    fontSize: 10, fontFamily: F.semiBold, color: T.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, paddingLeft: 4,
  },
  chartTooltip: {
    position: 'absolute', backgroundColor: T.textPrimary,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    ...shadowSm, minWidth: 80, alignItems: 'center',
  },
  chartTooltipText: { fontSize: 11, fontFamily: F.semiBold, color: '#FFF' },

  /* ── Compat aliases (old keys still referenced) ── */
  container: { flex: 1, backgroundColor: '#EDEAE3' },
  scrollContent: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 120 },
  summaryCard: { ...card, marginBottom: 14, padding: 16 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  summaryTitle: { fontSize: 15, fontFamily: F.bold, color: T.textPrimary, flex: 1 },
  summaryMetrics: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  metricItem: { flex: 1, alignItems: 'center' },
  metricValue: { fontSize: 26, fontFamily: F.black, color: T.primary, marginBottom: 2 },
  metricLabel: { fontSize: 11, fontFamily: F.medium, color: T.textMuted },
  deltaText: { fontSize: 13, fontFamily: F.medium, color: T.textMuted, textAlign: 'center' },
  deltaPositive: { color: T.success },
  deltaNegative: { color: T.danger },
  workoutsSection: { marginBottom: 14 },
  workoutCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  workoutHeaderLeft: { flex: 1 },
  workoutHeaderRight: { alignItems: 'flex-end' },
  workoutDuration: { fontSize: 14, fontFamily: F.semiBold, color: T.primary, marginBottom: 4 },
  workoutStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontFamily: F.semiBold, color: T.textPrimary, marginBottom: 2 },
  statValueMuted: { color: T.textMuted },
  statLabel: { fontSize: 11, fontFamily: F.medium, color: T.textMuted },
  overviewGrid: { flexDirection: 'column', marginBottom: 14, gap: 10 },
  overviewCard: { ...card, padding: 14 },
  overviewTitle: { fontSize: 15, fontFamily: F.bold, color: T.textPrimary, marginBottom: 12 },
  frequentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F2ED' },
  frequentItemLast: { borderBottomWidth: 0 },
  frequentWorkoutName: { fontSize: 14, fontFamily: F.medium, color: T.textPrimary, flex: 1 },
  frequentWorkoutCount: { fontSize: 14, fontFamily: F.bold, color: T.primary, backgroundColor: T.primaryTint, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, minWidth: 32, textAlign: 'center' },
  xpMetrics: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F5F2ED' },
  xpMetricItem: { flex: 1, alignItems: 'center' },
  xpMetricValue: { fontSize: 20, fontFamily: F.black, color: T.textPrimary, marginBottom: 2 },
  xpMetricLabel: { fontSize: 10, fontFamily: F.semiBold, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
});
