import { httpClient } from '../httpClient';
import type { WorkoutResponseDto, WorkoutCreateDto, WorkoutUpdateDto } from '../../models/dto/Workout.dto';

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
};
