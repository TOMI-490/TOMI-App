/**
 * useHomeQuests
 *
 * Fetches daily quests for Section 5 of the HomeScreen.
 * Badges (Section 6) are now handled separately by useGamification.
 */

import { useState, useEffect } from 'react';
import {
  homeScreenService,
  DailyQuest,
} from '../services/resources/homeScreen.service';

export interface UseHomeQuestsResult {
  dailyQuests: DailyQuest[];
  loading:     boolean;
  error:       string | null;
}

export function useHomeQuests(
  userId: number | null | undefined,
): UseHomeQuestsResult {
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [loading, setLoading]         = useState<boolean>(false);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const quests = await homeScreenService.getDailyQuests(userId);
        if (!cancelled) setDailyQuests(quests);
      } catch (err: any) {
        if (!cancelled) {
          console.warn('[useHomeQuests] daily_quests:', err?.message);
          setDailyQuests([]);
          setError('Daily quests are coming soon.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [userId]);

  return { dailyQuests, loading, error };
}
