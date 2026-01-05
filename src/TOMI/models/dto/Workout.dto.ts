export interface WorkoutResponseDto {
  workoutId: number;
  userId: number;
  workoutTypeId: number;
  start: string;
  end: string;
  deviceId: number;
}

export interface WorkoutCreateDto {
  userId: number;
  workoutTypeId: number;
  start: string;
  end: string;
  deviceId: number;
}

export interface WorkoutUpdateDto {
  workoutTypeId?: number;
  start?: string;
  end?: string;
  deviceId?: number;
}
