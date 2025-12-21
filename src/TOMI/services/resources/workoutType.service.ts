import { httpClient } from '../httpClient';
import type { WorkoutTypeResponseDto, WorkoutTypeCreateDto, WorkoutTypeUpdateDto } from '../../models/dto/WorkoutType.dto';

type Id = string | number;

export const workoutTypeService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<WorkoutTypeResponseDto[]>('/api/v1/workoutTypes', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<WorkoutTypeResponseDto>(`/api/v1/workoutTypes/${id}`).then(r => r.data),
  
  create: (data: WorkoutTypeCreateDto) =>
    httpClient.post<WorkoutTypeResponseDto>('/api/v1/workoutTypes', data).then(r => r.data),
  
  update: (id: Id, data: WorkoutTypeUpdateDto) =>
    httpClient.put<WorkoutTypeResponseDto>(`/api/v1/workoutTypes/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/workoutTypes/${id}`).then(r => r.data),
};
