import { httpClient } from '../httpClient';
import type { UserResponseDto, UserCreateDto, UserUpdateDto } from '../../models/dto/User.dto';

type Id = string | number;

export const userService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<UserResponseDto[]>('/api/v1/users', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<UserResponseDto>(`/api/v1/users/${id}`).then(r => r.data),
  
  create: (data: UserCreateDto) =>
    httpClient.post<UserResponseDto>('/api/v1/users', data).then(r => r.data),
  
  update: (id: Id, data: UserUpdateDto) =>
    httpClient.put<UserResponseDto>(`/api/v1/users/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/users/${id}`).then(r => r.data),
};
