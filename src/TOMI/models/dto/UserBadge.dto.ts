export interface UserBadgeResponseDto {
  id: number;
  userId: number;
  badgeId: number;
  awardedDate: string;
}

export interface UserBadgeCreateDto {
  userId: number;
  badgeId: number;
  awardedDate: string;
}

export interface UserBadgeUpdateDto {
  awardedDate?: string;
}
