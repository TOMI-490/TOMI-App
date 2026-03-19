import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../../locales/i18n';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  historyService,
  type WeeklySummary,
  type WorkoutListItem,
  type CalendarActivity,
} from '../../services/resources/history.service';
import { CalendarMonth } from '../../components/history/CalendarMonth';
import { historyStyles as styles } from '../../styles/history.styles';
import { TOMI_THEME as T } from '../../constants/theme';

/* ─── Helpers ──────────────────────────────────────────────────────────── */
type IconDef =
  | { lib: 'Ionicons'; name: React.ComponentProps<typeof Ionicons>['name'] }
  | { lib: 'MCI'; name: React.ComponentProps<typeof MaterialCommunityIcons>['name'] };

function getWorkoutIcon(type: string): IconDef {
  const l = type.toLowerCase();
  if (l.includes('run'))   return { lib: 'MCI', name: 'run' };
  if (l.includes('walk'))  return { lib: 'MCI', name: 'walk' };
  if (l.includes('cycl') || l.includes('bike')) return { lib: 'MCI', name: 'bike' };
  if (l.includes('swim'))  return { lib: 'MCI', name: 'swim' };
  if (l.includes('yoga'))  return { lib: 'MCI', name: 'yoga' };
  if (l.includes('strength') || l.includes('weight')) return { lib: 'Ionicons', name: 'barbell-outline' };
  if (l.includes('hiit') || l.includes('interval'))   return { lib: 'MCI', name: 'lightning-bolt' };
  if (l.includes('stretch')) return { lib: 'MCI', name: 'human-handsup' };
  return { lib: 'Ionicons', name: 'fitness-outline' };
}

function WIcon({ def, size, color }: { def: IconDef; size: number; color: string }) {
  if (def.lib === 'Ionicons') return <Ionicons name={def.name as any} size={size} color={color} />;
  return <MaterialCommunityIcons name={def.name as any} size={size} color={color} />;
}

function getWorkoutColor(type: string): { color: string; bg: string } {
  const l = type.toLowerCase();
  if (l.includes('run') || l.includes('walk') || l.includes('cycl') || l.includes('swim'))
    return { color: '#F0545C', bg: '#FDEAEA' };
  if (l.includes('strength') || l.includes('weight'))
    return { color: '#FF7A3D', bg: '#FFF0E8' };
  if (l.includes('yoga') || l.includes('stretch'))
    return { color: '#4E9BE8', bg: '#E8F1FD' };
  if (l.includes('hiit') || l.includes('interval'))
    return { color: '#FF7A3D', bg: '#FFF0E8' };
  return { color: '#FF7A3D', bg: '#FFF0E8' };
}

function getCategoryLabel(type: string): string {
  const l = type.toLowerCase();
  if (l.includes('run') || l.includes('walk') || l.includes('cycl') || l.includes('swim')) return 'cardio';
  if (l.includes('strength') || l.includes('weight')) return 'strength';
  if (l.includes('yoga') || l.includes('stretch')) return 'flexibility';
  if (l.includes('hiit') || l.includes('interval')) return 'cardio';
  return 'general';
}

