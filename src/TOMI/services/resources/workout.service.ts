import { httpClient } from '../httpClient';
import type { WorkoutResponseDto, WorkoutCreateDto, WorkoutUpdateDto, WorkoutStartDto, WorkoutSummaryDto } from '../../models/dto/Workout.dto';
import type { WorkoutTypeResponseDto } from '../../models/dto/WorkoutType.dto';
import { workoutTypeService } from './workoutType.service';

type Id = string | number;

export const workoutService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<WorkoutResponseDto[]>('/api/v1/workouts', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<WorkoutResponseDto>(`/api/v1/workouts/${id}`).then(r => r.data),
  
  create: (data: WorkoutCreateDto) =>
    httpClient.post<WorkoutResponseDto>('/api/v1/workouts', data).then(r => r.data),
  
  update: (id: Id, data: WorkoutUpdateDto) =>
    httpClient.put<WorkoutResponseDto>(`/api/v1/workouts/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/workouts/${id}`).then(r => r.data),

  // Start a new workout (creates workout with end=null)
  startWorkout: async (data: WorkoutStartDto): Promise<WorkoutResponseDto> => {
    const response = await httpClient.post<WorkoutResponseDto>('/api/v1/workouts/start', data);
    return response.data;
  },

  // End an active workout (updates end timestamp)
  endWorkout: async (workoutId: Id): Promise<WorkoutResponseDto> => {
    const response = await httpClient.put<WorkoutResponseDto>(`/api/v1/workouts/${workoutId}/end`);
    return response.data;
  },

  // Get workout summary with computed fields
  getWorkoutSummary: async (workoutId: Id): Promise<WorkoutSummaryDto> => {
    const workout = await workoutService.getById(workoutId);
    const workoutType = await workoutTypeService.getById(workout.workoutTypeId);

    // Calculate duration
    const startTime = new Date(workout.start).getTime();
    const endTime = workout.end ? new Date(workout.end).getTime() : Date.now();
    const duration = Math.floor((endTime - startTime) / 1000); // in seconds

    // Mock values for now (can be replaced with backend-calculated values later)
    const mockCalories = Math.floor(duration / 60 * 10); // ~10 cal/min
    const mockXp = Math.floor(duration / 60 * 5); // ~5 xp/min

    return {
      workout,
      workoutType,
      duration,
      calories: mockCalories,
      xp: mockXp,
    };
  },

  // Get user's workouts
  getUserWorkouts: (userId: Id) =>
    httpClient.get<WorkoutResponseDto[]>(`/api/v1/workouts/user/${userId}`).then(r => r.data),
};
