import { createHttpClient } from './httpClient';
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

/**
 * Community API Service
 * Handles all community-related API calls (friends, leaderboard, user search)
 */
export const communityService = {
  /**
   * Get list of friends for current user
   */
  getFriends: async (userId: number): Promise<FriendListItem[]> => {
    const response = await httpClient.get<FriendListItem[]>('/api/v1/community/friends', {
      params: { user_id: userId },
    });
    return response.data;
  },

  /**
   * Get friend requests (incoming and outgoing)
   */
  getFriendRequests: async (userId: number): Promise<FriendRequestsResponse> => {
    const response = await httpClient.get<FriendRequestsResponse>('/api/v1/community/friend-requests', {
      params: { user_id: userId },
    });
    return response.data;
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
    return response.data;
  },

  /**
   * Accept incoming friend request
   */
  acceptFriendRequest: async (userId: number, requestId: number): Promise<{ message: string }> => {
    const response = await httpClient.post<{ message: string }>(
      `/api/v1/community/friend-requests/${requestId}/accept`,
      {},
      { params: { user_id: userId } }
    );
    return response.data;
  },

  /**
   * Decline incoming friend request
   */
  declineFriendRequest: async (userId: number, requestId: number): Promise<{ message: string }> => {
    const response = await httpClient.post<{ message: string }>(
      `/api/v1/community/friend-requests/${requestId}/decline`,
      {},
      { params: { user_id: userId } }
    );
    return response.data;
  },

  /**
   * Cancel outgoing friend request
   */
  cancelFriendRequest: async (userId: number, requestId: number): Promise<{ message: string }> => {
    const response = await httpClient.post<{ message: string }>(
      `/api/v1/community/friend-requests/${requestId}/cancel`,
      {},
      { params: { user_id: userId } }
    );
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
    const response = await httpClient.get<LeaderboardResponse>('/api/v1/community/leaderboard', {
      params: { user_id: userId, scope, period },
    });
    return response.data;
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
    const response = await httpClient.get<FriendRecentWorkoutsResponse>(`/api/v1/community/friends/${friendId}/workouts`, {
      params: { user_id: userId, limit },
    });
    return response.data;
  },

  /**
   * Remove friend
   */
  removeFriend: async (userId: number, friendId: number): Promise<{ message: string }> => {
    const response = await httpClient.delete<{ message: string }>(`/api/v1/community/friends/${friendId}`, {
      params: { user_id: userId },
    });
    return response.data;
  },

  /**
   * Get friend dashboard summary (for friend visit page)
   * Returns dashboard-style data with level, XP progress, streak, and this week stats
   */
  getFriendDashboardSummary: async (userId: number, friendId: number): Promise<FriendDashboardSummary> => {
    const response = await httpClient.get<FriendDashboardSummary>(
      `/api/v1/community/friends/${friendId}/dashboard-summary`,
      { params: { user_id: userId } }
    );
    return response.data;
  },
};
