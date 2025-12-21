import { httpClient } from '../httpClient';
import type { UserBadgeResponseDto, UserBadgeCreateDto, UserBadgeUpdateDto } from '../../models/dto/UserBadge.dto';

type Id = string | number;

export const userBadgeService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<UserBadgeResponseDto[]>('/api/v1/userBadges', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<UserBadgeResponseDto>(`/api/v1/userBadges/${id}`).then(r => r.data),
  
  create: (data: UserBadgeCreateDto) =>
    httpClient.post<UserBadgeResponseDto>('/api/v1/userBadges', data).then(r => r.data),
  
  update: (id: Id, data: UserBadgeUpdateDto) =>
    httpClient.put<UserBadgeResponseDto>(`/api/v1/userBadges/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/userBadges/${id}`).then(r => r.data),
};
