import { httpClient } from '../httpClient';
import { createAPICache } from '../../utils/apiCache';
import type { WorkoutResponseDto, WorkoutCreateDto, WorkoutUpdateDto, WorkoutStartDto, WorkoutSummaryDto } from '../../models/dto/Workout.dto';
import type { WorkoutTypeResponseDto } from '../../models/dto/WorkoutType.dto';
import { workoutTypeService } from './workoutType.service';

const summaryCache = createAPICache<WorkoutSummaryDto>(120_000); // 2 min

type Id = string | number;

export const workoutService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<WorkoutResponseDto[]>('/api/v1/workouts', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<WorkoutResponseDto>(`/api/v1/workouts/${id}`).then(r => r.data),
  
  getWorkoutById: (id: Id) =>
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

  // End an active workout (updates end timestamp and awards XP on backend)
  endWorkout: async (workoutId: Id): Promise<{ workout: WorkoutResponseDto; xpAwarded: number }> => {
    console.log('[WorkoutService] 🏁 Ending workout...', workoutId);
    
    // End the workout - backend handles XP awarding (send empty body)
    const response = await httpClient.post<WorkoutResponseDto & { xpAwarded: number }>(`/api/v1/workouts/${workoutId}/end`, {});
    const { xpAwarded, ...workout } = response.data;
    
    console.log('[WorkoutService] ✓ Workout ended (backend processed)');
    console.log('[WorkoutService]   - Start:', workout.start);
    console.log('[WorkoutService]   - End:', workout.end);
    console.log('[WorkoutService]   - XP Awarded:', xpAwarded);
    
    return { workout, xpAwarded };
  },

  getWorkoutSummary: async (workoutId: Id): Promise<WorkoutSummaryDto> => {
    const cached = summaryCache.getFresh(`${workoutId}`);
    if (cached) return cached;

    const workout = await workoutService.getById(workoutId);
    const workoutType = await workoutTypeService.getById(workout.workoutTypeId);

    // Calculate duration
    const startTime = new Date(workout.start).getTime();
    const endTime = workout.end ? new Date(workout.end).getTime() : Date.now();
    const duration = Math.floor((endTime - startTime) / 1000); // in seconds

    // Use actual XP from backend if available, otherwise calculate as 1 XP per minute
    const actualXp = workout.xpAwarded ?? Math.floor(duration / 60);
    
    // Mock calories for now (can be replaced with backend-calculated values later)
    const mockCalories = Math.floor(duration / 60 * 10); // ~10 cal/min

    const summary: WorkoutSummaryDto = {
      workout,
      workoutType,
      duration,
      calories: mockCalories,
      xp: actualXp,
    };
    summaryCache.set(`${workoutId}`, summary);
    return summary;
  },

  // Get user's workouts
  getUserWorkouts: (userId: Id) =>
    httpClient.get<WorkoutResponseDto[]>(`/api/v1/workouts/user/${userId}`).then(r => r.data),
};
