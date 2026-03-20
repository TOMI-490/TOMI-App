/**
 * HomeScreen Service
 *
 * Daily Challenges — built from workout types in the API + today's history
 * (completed when the user has logged a workout of that type today).
 *
 * Badges (Section 6) are handled by gamificationService.
 */

import { workoutTypeService } from './workoutType.service';
import { historyService, invalidateWorkoutsListForUserDay } from './history.service';
import {
  todayLocalYyyyMmDd,
  pickDailyWorkoutTypes,
  buildDailyQuestsFromTypes,
} from '../../utils/dailyWorkoutChallenges';

export interface DailyQuest {
  id: string;
  title: string;
  /** Short line from workout type description or fallback copy */
  subtitle?: string;
  xp_reward: number;
  progress: number;
  max_value: number;
  icon_name: string;
  color_token: string;
  completed: boolean;
  /** When set, home/workout can start this challenge */
  workoutTypeId?: number;
}

export const homeScreenService = {
  /**
   * Three deterministic daily challenges per user per calendar day.
   * @param forceRefresh — bypass history cache for today's list (after workout)
   */
  async getDailyQuests(userId: number, options?: { forceRefresh?: boolean }): Promise<DailyQuest[]> {
    const dayKey = todayLocalYyyyMmDd();
    if (options?.forceRefresh) {
      invalidateWorkoutsListForUserDay(userId, dayKey);
    }

    const [types, page] = await Promise.all([
      workoutTypeService.getAll(),
      historyService.getWorkoutsList(userId, dayKey, undefined, 1, 50).catch(() => ({
        items: [] as { type: string }[],
      })),
    ]);

    if (!types.length) return [];

    const picked = pickDailyWorkoutTypes(types, userId, dayKey, 3);
    const completedNames = new Set(
      (page.items ?? []).map((i) => (i.type || '').trim().toLowerCase()).filter(Boolean),
    );
    return buildDailyQuestsFromTypes(picked, completedNames, dayKey);
  },
};
