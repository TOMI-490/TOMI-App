export interface BadgeResponseDto {
  badgeId: number;
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
}

export interface BadgeCreateDto {
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
}

export interface BadgeUpdateDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  criteria?: string;
}
