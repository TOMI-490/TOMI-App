// Database type definitions matching the Supabase schema
export interface User {
  userId: number;
  email: string;
  name: string;
  country: string;
  unitSystem: string;
  language: string;
  created_at: string;
  authID: string;
  onBoardingComplete: boolean;
}

export interface Profile {
  profileId: number;
  userId: number;
  userAvatarId: number;
  bio: string;
  totalExercices: number;
  totalDistance: number;
  totalSteps: number;
  longestStreak: number;
}

export interface Avatar {
  avatarId: number;
  name: string;
  imageURL: string;
  animationURL: string;
  themeColor: string;
  isDefault: boolean;
  createdBy: string;
  created_at: string;
}

export interface UserAvatar {
  userAvatarId: number;
  userId: number;
  avatarId: number;
  nickname: string;
  level: number;
  xp: number;
  ageDays: number;
  hungerLevel: number;
  sleepinessLevel: number;
  boredomeLevel: number;
  happinessLevel: number;
  isActive: boolean;
  lastUpdated: string;
  created_at: string;
}

export interface Goal {
  goalId: number;
  userId: number;
  goalStatusId: number;
  goalTypeId: number;
  targetValue: number;
  period: string;
  progressValue: number;
  startDate: string;
  endDate: string;
  lastUpdated: string;
}

export interface GoalType {
  goalTypeId: number;
  name: string;
  description: string;
  defaultUnit: string;
}

export interface GoalStatus {
  goalStatusId: number;
  name: string;
}

export interface Streak {
  StreakId: number;
  userId: number;
  metric: string;
  current: number | null;
  longest: number | null;
}

export interface Workout {
  workoutId: number;
  userId: number;
  workoutTypeId: number;
  start: string;
  end: string;
  deviceId: number;
}

export interface WorkoutType {
  workoutTypeId: number;
  name: string;
  description: string;
}

export interface WatchDevice {
  DeviceId: number;
  userId: number;
  serialNo: string;
  model: string;
  nickname: string;
  created_at: string;
}

export interface Notification {
  notifId: number;
  userId: number;
  notifType: string;
  description: string;
  isRead: boolean;
}

export interface Leaderboard {
  leaderboardId: number;
  name: string;
  scope: string;
  startDate: string;
  endDate: string;
  userId: number;
  score: number;
  rank: number;
}

export interface Friend {
  id: number;
  userId: number;
  friendUserId: number;
  statusId: number;
  friendshipDate: string;
}

export interface FriendStatus {
  statusId: number;
  status: string;
  description: string;
}

export interface Badge {
  badgeId: number;
  achievement: string;
  name: string;
  description: string;
}

export interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  awardedDate: string;
}

// Joined/Combined types for Dashboard
export interface TOMIData extends UserAvatar {
  avatar: Avatar;
}

export interface GoalWithTypes extends Goal {
  goalType: GoalType;
  goalStatus: GoalStatus;
}

export interface WorkoutWithDetails extends Workout {
  workoutType: WorkoutType;
  device: WatchDevice;
}

export interface FriendWithStatus extends Friend {
  friendStatus: FriendStatus;
  friendUser: User;
}

export interface UserBadgeWithDetails extends UserBadge {
  badge: Badge;
}

// Today's Progress DTO
export interface TodayProgressDTO {
  workoutsCount: number;
  minutes: number;
  xpEarned: number;
}

// Main Dashboard DTO
export interface DashboardDTO {
  user: User;
  profile: Profile | null;
  tomi: TOMIData | null;
  goals: GoalWithTypes[];
  streaks: Streak[];
  recentWorkouts: WorkoutWithDetails[];
  notifications: Notification[];
  leaderboard: Leaderboard[];
  friends: FriendWithStatus[];
  badges: UserBadgeWithDetails[];
  todayProgress: TodayProgressDTO;
}

// Action payloads
export interface UpdateTomiNeedsPayload {
  hungerLevel?: number;
  sleepinessLevel?: number;
  boredomeLevel?: number;
  happinessLevel?: number;
}

export interface CreateWorkoutPayload {
  userId: number;
  workoutTypeId: number;
  start: string;
  end: string;
  deviceId: number;
}