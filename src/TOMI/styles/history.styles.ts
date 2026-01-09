import { StyleSheet } from 'react-native';

// Design tokens for consistency
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// Calendar-specific constants for grid alignment
const CALENDAR = {
  CELL_SIZE: 42,        // Fixed size for each day cell
  CELL_GAP: 6,          // Gap between cells
  PILL_SIZE: 36,        // Size of the pill/circle inside cell
  TOUCH_TARGET: 44,     // Minimum touch target (accessibility)
};

const COLORS = {
  primary: '#4CAF50',
  primaryDark: '#2E7D32',
  primaryLight: '#E8F5E9',
  background: '#f5f5f5',
  card: '#fff',
  text: '#333',
  textSecondary: '#666',
  textMuted: '#999',
  border: '#e0e0e0',
  borderLight: '#f0f0f0',
  error: '#f44336',
  shadow: '#000',
};

const TYPOGRAPHY = {
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  captionSmall: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
};

const CARD_STYLE = {
  borderRadius: 12,
  padding: SPACING.lg,
  backgroundColor: COLORS.card,
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};

export const historyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  
  // Section Headers (with optional action button)
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: COLORS.text,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  sectionActionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  
  // Weekly Summary Card
  summaryCard: {
    ...CARD_STYLE,
    marginBottom: SPACING.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    ...TYPOGRAPHY.cardTitle,
    color: COLORS.text,
    flex: 1,
  },
  summaryIcon: {
    marginLeft: SPACING.sm,
  },
  summaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  deltaText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  deltaPositive: {
    color: COLORS.primary,
  },
  deltaNegative: {
    color: COLORS.error,
  },
  
  // Calendar Card
  calendarCard: {
    ...CARD_STYLE,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  calendarNavButton: {
    width: CALENDAR.TOUCH_TARGET,
    height: CALENDAR.TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: CALENDAR.TOUCH_TARGET / 2,
  },
  calendarTitle: {
    ...TYPOGRAPHY.cardTitle,
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarGrid: {
    marginTop: SPACING.xs,
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    paddingHorizontal: 0,
  },
  weekdayText: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textMuted,
    fontWeight: '600',
    width: '14.285%',
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.285%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  calendarDayInner: {
    width: CALENDAR.PILL_SIZE,
    height: CALENDAR.PILL_SIZE,
    borderRadius: CALENDAR.PILL_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  calendarDaySelected: {
    backgroundColor: COLORS.primary,
    borderWidth: 0,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarDayText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  calendarDayTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: COLORS.card,
    fontWeight: '700',
  },
  calendarDayToday: {
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  calendarDayTodaySelected: {
    backgroundColor: COLORS.primaryDark,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  todayDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  todayDotSelected: {
    backgroundColor: COLORS.card,
  },
  emptyCalendar: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  
  // Workouts Section
  workoutsSection: {
    marginBottom: SPACING.md,
  },
  workoutCard: {
    ...CARD_STYLE,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  workoutCardPressed: {
    opacity: 0.7,
    backgroundColor: COLORS.background,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  workoutHeaderLeft: {
    flex: 1,
  },
  workoutType: {
    ...TYPOGRAPHY.cardTitle,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  workoutDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  workoutHeaderRight: {
    alignItems: 'flex-end',
  },
  workoutDuration: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  xpBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  xpBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statValueMuted: {
    color: COLORS.textMuted,
  },
  statLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textMuted,
  },
  
  // Overview Section (Most Frequent Workouts, XP Over Time)
  overviewGrid: {
    flexDirection: 'column',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  overviewCard: {
    ...CARD_STYLE,
    padding: SPACING.md,
  },
  overviewTitle: {
    ...TYPOGRAPHY.cardTitle,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  frequentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  frequentItemLast: {
    borderBottomWidth: 0,
  },
  frequentWorkoutName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  frequentWorkoutCount: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    minWidth: 32,
    textAlign: 'center',
  },
  xpChartPlaceholder: {
    height: 140,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  xpChartText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  xpMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  xpMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  xpMetricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  xpMetricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // XP Chart Styles
  chartContainer: {
    backgroundColor: '#FBFBFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  chartEmptyContainer: {
    backgroundColor: '#FBFBFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartEmptyText: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '500',
  },
  chartRangeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.xs,
  },
  chartTooltip: {
    position: 'absolute',
    backgroundColor: COLORS.text,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
    alignItems: 'center',
  },
  chartTooltipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  
  // Skeleton Loading States
  skeletonCard: {
    ...CARD_STYLE,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  skeletonLine: {
    height: 12,
    backgroundColor: COLORS.borderLight,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.borderLight,
    borderRadius: 20,
  },
  skeletonMetric: {
    flex: 1,
    alignItems: 'center',
  },
  skeletonMetricValue: {
    width: 60,
    height: 24,
    backgroundColor: COLORS.borderLight,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  skeletonMetricLabel: {
    width: 40,
    height: 12,
    backgroundColor: COLORS.borderLight,
    borderRadius: 4,
  },
  
  // States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl + 8,
  },
  emptyContainer: {
    padding: SPACING.xxl + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    padding: SPACING.xxl + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
  },
  retryButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.card,
    fontWeight: '600',
  },
  
  // Workout Detail Screen
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  detailScrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl + 8,
  },
  detailCard: {
    ...CARD_STYLE,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  detailType: {
    ...TYPOGRAPHY.title,
    fontSize: 24,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  detailDate: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  detailStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailStatItem: {
    width: '48%',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  detailStatLabel: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  detailStatValue: {
    ...TYPOGRAPHY.title,
    fontSize: 20,
    color: COLORS.primary,
  },
  
  // Placeholder areas
  placeholderSection: {
    marginBottom: SPACING.lg,
  },
  placeholderCard: {
    ...CARD_STYLE,
    marginBottom: SPACING.md,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },
});
