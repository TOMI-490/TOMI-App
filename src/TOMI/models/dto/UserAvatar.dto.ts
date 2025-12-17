export interface UserAvatarResponseDto {
  userAvatarId: number;
  userId: number;
  avatarId: number;
  currentLevel: number;
  currentXP: number;
  mood: string;
  customizations?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface UserAvatarCreateDto {
  userId: number;
  avatarId: number;
  currentLevel?: number;
  currentXP?: number;
  mood?: string;
  customizations?: Record<string, any>;
}

export interface UserAvatarUpdateDto {
  currentLevel?: number;
  currentXP?: number;
  mood?: string;
  customizations?: Record<string, any>;
}
