import { httpClient } from '../httpClient';

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

export const historyService = {
  /**
   * Get weekly summary with comparison to previous week
   * @param userId User ID to get summary for
   * @param weekStart Optional week start date (YYYY-MM-DD), defaults to current week
   */
  getWeeklySummary: async (userId: number, weekStart?: string): Promise<WeeklySummary> => {
    const params = new URLSearchParams({ user_id: userId.toString() });
    if (weekStart) {
      params.append('week_start', weekStart);
    }
    const response = await httpClient.get<WeeklySummary>(
      `/api/v1/history/weekly-summary?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get calendar activity for a specific month
   * @param userId User ID to get calendar for
   * @param month Month in YYYY-MM format
   */
  getCalendarActivity: async (userId: number, month: string): Promise<CalendarActivity> => {
    const params = new URLSearchParams({
      user_id: userId.toString(),
      month: month,
    });
    const response = await httpClient.get<CalendarActivity>(
      `/api/v1/history/calendar?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get paginated list of workouts
   * @param userId User ID to get workouts for
   * @param date Optional date filter (YYYY-MM-DD)
   * @param page Page number (default: 1)
   * @param pageSize Items per page (default: 10)
   */
  getWorkoutsList: async (
    userId: number,
    date?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedWorkouts> => {
    const params = new URLSearchParams({
      user_id: userId.toString(),
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (date) {
      params.append('date', date);
    }
    const response = await httpClient.get<PaginatedWorkouts>(
      `/api/v1/history/workouts?${params.toString()}`
    );
    return response.data;
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
