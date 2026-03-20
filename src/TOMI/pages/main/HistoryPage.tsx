import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../../locales/i18n';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import {
  historyService,
  fetchAllWorkoutsForUser,
  type WeeklySummary,
  type WorkoutListItem,
} from '../../services/resources/history.service';
import { CalendarMonth } from '../../components/history/CalendarMonth';
import { createHistoryStyles } from '../../styles/history.styles';
import { useTheme } from '../../contexts/ThemeContext';

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

function getCategoryColor(cat: string, primary: string): string {
  if (cat === 'cardio')      return '#F0545C';
  if (cat === 'strength')    return '#FF7A3D';
  if (cat === 'flexibility') return '#4E9BE8';
  return primary;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * History grouping must use the calendar day/month embedded in the API string.
 * `new Date(iso).getMonth()` shifts UTC timestamps across month boundaries (e.g. January → December).
 */
/**
 * Normalize calendar day from API string so `2026-1-5` matches `2026-01-05` and padding matches `getMonthString`.
 */
function workoutDayKey(startedAt: string): string {
  if (!startedAt) return '';
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(startedAt.trim());
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  }
  return startedAt.length >= 10 ? startedAt.slice(0, 10) : startedAt;
}

function workoutMonthKey(startedAt: string): string {
  if (!startedAt) return '';
  const m = /^(\d{4})-(\d{1,2})(?:-|T|$)/.exec(startedAt.trim());
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}`;
  }
  return startedAt.length >= 7 ? startedAt.slice(0, 7) : startedAt;
}

function localTodayYmd(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

function parseYmd(ymd: string): { y: number; m0: number; d: number } | null {
  const p = ymd.split('-').map(Number);
  if (p.length !== 3 || p.some((x) => Number.isNaN(x))) return null;
  return { y: p[0], m0: p[1] - 1, d: p[2] };
}

/* ─── Stale-while-revalidate cache ─────────────────────────────────────── */
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FULL_HISTORY_TTL = 5 * 60 * 1000;
const summaryCache = new Map<number, { data: WeeklySummary; ts: number }>();
const monthCache = new Map<string, { activeDates: string[]; allWorkouts: WorkoutListItem[]; ts: number }>();
/** Full workout list per user — month changes read from here (no extra API). */
const fullHistoryCache = new Map<number, { items: WorkoutListItem[]; ts: number }>();

function getCacheKey(userId: number, monthStr: string) {
  return `${userId}-${monthStr}`;
}

function hydrateMonthCachesFromItems(userId: number, items: WorkoutListItem[]) {
  const byMonth = new Map<string, WorkoutListItem[]>();
  for (const w of items) {
    const m = workoutMonthKey(w.startedAt);
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m)!.push(w);
  }
  for (const [monthStr, list] of byMonth) {
    const activeDates = [...new Set(list.map((x) => workoutDayKey(x.startedAt)))].sort();
    monthCache.set(getCacheKey(userId, monthStr), {
      activeDates,
      allWorkouts: list,
      ts: Date.now(),
    });
  }
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

/** Warm full history + per-month caches (e.g. DataPreloader). */
export function populateHistoryFullWorkoutsCache(userId: number, items: WorkoutListItem[]) {
  fullHistoryCache.set(userId, { items, ts: Date.now() });
  hydrateMonthCachesFromItems(userId, items);
}

export function invalidateHistoryFullWorkoutsCache(userId?: number) {
  if (userId != null) fullHistoryCache.delete(userId);
  else fullHistoryCache.clear();
}

/* ─── Component ────────────────────────────────────────────────────────── */
export default function HistoryPage() {
  const { t } = useTranslation();
  const { colors: T } = useTheme();
  const styles = useMemo(() => createHistoryStyles(T), [T]);
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
  /** All workouts (all months) — calendar month switching is derived locally. */
  const [fullHistoryWorkouts, setFullHistoryWorkouts] = useState<WorkoutListItem[]>([]);
  const [historyReady, setHistoryReady] = useState(false);

  const getMonthString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const getDateString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (!user?.userId) {
      setHistoryReady(false);
      setFullHistoryWorkouts([]);
      setWeeklySummary(null);
      setActiveDates([]);
      setAllWorkouts([]);
      setWorkouts([]);
      setSelectedDate(undefined);
      setLoading(false);
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  /** Single O(n) pass: month navigation is O(1) lookup instead of filtering the full list each time. */
  const workoutsByMonth = useMemo(() => {
    const m = new Map<string, WorkoutListItem[]>();
    for (const w of fullHistoryWorkouts) {
      const key = workoutMonthKey(w.startedAt);
      let arr = m.get(key);
      if (!arr) {
        arr = [];
        m.set(key, arr);
      }
      arr.push(w);
    }
    return m;
  }, [fullHistoryWorkouts]);

  /** When month or full list changes, update calendar + list from indexed data (instant). */
  useEffect(() => {
    if (!historyReady || !user?.userId) return;
    const monthStr = getMonthString(currentMonth);
    const monthItems = workoutsByMonth.get(monthStr) ?? [];
    const active = [...new Set(monthItems.map((w) => workoutDayKey(w.startedAt)))].sort();
    setActiveDates(active);
    setAllWorkouts(monthItems);
    if (monthItems.length === 0) {
      setSelectedDate(undefined);
      setWorkouts([]);
      return;
    }
    const today = localTodayYmd();
    const sel = active.includes(today) ? today : [...active].sort().reverse()[0];
    setSelectedDate(sel);
    setWorkouts(monthItems.filter((w) => workoutDayKey(w.startedAt) === sel));
  }, [historyReady, user?.userId, currentMonth, workoutsByMonth]);

  const loadData = async () => {
    if (!user?.userId) return;
    const uid = user.userId;
    const cachedSummary = summaryCache.get(uid);
    const fh = fullHistoryCache.get(uid);

    if (cachedSummary && Date.now() - cachedSummary.ts < CACHE_TTL) {
      setWeeklySummary(cachedSummary.data);
    }

    if (fh && Date.now() - fh.ts < FULL_HISTORY_TTL) {
      setFullHistoryWorkouts(fh.items);
      hydrateMonthCachesFromItems(uid, fh.items);
      setHistoryReady(true);
      if (!cachedSummary || Date.now() - cachedSummary.ts >= CACHE_TTL) {
        try {
          const summary = await historyService.getWeeklySummary(uid);
          summaryCache.set(uid, { data: summary, ts: Date.now() });
          setWeeklySummary(summary);
        } catch (err) {
          console.error('[HistoryPage] Error loading weekly summary:', err);
        }
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [summary, allItems] = await Promise.all([
        historyService.getWeeklySummary(uid),
        fetchAllWorkoutsForUser(uid),
      ]);
      summaryCache.set(uid, { data: summary, ts: Date.now() });
      fullHistoryCache.set(uid, { items: allItems, ts: Date.now() });
      hydrateMonthCachesFromItems(uid, allItems);
      setWeeklySummary(summary);
      setFullHistoryWorkouts(allItems);
      setHistoryReady(true);
    } catch (err) {
      console.error('[HistoryPage] Error loading data:', err);
      setFullHistoryWorkouts([]);
      setHistoryReady(true);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkoutsForDate = async (date?: string) => {
    if (!user?.userId) return;
    setSelectedDate(date);
    if (!date) {
      setWorkouts(allWorkouts);
      return;
    }
    const fromCache = allWorkouts.filter(w => workoutDayKey(w.startedAt) === date);
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
    const wStart = workoutDayKey(weeklySummary.weekStart);
    const wEnd = workoutDayKey(weeklySummary.weekEnd);
    return fullHistoryWorkouts.filter((w) => {
      const day = workoutDayKey(w.startedAt);
      return day >= wStart && day <= wEnd;
    });
  }, [fullHistoryWorkouts, weeklySummary]);

  /* Weekly bar chart data */
  const weeklyBars = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const w of weekWorkouts) {
      const parts = parseYmd(workoutDayKey(w.startedAt));
      if (!parts) continue;
      const dow = new Date(parts.y, parts.m0, parts.d).getDay();
      counts[dow === 0 ? 6 : dow - 1]++;
    }
    const max = Math.max(...counts, 1);
    return DAY_LABELS.map((label, i) => ({ label, count: counts[i], height: (counts[i] / max) * 100 }));
  }, [weekWorkouts]);

  /* Month aggregates from the active dates + all workouts for stats display */
  const monthStats = useMemo(() => {
    const monthWorkouts = allWorkouts;
    return {
      workouts: monthWorkouts.length,
      xp: monthWorkouts.reduce((s, w) => s + (w.xpEarned ?? 0), 0),
      minutes: monthWorkouts.reduce((s, w) => s + (w.durationMinutes ?? 0), 0),
      calories: monthWorkouts.reduce((s, w) => s + (w.calories ?? 0), 0),
    };
  }, [allWorkouts]);

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
            const catColor = getCategoryColor(cat, T.primary);
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
