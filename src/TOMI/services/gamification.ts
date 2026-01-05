import { httpClient } from './httpClient';

// ==================== TYPES ====================

export interface EarnedBadge {
  id: number;
  badgeId: number;
  achievement: string;
  name: string;
  description: string;
  awardedDate: string;
}

export interface UpcomingBadge {
  id: string;
  achievement: string;
  name: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
}

export interface ProgressRing {
  key: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  goalId?: number;
}

export interface LeaderboardEntry {
  userId: number;
  userName: string;
  score: number;
  rank: number;
}

export interface LeaderboardPreview {
  leaderboardId: number;
  name: string;
  scope: string;
  userEntry?: LeaderboardEntry;
  top3: LeaderboardEntry[];
}

export interface GamificationData {
  badgesEarned: EarnedBadge[];
  badgesUpcoming: UpcomingBadge[];
  progressRings: ProgressRing[];
  leaderboards: LeaderboardPreview[];
}

// ==================== SERVICE ====================

export const gamificationService = {
  /**
   * Get comprehensive gamification data for a user
   * @param userId - The user's ID
   * @returns Gamification data including badges, progress rings, and leaderboards
   */
  async getGamificationData(userId: number): Promise<GamificationData> {
    console.log('[GamificationService] 🎮 Fetching gamification data for user:', userId);
    try {
      const response = await httpClient.get<GamificationData>(`/api/v1/gamification/${userId}`);
      const data = response.data;
      console.log('[GamificationService] ✓ Gamification data received:');
      console.log('[GamificationService]   - Earned badges:', data.badgesEarned?.length || 0);
      console.log('[GamificationService]   - Upcoming badges:', data.badgesUpcoming?.length || 0);
      console.log('[GamificationService]   - Progress rings:', data.progressRings?.length || 0);
      console.log('[GamificationService]   - Leaderboards:', data.leaderboards?.length || 0);
      return data;
    } catch (error) {
      console.error('[GamificationService] ✗ Error fetching gamification data:', error);
      throw error;
    }
  },
};

export default gamificationService;
