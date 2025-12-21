import { httpClient } from '../httpClient';
import type { AvatarResponseDto, AvatarCreateDto, AvatarUpdateDto } from '../../models/dto/Avatar.dto';

type Id = string | number;

export const avatarService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<AvatarResponseDto[]>('/api/v1/avatars', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<AvatarResponseDto>(`/api/v1/avatars/${id}`).then(r => r.data),
  
  create: (data: AvatarCreateDto) =>
    httpClient.post<AvatarResponseDto>('/api/v1/avatars', data).then(r => r.data),
  
  update: (id: Id, data: AvatarUpdateDto) =>
    httpClient.put<AvatarResponseDto>(`/api/v1/avatars/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/avatars/${id}`).then(r => r.data),
};
