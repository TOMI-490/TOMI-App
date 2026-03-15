/**
 * HomeScreen Service
 *
 * Daily Quests (Section 5) — not yet implemented on the backend.
 * Returns empty arrays until a backend endpoint is created.
 *
 * Badges/Achievements (Section 6) are handled by gamificationService
 * via the REST API at /api/v1/gamification/:userId.
 */

export interface DailyQuest {
  id: string;
  title: string;
  xp_reward: number;
  progress: number;
  max_value: number;
  icon_name: string;
  color_token: string;
  completed: boolean;
}

export const homeScreenService = {
  /**
   * TODO: wire to backend endpoint once /api/v1/quests/:userId is implemented.
   * For now returns an empty array so the UI shows the empty state gracefully.
   */
  async getDailyQuests(_userId: number): Promise<DailyQuest[]> {
    return [];
  },
};
