import { httpClient } from '../httpClient';
import type { StreakResponseDto, StreakCreateDto, StreakUpdateDto } from '../../models/dto/Streak.dto';

type Id = string | number;

export const streakService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<StreakResponseDto[]>('/api/v1/streaks', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<StreakResponseDto>(`/api/v1/streaks/${id}`).then(r => r.data),
  
  create: (data: StreakCreateDto) =>
    httpClient.post<StreakResponseDto>('/api/v1/streaks', data).then(r => r.data),
  
  update: (id: Id, data: StreakUpdateDto) =>
    httpClient.put<StreakResponseDto>(`/api/v1/streaks/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/streaks/${id}`).then(r => r.data),
};
