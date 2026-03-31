import { httpClient } from '../httpClient';
import type { ProfileResponseDto, ProfileCreateDto, ProfileUpdateDto } from '../../models/dto/Profile.dto';

type Id = string | number;

export const profileService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<ProfileResponseDto[]>('/api/v1/profiles', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<ProfileResponseDto>(`/api/v1/profiles/${id}`).then(r => r.data),
  
  create: (data: ProfileCreateDto) =>
    httpClient.post<ProfileResponseDto>('/api/v1/profiles', data).then(r => r.data),
  
  update: (id: Id, data: ProfileUpdateDto) =>
    httpClient.put<ProfileResponseDto>(`/api/v1/profiles/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/profiles/${id}`).then(r => r.data),
};
