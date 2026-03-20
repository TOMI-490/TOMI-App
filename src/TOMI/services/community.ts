import { createHttpClient } from './httpClient';
import { createAPICache } from '../utils/apiCache';
import type {
  UserSearchResult,
  FriendListItem,
  FriendRequestsResponse,
  LeaderboardResponse,
  FriendVisitProfile,
  FriendStats,
  FriendRecentWorkoutsResponse,
  FriendDashboardSummary,
} from '../models/dto/Community.dto';

const httpClient = createHttpClient();

const friendsCache        = createAPICache<FriendListItem[]>(60_000);
const requestsCache       = createAPICache<FriendRequestsResponse>(30_000);
const leaderboardCache    = createAPICache<LeaderboardResponse>(60_000);
const dashboardCache      = createAPICache<FriendDashboardSummary>(90_000);
const friendWorkoutsCache = createAPICache<FriendRecentWorkoutsResponse>(90_000);

function invalidateSocialCaches() {
  friendsCache.clear();
  requestsCache.clear();
  leaderboardCache.clear();
}

export const communityService = {
  /**
   * Get list of friends for current user
   */
  getFriends: async (userId: number): Promise<FriendListItem[]> => {
    const key = `friends:${userId}`;
    const fresh = friendsCache.getFresh(key);
    if (fresh) return fresh;

    const stale = friendsCache.get(key);
    const promise = httpClient
      .get<FriendListItem[]>('/api/v1/community/friends', { params: { user_id: userId } })
      .then((r) => { friendsCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  getFriendRequests: async (userId: number): Promise<FriendRequestsResponse> => {
    const key = `requests:${userId}`;
    const fresh = requestsCache.getFresh(key);
    if (fresh) return fresh;

    const stale = requestsCache.get(key);
    const promise = httpClient
      .get<FriendRequestsResponse>('/api/v1/community/friend-requests', { params: { user_id: userId } })
      .then((r) => { requestsCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  /**
   * Search users by name or email
   */
  searchUsers: async (userId: number, query: string): Promise<UserSearchResult[]> => {
    const response = await httpClient.get<UserSearchResult[]>('/api/v1/community/users/search', {
      params: { user_id: userId, q: query },
    });
    return response.data;
  },

  /**
   * Send friend request to another user
   */
  sendFriendRequest: async (userId: number, toUserId: number): Promise<{ message: string; requestId: number }> => {
    const response = await httpClient.post<{ message: string; requestId: number }>(
      '/api/v1/community/friend-requests',
      { toUserId },
      { params: { user_id: userId } }
    );
    invalidateSocialCaches();
    return response.data;
  },

  acceptFriendRequest: async (userId: number, requestId: number): Promise<{ message: string }> => {
    const response = await httpClient.post<{ message: string }>(
      `/api/v1/community/friend-requests/${requestId}/accept`,
      {},
      { params: { user_id: userId } }
    );
    invalidateSocialCaches();
    return response.data;
  },

  declineFriendRequest: async (userId: number, requestId: number): Promise<{ message: string }> => {
    const response = await httpClient.post<{ message: string }>(
      `/api/v1/community/friend-requests/${requestId}/decline`,
      {},
      { params: { user_id: userId } }
    );
    invalidateSocialCaches();
    return response.data;
  },

  cancelFriendRequest: async (userId: number, requestId: number): Promise<{ message: string }> => {
    const response = await httpClient.post<{ message: string }>(
      `/api/v1/community/friend-requests/${requestId}/cancel`,
      {},
      { params: { user_id: userId } }
    );
    invalidateSocialCaches();
    return response.data;
  },

  /**
   * Get leaderboard data
   */
  getLeaderboard: async (
    userId: number,
    scope: 'friends' | 'global' = 'friends',
    period: 'week' | 'month' = 'week'
  ): Promise<LeaderboardResponse> => {
    const key = `lb:${userId}:${scope}:${period}`;
    const fresh = leaderboardCache.getFresh(key);
    if (fresh) return fresh;

    const stale = leaderboardCache.get(key);
    const promise = httpClient
      .get<LeaderboardResponse>('/api/v1/community/leaderboard', {
        params: { user_id: userId, scope, period },
      })
      .then((r) => { leaderboardCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  /**
   * Get friend profile for visiting
   */
  getFriendProfile: async (userId: number, friendId: number): Promise<FriendVisitProfile> => {
    const response = await httpClient.get<FriendVisitProfile>(`/api/v1/community/friends/${friendId}/profile`, {
      params: { user_id: userId },
    });
    return response.data;
  },

  /**
   * Get friend stats summary
   */
  getFriendStats: async (userId: number, friendId: number, range: 'week' | 'month' = 'week'): Promise<FriendStats> => {
    const response = await httpClient.get<FriendStats>(`/api/v1/community/friends/${friendId}/stats`, {
      params: { user_id: userId, range },
    });
    return response.data;
  },

  /**
   * Get friend recent workouts
   */
  getFriendRecentWorkouts: async (userId: number, friendId: number, limit: number = 5): Promise<FriendRecentWorkoutsResponse> => {
    const key = `workouts:${userId}:${friendId}:${limit}`;
    const fresh = friendWorkoutsCache.getFresh(key);
    if (fresh) return fresh;

    const stale = friendWorkoutsCache.get(key);
    const promise = httpClient
      .get<FriendRecentWorkoutsResponse>(`/api/v1/community/friends/${friendId}/workouts`, {
        params: { user_id: userId, limit },
      })
      .then((r) => { friendWorkoutsCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  removeFriend: async (userId: number, friendId: number): Promise<{ message: string }> => {
    const response = await httpClient.delete<{ message: string }>(`/api/v1/community/friends/${friendId}`, {
      params: { user_id: userId },
    });
    invalidateSocialCaches();
    return response.data;
  },

  getFriendDashboardSummary: async (userId: number, friendId: number): Promise<FriendDashboardSummary> => {
    const key = `dashboard:${userId}:${friendId}`;
    const fresh = dashboardCache.getFresh(key);
    if (fresh) return fresh;

    const stale = dashboardCache.get(key);
    const promise = httpClient
      .get<FriendDashboardSummary>(
        `/api/v1/community/friends/${friendId}/dashboard-summary`,
        { params: { user_id: userId } }
      )
      .then((r) => { dashboardCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  invalidateAllCaches: invalidateSocialCaches,
};
