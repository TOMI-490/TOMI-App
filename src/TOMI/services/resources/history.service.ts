import { httpClient } from '../httpClient';
import { createAPICache } from '../../utils/apiCache';

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  workoutsCount: number;
  minutesTotal: number;
  xpTotal: number;
  deltaPercentFromLastWeek: number;
}

export interface CalendarActivity {
  month: string;
  activeDates: string[];
}

export interface WorkoutListItem {
  id: number;
  type: string;
  startedAt: string;
  durationMinutes: number;
  xpEarned: number;
  calories?: number;
  avgHr?: number;
  exercisesCount?: number;
}

export interface PaginatedWorkouts {
  items: WorkoutListItem[];
  page: number;
  pageSize: number;
  hasNext: boolean;
  total: number;
}

export interface MostFrequentWorkout {
  name: string;
  count: number;
}

export interface MostFrequentResponse {
  month: string;
  items: MostFrequentWorkout[];
}

export interface XpDataPoint {
  date: string;
  xp: number;
}

export interface XpOverTimeResponse {
  month: string;
  range: string;
  startDate: string | null;
  endDate: string | null;
  totalXp: number;
  workoutsCount: number;
  maxXp: number;
  avgXpPerWorkout: number;
  dataPoints: number;
  firstDate: string | null;
  lastDate: string | null;
  series: XpDataPoint[];
}

const weeklySummaryCache = createAPICache<WeeklySummary>(60_000);
const calendarCache      = createAPICache<CalendarActivity>(120_000);
const workoutsListCache  = createAPICache<PaginatedWorkouts>(60_000);

/**
 * Mark cached "workouts list" entries stale for a user + calendar day (YYYY-MM-DD).
 * Call after a workout completes so daily challenge progress refreshes.
 */
export function invalidateWorkoutsListForUserDay(userId: number, yyyyMmDd: string) {
  for (let page = 1; page <= 10; page++) {
    for (const pageSize of [10, 20, 50, 100]) {
      workoutsListCache.invalidate(`wl:${userId}:${yyyyMmDd}::${page}:${pageSize}`);
    }
  }
}

export const historyService = {
  /**
   * Get weekly summary with comparison to previous week
   * @param userId User ID to get summary for
   * @param weekStart Optional week start date (YYYY-MM-DD), defaults to current week
   */
  getWeeklySummary: async (userId: number, weekStart?: string): Promise<WeeklySummary> => {
    const key = `ws:${userId}:${weekStart ?? 'current'}`;
    const fresh = weeklySummaryCache.getFresh(key);
    if (fresh) return fresh;

    const stale = weeklySummaryCache.get(key);
    const params = new URLSearchParams({ user_id: userId.toString() });
    if (weekStart) params.append('week_start', weekStart);
    const promise = httpClient
      .get<WeeklySummary>(`/api/v1/history/weekly-summary?${params.toString()}`)
      .then((r) => { weeklySummaryCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  /**
   * Get calendar activity for a specific month
   * @param userId User ID to get calendar for
   * @param month Month in YYYY-MM format
   */
  getCalendarActivity: async (userId: number, month: string): Promise<CalendarActivity> => {
    const key = `cal:${userId}:${month}`;
    const fresh = calendarCache.getFresh(key);
    if (fresh) return fresh;

    const stale = calendarCache.get(key);
    const params = new URLSearchParams({ user_id: userId.toString(), month });
    const promise = httpClient
      .get<CalendarActivity>(`/api/v1/history/calendar?${params.toString()}`)
      .then((r) => { calendarCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  /**
   * Get paginated list of workouts
   * @param userId User ID to get workouts for
   * @param date Optional date filter (YYYY-MM-DD)
   * @param month Optional month filter (YYYY-MM); ignored if date is set
   * @param page Page number (default: 1)
   * @param pageSize Items per page (default: 10)
   */
  getWorkoutsList: async (
    userId: number,
    date?: string,
    month?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedWorkouts> => {
    const key = `wl:${userId}:${date ?? ''}:${month ?? ''}:${page}:${pageSize}`;
    const fresh = workoutsListCache.getFresh(key);
    if (fresh) return fresh;

    const stale = workoutsListCache.get(key);
    const params = new URLSearchParams({
      user_id: userId.toString(),
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (date) params.append('date', date);
    else if (month) params.append('month', month);
    const promise = httpClient
      .get<PaginatedWorkouts>(`/api/v1/history/workouts?${params.toString()}`)
      .then((r) => { workoutsListCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  /**
   * Get most frequent workout types for a month
   * @param userId User ID to get data for
   * @param month Month in YYYY-MM format
   */
  getMostFrequent: async (userId: number, month: string): Promise<MostFrequentResponse> => {
    const params = new URLSearchParams({
      user_id: userId.toString(),
      month: month,
    });
    const response = await httpClient.get<MostFrequentResponse>(
      `/api/v1/history/most-frequent?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get XP over time for a month
   * @param userId User ID to get data for
   * @param month Month in YYYY-MM format
   */
  getXpOverTime: async (userId: number, month: string): Promise<XpOverTimeResponse> => {
    const params = new URLSearchParams({
      user_id: userId.toString(),
      month: month,
    });
    const response = await httpClient.get<XpOverTimeResponse>(
      `/api/v1/history/xp-over-time?${params.toString()}`
    );
    return response.data;
  },
};
