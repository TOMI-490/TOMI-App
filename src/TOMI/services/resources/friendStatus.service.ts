import { httpClient } from '../httpClient';
import type { FriendStatusResponseDto, FriendStatusCreateDto, FriendStatusUpdateDto } from '../../models/dto/FriendStatus.dto';

type Id = string | number;

export const friendStatusService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<FriendStatusResponseDto[]>('/api/v1/friendStatus', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<FriendStatusResponseDto>(`/api/v1/friendStatus/${id}`).then(r => r.data),
  
  create: (data: FriendStatusCreateDto) =>
    httpClient.post<FriendStatusResponseDto>('/api/v1/friendStatus', data).then(r => r.data),
  
  update: (id: Id, data: FriendStatusUpdateDto) =>
    httpClient.put<FriendStatusResponseDto>(`/api/v1/friendStatus/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/friendStatus/${id}`).then(r => r.data),
};
