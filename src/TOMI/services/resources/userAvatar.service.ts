import { httpClient } from '../httpClient';
import type { UserAvatarResponseDto, UserAvatarCreateDto, UserAvatarUpdateDto } from '../../models/dto/UserAvatar.dto';

type Id = string | number;

export const userAvatarService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<UserAvatarResponseDto[]>('/api/v1/userAvatars', { params }).then(r => r.data),

  getById: (id: Id) =>
    httpClient.get<UserAvatarResponseDto>(`/api/v1/userAvatars/${id}`).then(r => r.data),

  // Fetch the active avatar for a specific user (includes avatar template details)
  getByUserId: (userId: Id) =>
    httpClient.get<UserAvatarResponseDto>(`/api/v1/userAvatars/user/${userId}`).then(r => r.data),

  create: (data: UserAvatarCreateDto) =>
    httpClient.post<UserAvatarResponseDto>('/api/v1/userAvatars', data).then(r => r.data),

  update: (id: Id, data: UserAvatarUpdateDto) =>
    httpClient.put<UserAvatarResponseDto>(`/api/v1/userAvatars/${id}`, data).then(r => r.data),

  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/userAvatars/${id}`).then(r => r.data),

  feed: (userId: Id) =>
    httpClient.post<UserAvatarResponseDto>(`/api/v1/userAvatars/user/${userId}/feed`).then(r => r.data),

  rest: (userId: Id) =>
    httpClient.post<UserAvatarResponseDto>(`/api/v1/userAvatars/user/${userId}/rest`).then(r => r.data),
};
