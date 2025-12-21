import { httpClient } from '../httpClient';
import type { BadgeResponseDto, BadgeCreateDto, BadgeUpdateDto } from '../../models/dto/Badge.dto';

type Id = string | number;

export const badgeService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<BadgeResponseDto[]>('/api/v1/badges', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<BadgeResponseDto>(`/api/v1/badges/${id}`).then(r => r.data),
  
  create: (data: BadgeCreateDto) =>
    httpClient.post<BadgeResponseDto>('/api/v1/badges', data).then(r => r.data),
  
  update: (id: Id, data: BadgeUpdateDto) =>
    httpClient.put<BadgeResponseDto>(`/api/v1/badges/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/badges/${id}`).then(r => r.data),
};
