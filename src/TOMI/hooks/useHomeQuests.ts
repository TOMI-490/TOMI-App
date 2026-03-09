/**
 * useHomeQuests
 *
 * Fetches daily quests and achievements preview from Supabase for use on the
 * HomeScreen (Sections 5 & 6 of the high-fidelity design).
 *
 * Both queries are fire-and-forget: if the Supabase table doesn't exist yet
 * the hook will surface a non-fatal `error` string and return empty arrays,
 * so the screen degrades gracefully instead of crashing.
 */

import { useState, useEffect } from 'react';
import {
  homeScreenService,
  DailyQuest,
  Achievement,
} from '../services/resources/homeScreen.service';

export interface UseHomeQuestsResult {
  dailyQuests:  DailyQuest[];
  achievements: Achievement[];
  loading:      boolean;
  /** Non-fatal: tables may not exist yet. Screen shows empty state, not crash. */
  error:        string | null;
}

export function useHomeQuests(
  userId: number | null | undefined,
): UseHomeQuestsResult {
  const [dailyQuests,  setDailyQuests]  = useState<DailyQuest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading,      setLoading]      = useState<boolean>(false);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [quests, achs] = await Promise.allSettled([
          homeScreenService.getDailyQuests(userId),
          homeScreenService.getAchievementsPreview(userId),
        ]);

        if (cancelled) return;

        if (quests.status === 'fulfilled') {
          setDailyQuests(quests.value);
        } else {
          console.warn('[useHomeQuests] daily_quests:', quests.reason?.message);
          setDailyQuests([]);
        }

        if (achs.status === 'fulfilled') {
          setAchievements(achs.value);
        } else {
          console.warn('[useHomeQuests] achievements:', achs.reason?.message);
          setAchievements([]);
        }

        // Report combined error if either query failed
        const failures = [quests, achs].filter(r => r.status === 'rejected');
        if (failures.length > 0) {
          setError('Some sections could not load yet — tables may be pending.');
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[useHomeQuests] unexpected error:', err);
          setError('Unable to load quests.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { dailyQuests, achievements, loading, error };
}
