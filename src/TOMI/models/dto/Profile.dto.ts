export interface ProfileResponseDto {
  profileId: number;
  userId: number;
  totalWorkouts: number;
  totalCalories: number;
  totalDistance: number;
  totalDuration: number;
  averageHeartRate?: number;
  level: number;
  xp: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProfileCreateDto {
  userId: number;
  totalWorkouts?: number;
  totalCalories?: number;
  totalDistance?: number;
  totalDuration?: number;
  averageHeartRate?: number;
  level?: number;
  xp?: number;
}

export interface ProfileUpdateDto {
  totalWorkouts?: number;
  totalCalories?: number;
  totalDistance?: number;
  totalDuration?: number;
  averageHeartRate?: number;
  level?: number;
  xp?: number;
}
