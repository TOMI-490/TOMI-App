import { httpClient } from '../httpClient';
import type { GoalStatusResponseDto, GoalStatusCreateDto, GoalStatusUpdateDto } from '../../models/dto/GoalStatus.dto';

type Id = string | number;

export const goalStatusService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<GoalStatusResponseDto[]>('/api/v1/goalStatus', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<GoalStatusResponseDto>(`/api/v1/goalStatus/${id}`).then(r => r.data),
  
  create: (data: GoalStatusCreateDto) =>
    httpClient.post<GoalStatusResponseDto>('/api/v1/goalStatus', data).then(r => r.data),
  
  update: (id: Id, data: GoalStatusUpdateDto) =>
    httpClient.put<GoalStatusResponseDto>(`/api/v1/goalStatus/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/goalStatus/${id}`).then(r => r.data),
};
