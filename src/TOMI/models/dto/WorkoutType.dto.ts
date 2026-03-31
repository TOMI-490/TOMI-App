export interface WorkoutTypeResponseDto {
  workoutTypeId: number;
  name: string;
  description: string;
}

export interface WorkoutTypeCreateDto {
  name: string;
  description: string;
}

export interface WorkoutTypeUpdateDto {
  name?: string;
  description?: string;
}
