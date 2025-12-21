import { httpClient } from '../httpClient';
import type { GoalTypeResponseDto, GoalTypeCreateDto, GoalTypeUpdateDto } from '../../models/dto/GoalType.dto';

type Id = string | number;

export const goalTypeService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<GoalTypeResponseDto[]>('/api/v1/goalTypes', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<GoalTypeResponseDto>(`/api/v1/goalTypes/${id}`).then(r => r.data),
  
  create: (data: GoalTypeCreateDto) =>
    httpClient.post<GoalTypeResponseDto>('/api/v1/goalTypes', data).then(r => r.data),
  
  update: (id: Id, data: GoalTypeUpdateDto) =>
    httpClient.put<GoalTypeResponseDto>(`/api/v1/goalTypes/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/goalTypes/${id}`).then(r => r.data),
};
