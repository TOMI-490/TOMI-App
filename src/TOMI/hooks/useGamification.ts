/**
 * useGamification Hook
 * Fetches and manages gamification data (badges, progress rings, leaderboards)
 */

import { useState, useEffect } from 'react';
import { gamificationService, GamificationData } from '../services/gamification';

export interface UseGamificationResult {
  data: GamificationData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch gamification data for a user
 * @param userId - The user's ID to fetch gamification data for
 * @returns Gamification data, loading state, error, and refresh function
 */
export function useGamification(userId: number | null | undefined): UseGamificationResult {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGamification = async () => {
    if (!userId) {
      console.log('[useGamification] No userId provided, skipping fetch');
      setData(null);
      setLoading(false);
      return;
    }

    console.log('[useGamification] 🎯 Starting gamification fetch for userId:', userId);
    try {
      setLoading(true);
      setError(null);

      const gamificationData = await gamificationService.getGamificationData(userId);
      console.log('[useGamification] ✓ Gamification data loaded successfully');
      setData(gamificationData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch gamification data');
      setError(error);
      console.error('[useGamification] ✗ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    data,
    loading,
    error,
    refresh: fetchGamification,
  };
}
