export interface StreakResponseDto {
  streakId: number;
  userId: number;
  metric: string;
  current: number;
  longest: number;
}

export interface StreakCreateDto {
  userId: number;
  metric: string;
  current?: number;
  longest?: number;
}

export interface StreakUpdateDto {
  metric?: string;
  current?: number;
  longest?: number;
}
