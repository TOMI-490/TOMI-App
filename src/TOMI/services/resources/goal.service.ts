import { httpClient } from '../httpClient';
import type { GoalResponseDto, GoalCreateDto, GoalUpdateDto } from '../../models/dto/Goal.dto';

type Id = string | number;

export const goalService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<GoalResponseDto[]>('/api/v1/goals', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<GoalResponseDto>(`/api/v1/goals/${id}`).then(r => r.data),
  
  create: (data: GoalCreateDto) =>
    httpClient.post<GoalResponseDto>('/api/v1/goals', data).then(r => r.data),
  
  update: (id: Id, data: GoalUpdateDto) =>
    httpClient.put<GoalResponseDto>(`/api/v1/goals/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/goals/${id}`).then(r => r.data),
};
