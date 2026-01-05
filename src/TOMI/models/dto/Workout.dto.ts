export interface WorkoutResponseDto {
  workoutId: number;
  userId: number;
  workoutTypeId: number;
  start: string;
  end: string | null;
  deviceId: number;
  xpAwarded?: number;
}

export interface WorkoutEndResponseDto {
  workoutId: number;
  userId: number;
  workoutTypeId: number;
  start: string;
  end: string | null;
  deviceId: number;
  xpAwarded: number;
}

export interface WorkoutCreateDto {
  userId: number;
  workoutTypeId: number;
  start: string;
  end: string;
  deviceId: number;
}

export interface WorkoutStartDto {
  userId: number;
  workoutTypeId: number;
  deviceId: number;
  xpAwarded?: number; // Optional XP from frontend (5-49)
}

export interface WorkoutUpdateDto {
  workoutTypeId?: number;
  start?: string;
  end?: string;
  deviceId?: number;
}

export interface WorkoutSummaryDto {
  workout: WorkoutResponseDto;
  workoutType: {
    workoutTypeId: number;
    name: string;
    description: string;
  };
  duration: number; // in seconds
  distance?: number; // in km
  calories?: number;
  xp?: number;
}