function getCategoryColor(cat: string): string {
  if (cat === 'cardio')      return '#F0545C';
  if (cat === 'strength')    return '#FF7A3D';
  if (cat === 'flexibility') return '#4E9BE8';
  return T.primary;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ─── Stale-while-revalidate cache ─────────────────────────────────────── */
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const summaryCache = new Map<number, { data: WeeklySummary; ts: number }>();
const monthCache = new Map<string, { activeDates: string[]; allWorkouts: WorkoutListItem[]; ts: number }>();

function getCacheKey(userId: number, monthStr: string) {
  return `${userId}-${monthStr}`;
}

/** Pre-populate from outside (used by DataPreloader). */
export function populateHistorySummaryCache(userId: number, data: WeeklySummary) {
  summaryCache.set(userId, { data, ts: Date.now() });
}
export function populateHistoryMonthCache(
  userId: number,
  monthStr: string,
  activeDates: string[],
  allWorkouts: WorkoutListItem[],
) {
  monthCache.set(getCacheKey(userId, monthStr), { activeDates, allWorkouts, ts: Date.now() });
}

/* ─── Component ────────────────────────────────────────────────────────── */
export default function HistoryPage() {
  const { t } = useTranslation();
  const { authId } = useAuth();
  const { user } = useCurrentUser(authId || undefined);

  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [allWorkouts, setAllWorkouts] = useState<WorkoutListItem[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);

  const getMonthString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const getDateString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  useEffect(() => { if (user?.userId) loadData(); }, [user?.userId]);
  useEffect(() => { if (user?.userId && !loading) loadMonthData(); }, [currentMonth]);

  const loadData = async () => {
    if (!user?.userId) return;
    const monthStr = getMonthString(currentMonth);
    const cacheKey = getCacheKey(user.userId, monthStr);

    const cachedSummary = summaryCache.get(user.userId);
    const cachedMonth = monthCache.get(cacheKey);
    if (cachedSummary && Date.now() - cachedSummary.ts < CACHE_TTL) {
      setWeeklySummary(cachedSummary.data);
    }
    if (cachedMonth && Date.now() - cachedMonth.ts < CACHE_TTL) {
      setActiveDates(cachedMonth.activeDates);
      setAllWorkouts(cachedMonth.allWorkouts);
      setWorkouts(cachedMonth.allWorkouts);
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(cachedMonth.activeDates.includes(today) ? today : cachedMonth.activeDates.sort().reverse()[0]);
    }
    if (cachedSummary || cachedMonth) setLoading(false);

    try {
      if (!cachedSummary && !cachedMonth) setLoading(true);
      const [summary, calendar, workoutsList] = await Promise.all([
        historyService.getWeeklySummary(user.userId),
        historyService.getCalendarActivity(user.userId, monthStr),
        historyService.getWorkoutsList(user.userId, undefined, monthStr, 1, 50),
      ]);
      summaryCache.set(user.userId, { data: summary, ts: Date.now() });
      monthCache.set(cacheKey, { activeDates: calendar.activeDates, allWorkouts: workoutsList.items, ts: Date.now() });
      setWeeklySummary(summary);
      setActiveDates(calendar.activeDates);
      setAllWorkouts(workoutsList.items);
      setWorkouts(workoutsList.items);
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(calendar.activeDates.includes(today) ? today : calendar.activeDates.sort().reverse()[0]);
    } catch (err) {
      console.error('[HistoryPage] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthData = async () => {
    if (!user?.userId) return;
    const monthStr = getMonthString(currentMonth);
    const cacheKey = getCacheKey(user.userId, monthStr);

    const cached = monthCache.get(cacheKey);
    if (cached) {
      setActiveDates(cached.activeDates);
      setAllWorkouts(cached.allWorkouts);
      if (cached.activeDates.length > 0) {
        const most = [...cached.activeDates].sort().reverse()[0];
        setSelectedDate(most);
        setWorkouts(cached.allWorkouts.filter(w => w.startedAt.startsWith(most)));
      } else {
        setSelectedDate(undefined);
        setWorkouts([]);
      }
      if (Date.now() - cached.ts < CACHE_TTL) return;
    }

    try {
      const [calendar, monthWorkoutsList] = await Promise.all([
        historyService.getCalendarActivity(user.userId, monthStr),
        historyService.getWorkoutsList(user.userId, undefined, monthStr, 1, 200),
      ]);
      const items = monthWorkoutsList.items;
      monthCache.set(cacheKey, { activeDates: calendar.activeDates, allWorkouts: items, ts: Date.now() });
      setActiveDates(calendar.activeDates);
      setAllWorkouts(items);
      if (calendar.activeDates.length > 0) {
        const most = calendar.activeDates.sort().reverse()[0];
        setSelectedDate(most);
        setWorkouts(items.filter(w => w.startedAt.startsWith(most)));
      } else {
        setSelectedDate(undefined);
        setWorkouts([]);
      }
    } catch (err) {
      console.error('[HistoryPage] Error loading month:', err);
    }
  };

  const loadWorkoutsForDate = async (date?: string) => {
    if (!user?.userId) return;
    setSelectedDate(date);
    if (!date) {
      setWorkouts(allWorkouts);
      return;
    }
    const fromCache = allWorkouts.filter(w => w.startedAt.startsWith(date));
    if (fromCache.length > 0) {
      setWorkouts(fromCache);
      return;
    }
    setWorkoutsLoading(true);
    try {
      const data = await historyService.getWorkoutsList(user.userId, date, undefined, 1, 20);
      setWorkouts(data.items);
    } catch (err) {
      console.error('[HistoryPage] Error loading workouts:', err);
    } finally {
      setWorkoutsLoading(false);
    }
  };

  const handleDatePress = (d: Date) => loadWorkoutsForDate(getDateString(d));
  const handleMonthChange = (dir: 'prev' | 'next') => {
    const nm = new Date(currentMonth);
    nm.setMonth(nm.getMonth() + (dir === 'prev' ? -1 : 1));
    setCurrentMonth(nm);
  };

  /* Filter workouts to current week only (Mon-Sun containing today) */
  const weekWorkouts = useMemo(() => {
    if (!weeklySummary) return [];
    const ws = new Date(weeklySummary.weekStart);
    const we = new Date(weeklySummary.weekEnd);
    we.setHours(23, 59, 59, 999);
    return allWorkouts.filter(w => {
      const d = new Date(w.startedAt);
      return d >= ws && d <= we;
    });
  }, [allWorkouts, weeklySummary]);

  /* Weekly bar chart data */
  const weeklyBars = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const w of weekWorkouts) {
      const d = new Date(w.startedAt);
      const dow = d.getDay();
      counts[dow === 0 ? 6 : dow - 1]++;
    }
    const max = Math.max(...counts, 1);
    return DAY_LABELS.map((label, i) => ({ label, count: counts[i], height: (counts[i] / max) * 100 }));
  }, [weekWorkouts]);

  /* Month aggregates from the active dates + all workouts for stats display */
  const monthStats = useMemo(() => {
    const m = currentMonth.getMonth();
    const y = currentMonth.getFullYear();
    const monthWorkouts = allWorkouts.filter(w => {
      const d = new Date(w.startedAt);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    return {
      workouts: monthWorkouts.length,
      xp: monthWorkouts.reduce((s, w) => s + (w.xpEarned ?? 0), 0),
      minutes: monthWorkouts.reduce((s, w) => s + (w.durationMinutes ?? 0), 0),
      calories: monthWorkouts.reduce((s, w) => s + (w.calories ?? 0), 0),
    };
  }, [allWorkouts, currentMonth]);

  const weekCalories = useMemo(() =>
    weekWorkouts.reduce((s, w) => s + (w.calories ?? 0), 0),
  [weekWorkouts]);

  const displayStats = period === 'week'
    ? { workouts: weeklySummary?.workoutsCount ?? 0, xp: weeklySummary?.xpTotal ?? 0, minutes: weeklySummary?.minutesTotal ?? 0, calories: weekCalories }
    : monthStats;

  if (loading) {
    return (
      <ScreenWrapper style={styles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerIconBox}>
            <Ionicons name="calendar" size={26} color={T.success} />
          </View>
          <View>
            <Text style={styles.headerTitle}>History</Text>
            <Text style={styles.headerSubtitle}>Your workout journey</Text>
          </View>
        </View>

        {/* ── Stats row ───────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <View style={[styles.statIconBox, { backgroundColor: T.dangerTint }]}>
              <MaterialCommunityIcons name="target" size={16} color={T.danger} />
            </View>
            <Text style={styles.statValue}>{displayStats.workouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statPill}>
            <View style={[styles.statIconBox, { backgroundColor: T.primaryTint }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color={T.primary} />
            </View>
            <Text style={styles.statValue}>{displayStats.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statPill}>
            <View style={[styles.statIconBox, { backgroundColor: T.secondaryTint }]}>
              <Ionicons name="time-outline" size={16} color={T.secondary} />
            </View>
            <Text style={styles.statValue}>{displayStats.minutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statPill}>
            <View style={[styles.statIconBox, { backgroundColor: '#FDEAEA' }]}>
              <Ionicons name="flame-outline" size={16} color="#F0545C" />
            </View>
            <Text style={styles.statValue}>{displayStats.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>

        {/* ── Period toggle ───────────────────────────── */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, period === 'week' && styles.toggleBtnActive]}
            onPress={() => setPeriod('week')} activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={16} color={period === 'week' ? '#FFF' : T.textMuted} />
            <Text style={[styles.toggleBtnText, period === 'week' && styles.toggleBtnTextActive]}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, period === 'month' && styles.toggleBtnActive]}
            onPress={() => setPeriod('month')} activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={16} color={period === 'month' ? '#FFF' : T.textMuted} />
            <Text style={[styles.toggleBtnText, period === 'month' && styles.toggleBtnTextActive]}>This Month</Text>
          </TouchableOpacity>
        </View>

        {/* ── Week view: bar chart ────────────────────── */}
        {period === 'week' && (
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <MaterialCommunityIcons name="chart-line" size={22} color={T.primary} />
              <Text style={styles.activityTitle}>Weekly Activity</Text>
            </View>
            <View style={styles.barChartRow}>
              {weeklyBars.map(b => {
                const hasActivity = b.count > 0;
                if (!hasActivity) {
                  return (
                    <View key={b.label} style={styles.barCol}>
                      <View style={styles.barEmpty} />
                      <Text style={[styles.barLabel, styles.barLabelInactive]}>{b.label}</Text>
                    </View>
                  );
                }
                const barH = Math.max((b.height / 100) * 52, 18);
                return (
                  <View key={b.label} style={styles.barCol}>
                    <View style={[styles.bar, styles.barFill, { height: barH }]}>
                      <Text style={styles.barValue}>{b.count}</Text>
                    </View>
                    <Text style={[styles.barLabel, styles.barLabelActive]}>{b.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Month view: calendar ────────────────────── */}
        {period === 'month' && (
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View style={styles.calendarTitleRow}>
                <Ionicons name="calendar" size={18} color={T.primary} />
                <Text style={styles.calendarTitle}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
              </View>
              <View style={styles.calendarNav}>
                <TouchableOpacity style={styles.calendarNavBtn} onPress={() => handleMonthChange('prev')}>
                  <Ionicons name="chevron-back" size={16} color={T.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.calendarNavBtn} onPress={() => handleMonthChange('next')}>
                  <Ionicons name="chevron-forward" size={16} color={T.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <CalendarMonth
              currentMonth={currentMonth}
              activeDates={activeDates}
              selectedDate={selectedDate}
              onMonthChange={handleMonthChange}
              onDatePress={handleDatePress}
              emptyMessage="No workouts this month"
            />
            <View style={styles.calendarLegend}>
              <Text style={styles.legendText}>Less</Text>
              <View style={styles.legendDots}>
                <View style={[styles.legendDot, { backgroundColor: '#D0F5E3' }]} />
                <View style={[styles.legendDot, { backgroundColor: '#B8F0D2' }]} />
                <View style={[styles.legendDot, { backgroundColor: T.success }]} />
              </View>
              <Text style={styles.legendText}>More</Text>
            </View>
          </View>
        )}

        {/* ── Recent Workouts ─────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="history" size={20} color={T.primary} />
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
          </View>
        </View>

        {workoutsLoading ? (
          <ActivityIndicator size="small" color={T.primary} style={{ marginVertical: 20 }} />
        ) : workouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={40} color={T.textMuted} />
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptyMessage}>Complete a workout to see it here!</Text>
          </View>
        ) : (
          workouts.slice(0, 5).map(w => {
            const icon = getWorkoutIcon(w.type);
            const wc = getWorkoutColor(w.type);
            const cat = getCategoryLabel(w.type);
            const catColor = getCategoryColor(cat);
            return (
              <View key={w.id} style={styles.workoutCard}>
                <View style={[styles.workoutAccent, { backgroundColor: wc.color }]} />
                <View style={[styles.workoutIconBox, { backgroundColor: wc.bg }]}>
                  <WIcon def={icon} size={22} color={wc.color} />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutType}>{w.type}</Text>
                  <Text style={styles.workoutDate}>{formatDate(w.startedAt)}</Text>
                  <View style={styles.workoutMetaRow}>
                    <View style={styles.workoutMetaItem}>
                      <Ionicons name="time-outline" size={12} color={T.textMuted} />
                      <Text style={styles.workoutMetaText}>{w.durationMinutes} min</Text>
                    </View>
                    {w.calories != null && w.calories > 0 && (
                      <View style={styles.workoutMetaItem}>
                        <Ionicons name="flame-outline" size={12} color={T.textMuted} />
                        <Text style={styles.workoutMetaText}>{w.calories} cal</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.workoutRight}>
                  <View style={styles.xpBadge}>
                    <MaterialCommunityIcons name="lightning-bolt" size={13} color={T.primary} />
                    <Text style={styles.xpBadgeText}>+{w.xpEarned}</Text>
                  </View>
                  <View style={[styles.categoryTag, { backgroundColor: catColor }]}>
                    <Text style={styles.categoryTagText}>{cat}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

      </ScrollView>
    </ScreenWrapper>
  );
}
