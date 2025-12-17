export interface UserBadgeResponseDto {
  userBadgeId: number;
  userId: number;
  badgeId: number;
  earnedAt: string;
}

export interface UserBadgeAwardDto {
  userId: number;
  badgeId: number;
}
