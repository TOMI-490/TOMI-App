/**
 * Global Data Preloader
 *
 * Fires all API calls in parallel right after authentication,
 * populating both hook-level and service-level caches so every
 * tab page renders instantly without loading spinners.
 */

import { userService } from '../services/resources/user.service';
import { communityService } from '../services/community';
import { historyService } from '../services/resources/history.service';
import { userAvatarService } from '../services/resources/userAvatar.service';
import { avatarService } from '../services/resources/avatar.service';
import { workoutTypeService } from '../services/resources/workoutType.service';
import { gamificationService } from '../services/gamification';

import { populateUserCache } from '../hooks/useCurrentUser';
import { populateDashboardCache, type DashboardData } from '../hooks/useDashboardData';
import { populateGamificationCache } from '../hooks/useGamification';
import { populateAvatarPageCache } from '../hooks/useAvatarPage';
import { populateHistorySummaryCache, populateHistoryMonthCache } from '../pages/main/HistoryPage';
import { evolutionService } from '../services/resources/evolution.service';

let preloading = false;

/**
 * Preloads all critical API data in one parallel batch.
 *
 * 1. Resolves the user from authId (populates useCurrentUser cache)
 * 2. Fires all remaining calls via Promise.allSettled (populates
 *    service-level caches AND hook-level caches)
 *
 * Safe to call multiple times — subsequent calls are no-ops while
 * a preload is already in flight.
 */
export async function preloadAllData(authId: string): Promise<void> {
  if (preloading) return;
  preloading = true;

  const t0 = Date.now();
  console.log('[DataPreloader] Starting global preload…');

  try {
    // ── Step 1: resolve user ──────────────────────────────────
    const user = await userService.getByAuthId(authId);

    populateUserCache(authId, user);
    console.log(`[DataPreloader] User resolved in ${Date.now() - t0}ms`);

    const userId = user.userId;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // ── Step 2: fire everything in parallel (same services the tabs use) ──
    const results = await Promise.allSettled([
      // HomePage — dashboard → useDashboard cache
      userService.getDashboard(userId).then((data: DashboardData) => {
        populateDashboardCache(userId, data);
      }),

      // HomePage + AvatarPage — gamification → useGamification cache
      gamificationService.getGamificationData(userId).then((data) => {
        populateGamificationCache(userId, data);
      }),

      // AvatarPage — same as useAvatarPage / userAvatarService.getByUserId
      userAvatarService.getByUserId(userId).then((avatar) => {
        populateAvatarPageCache(userId, avatar);
      }),

      // AvatarPage evolution tab — evolutionService APICache (same as AvatarPage / Evolve flows)
      evolutionService.getEvolutionState(userId),

      // CommunityPage — friends & requests
      communityService.getFriends(userId),
      communityService.getFriendRequests(userId),
      communityService.getLeaderboard(userId, 'friends', 'week'),

      // HistoryPage — warm service + HistoryPage month caches
      historyService.getWeeklySummary(userId).then((summary) => {
        populateHistorySummaryCache(userId, summary);
      }),
      Promise.all([
        historyService.getCalendarActivity(userId, currentMonth),
        historyService.getWorkoutsList(userId, undefined, currentMonth, 1, 50),
      ]).then(([calendar, workoutsList]) => {
        populateHistoryMonthCache(userId, currentMonth, calendar.activeDates, workoutsList.items);
      }),

      avatarService.getAll(),

      // Workout tab — types list
      workoutTypeService.getAll(),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
    const rejected = results.filter((r) => r.status === 'rejected').length;

    console.log(
      `[DataPreloader] Done in ${Date.now() - t0}ms — ${fulfilled} ok, ${rejected} failed`,
    );

    if (rejected > 0) {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.warn(`[DataPreloader] Call #${i} failed:`, r.reason);
        }
      });
    }
  } catch (err) {
    console.error('[DataPreloader] Fatal error during preload:', err);
  } finally {
    preloading = false;
  }
}
