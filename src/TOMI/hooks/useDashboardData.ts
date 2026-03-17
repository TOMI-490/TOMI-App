/**
 * useDashboard Hook
 * Fetches and manages dashboard data from backend
 *
 * Uses stale-while-revalidate: the last-known dashboard data is shown
 * instantly, and a background fetch updates it silently.
 */

import { useState, useEffect, useRef } from 'react';
import { UserResponseDto } from '../models/dto/User.dto';
import { ProfileResponseDto } from '../models/dto/Profile.dto';
import { UserAvatarResponseDto } from '../models/dto/UserAvatar.dto';
import { StreakResponseDto } from '../models/dto/Streak.dto';
import { WorkoutResponseDto } from '../models/dto/Workout.dto';
import { userService } from '../services/resources/user.service';

const dashboardCache = new Map<number, { data: DashboardData; timestamp: number }>();
const CACHE_DURATION = 15_000; // 15 seconds

/** Mark cache as stale so the next read refreshes in background (data stays visible) */
export function invalidateDashboardCache() {
  dashboardCache.forEach(entry => { entry.timestamp = 0; });
}

/** Pre-populate the dashboard cache from outside the hook (used by DataPreloader). */
export function populateDashboardCache(userId: number, data: DashboardData) {
  dashboardCache.set(userId, { data, timestamp: Date.now() });
}

export interface TodayProgressDto {
  workoutsCount: number;
  minutes: number;
  xpEarned: number;
}

export interface DashboardData {
  user: UserResponseDto;
  profile?: ProfileResponseDto;
  tomi?: UserAvatarResponseDto;
  streaks?: StreakResponseDto[];
  recentWorkouts?: WorkoutResponseDto[];
  todayProgress?: TodayProgressDto;
}

export interface UseDashboardResult {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useDashboard(user: UserResponseDto | null): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);

  const fetchDashboard = async (forceRefresh = false) => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    const cached = dashboardCache.get(user.userId);

    // Always serve cached data immediately (stale-while-revalidate)
    if (cached) {
      setData(cached.data);
      if (!forceRefresh && Date.now() - cached.timestamp < CACHE_DURATION) {
        setLoading(false);
        return;
      }
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    // Only block the UI with a loading state when there's no cached data to show
    if (!cached) setLoading(true);

    try {
      setError(null);
      const dashboardData = await userService.getDashboard(user.userId);

      dashboardCache.set(user.userId, { data: dashboardData, timestamp: Date.now() });
      setData(dashboardData);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch dashboard data');
      setError(e);
      console.error('[useDashboard] Error:', e);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  return { data, loading, error, refresh: () => fetchDashboard(true) };
}
