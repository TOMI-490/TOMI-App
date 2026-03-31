import { httpClient } from '../httpClient';
import type { FriendResponseDto, FriendCreateDto, FriendUpdateDto } from '../../models/dto/Friend.dto';

type Id = string | number;

export const friendService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<FriendResponseDto[]>('/api/v1/friends', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<FriendResponseDto>(`/api/v1/friends/${id}`).then(r => r.data),
  
  create: (data: FriendCreateDto) =>
    httpClient.post<FriendResponseDto>('/api/v1/friends', data).then(r => r.data),
  
  update: (id: Id, data: FriendUpdateDto) =>
    httpClient.put<FriendResponseDto>(`/api/v1/friends/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/friends/${id}`).then(r => r.data),
};
