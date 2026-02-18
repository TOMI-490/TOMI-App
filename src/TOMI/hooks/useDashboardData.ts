/**
 * useDashboard Hook
 * Fetches and manages dashboard data from backend
 */

import { useState, useEffect, useRef } from 'react';
import { UserResponseDto } from '../models/dto/User.dto';
import { ProfileResponseDto } from '../models/dto/Profile.dto';
import { UserAvatarResponseDto } from '../models/dto/UserAvatar.dto';
import { StreakResponseDto } from '../models/dto/Streak.dto';
import { WorkoutResponseDto } from '../models/dto/Workout.dto';
import { userService } from '../services/resources/user.service';

// Simple in-memory cache for dashboard data
const dashboardCache = new Map<number, { data: DashboardData; timestamp: number }>();
const CACHE_DURATION = 15000; // 15 seconds

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

/**
 * Hook to fetch dashboard data for a user
 * Returns user + profile + active TOMI avatar (if available)
 */
export function useDashboard(user: UserResponseDto | null): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = async (forceRefresh = false) => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = dashboardCache.get(user.userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('[useDashboard] 💾 Using cached dashboard data');
        setData(cached.data);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useDashboard] 📊 Fetching fresh dashboard data...');
      const dashboardData = await userService.getDashboard(user.userId);
      console.log('[useDashboard] ✓ Dashboard data received');
      console.log('[useDashboard]   - TOMI XP:', dashboardData.tomi?.xp || 'N/A');
      console.log('[useDashboard]   - TOMI Level:', dashboardData.tomi?.level || 'N/A');
      console.log('[useDashboard]   - Today Progress:', dashboardData.todayProgress);
      
      // Cache the dashboard data
      dashboardCache.set(user.userId, { data: dashboardData, timestamp: Date.now() });
      
      setData(dashboardData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch dashboard data');
      setError(error);
      console.error('[useDashboard] ❌ Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  return {
    data,
    loading,
    error,
    refresh: () => fetchDashboard(true), // Force refresh when explicitly called
  };
}