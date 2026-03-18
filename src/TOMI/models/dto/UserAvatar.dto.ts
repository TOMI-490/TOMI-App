export interface UserAvatarResponseDto {
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
  lastUpdated?: string;
  createdAt?: string;
  // Avatar details (when fetched with avatar join)
  avatarName?: string;
  imageUrl?: string;
  animationIdleUrl?: string;          // Idle / resting state GIF
  animationActiveUrl?: string;        // Active / happy state GIF
  animationPostWorkoutUrl?: string;   // Post-workout celebration GIF
  themeColor?: string;
  // Evolution
  evolutionNodeId?: number;
  evolutionStage?: 'baby' | 'teen' | 'adult';
  // XP progression (calculated on backend)
  currentLevelXp?: number;
  nextLevelXp?: number;
  xpProgress?: number; // Percentage 0-100
}

export interface UserAvatarCreateDto {
  userId: number;
  avatarId: number;
  nickname: string;
  level?: number;
  xp?: number;
  ageDays?: number;
  hungerLevel?: number;
  sleepinessLevel?: number;
  boredomeLevel?: number;
  happinessLevel?: number;
  isActive?: boolean;
}

export interface UserAvatarUpdateDto {
  nickname?: string;
  level?: number;
  xp?: number;
  ageDays?: number;
  hungerLevel?: number;
  sleepinessLevel?: number;
  boredomeLevel?: number;
  happinessLevel?: number;
  isActive?: boolean;
}
