// Community-related DTOs for TOMI Frontend

export interface UserSearchResult {
  userId: number;
  displayName: string;
  level?: number;
  avatarUrl?: string;
  relationship: 'none' | 'friends' | 'incoming_request' | 'outgoing_request' | 'blocked';
}

export interface FriendListItem {
  userId: number;
  displayName: string;
  level?: number;
  avatarUrl?: string;
}

export interface FriendRequestItem {
  requestId: number;
  userId: number;
  displayName: string;
  level?: number;
  avatarUrl?: string;
  requestDate?: string;
}

export interface FriendRequestsResponse {
  incoming: FriendRequestItem[];
  outgoing: FriendRequestItem[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  xp: number;
  level?: number;
  avatarUrl?: string;
}

export interface CurrentUserLeaderboard {
  rank: number;
  xp: number;
  level?: number;
}

export interface LeaderboardResponse {
  scope: 'friends' | 'global';
  period: 'week' | 'month';
  entries: LeaderboardEntry[];
  currentUser?: CurrentUserLeaderboard;
}

export interface FriendVisitProfile {
  userId: number;
  displayName: string;
  level?: number;
  avatarUrl?: string;
  avatarImageUrl?: string;
  avatarPreviewUrl?: string;
  homeSceneId?: string;
  homePreviewUrl?: string;
  bio?: string;
  totalExercises?: number;
  totalDistance?: number;
  totalSteps?: number;
  longestStreak?: number;
}

export interface FriendStats {
  range: 'week' | 'month';
  workoutsCount: number;
  minutesTotal: number;
  xpTotal: number;
}

export interface FriendRecentWorkout {
  id: number;
  type: string;
  startedAt: string;
  durationMinutes: number;
  xpEarned?: number;
  calories?: number;
  avgHr?: number;
  exercisesCount?: number;
}

export interface FriendRecentWorkoutsResponse {
  items: FriendRecentWorkout[];
}

export interface CreateFriendRequest {
  toUserId: number;
}

// Friend Dashboard Summary DTOs
export interface XpProgress {
  currentXp: number;
  nextLevelXp: number;
  progress: number; // Percentage 0-100
}

export interface StreakInfo {
  days: number;
  label: string; // e.g., "5 days streak" or "No streak"
}

export interface ThisWeekStats {
  workoutsCount: number;
  minutesTotal: number;
  xpTotal: number;
}

export interface FriendDashboardSummary {
  userId: number;
  displayName: string;
  level: number;
  avatarNickname: string;
  avatarImageUrl?: string;
  themeColor?: string;
  xp: XpProgress;
  streak: StreakInfo;
  thisWeek: ThisWeekStats;
}

