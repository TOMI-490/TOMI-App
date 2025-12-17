export interface WorkoutResponseDto {
  workoutId: number;
  userId: number;
  workoutTypeId: number;
  duration: number;
  caloriesBurned: number;
  distance?: number;
  averageHeartRate?: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface WorkoutCreateDto {
  userId: number;
  workoutTypeId: number;
  duration: number;
  caloriesBurned: number;
  distance?: number;
  averageHeartRate?: number;
  date: string;
  notes?: string;
}

export interface WorkoutUpdateDto {
  workoutTypeId?: number;
  duration?: number;
  caloriesBurned?: number;
  distance?: number;
  averageHeartRate?: number;
  date?: string;
  notes?: string;
}
