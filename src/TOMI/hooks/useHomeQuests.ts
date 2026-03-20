/**
 * useHomeQuests
 *
 * Daily challenges (home + workout tab) from workout types + today's history.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  homeScreenService,
  DailyQuest,
} from '../services/resources/homeScreen.service';
import { todayLocalYyyyMmDd } from '../utils/dailyWorkoutChallenges';

const CACHE_MS = 45_000;

export interface UseHomeQuestsResult {
  dailyQuests: DailyQuest[];
  loading: boolean;
  error: string | null;
  /** Re-fetch and bypass history cache (e.g. on screen focus after a workout) */
  refresh: () => Promise<void>;
}

export function useHomeQuests(
  userId: number | null | undefined,
): UseHomeQuestsResult {
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, { quests: DailyQuest[]; at: number }>>(new Map());

  const cacheKey = useCallback(
    () => (userId ? `${userId}:${todayLocalYyyyMmDd()}` : ''),
    [userId],
  );

  const fetchData = useCallback(
    async (force: boolean) => {
      if (!userId) return;

      const key = cacheKey();
      if (!force && key) {
        const hit = cacheRef.current.get(key);
        if (hit && Date.now() - hit.at < CACHE_MS) {
          setDailyQuests(hit.quests);
          setError(null);
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);

        const quests = await homeScreenService.getDailyQuests(userId, { forceRefresh: force });
        setDailyQuests(quests);
        if (key) {
          cacheRef.current.set(key, { quests, at: Date.now() });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('[useHomeQuests]', msg);
        setDailyQuests([]);
        setError('Could not load daily challenges.');
      } finally {
        setLoading(false);
      }
    },
    [userId, cacheKey],
  );

  useEffect(() => {
    if (!userId) {
      setDailyQuests([]);
      setError(null);
      return;
    }
    void fetchData(false);
  }, [userId, fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return { dailyQuests, loading, error, refresh };
}
