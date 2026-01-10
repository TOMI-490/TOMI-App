import { httpClient } from '../httpClient';
import type { UserResponseDto, UserCreateDto, UserUpdateDto } from '../../models/dto/User.dto';

type Id = string | number;

export const userService = {
  getAll: (params?: Record<string, any>) => {
    console.log('[UserService] 👥 Fetching all users with params:', params);
    return httpClient.get<UserResponseDto[]>('/api/v1/users', { params }).then(r => {
      console.log('[UserService] ✓ Fetched', r.data.length, 'users');
      return r.data;
    });
  },
  
  getById: (id: Id) => {
    console.log('[UserService] 👤 Fetching user by ID:', id);
    return httpClient.get<UserResponseDto>(`/api/v1/users/${id}`).then(r => {
      console.log('[UserService] ✓ User fetched:', r.data.email);
      return r.data;
    });
  },
  
  getByAuthId: (authId: string) => {
    console.log('[UserService] 🔑 Fetching user by authId:', authId);
    return httpClient.get<UserResponseDto>(`/api/v1/users/by-auth/${authId}`).then(r => {
      console.log('[UserService] ✓ User fetched by authId:', r.data.email);
      return r.data;
    });
  },
  
  getByEmail: (email: string) => {
    console.log('[UserService] ✉️ Fetching user by email:', email);
    return httpClient.get<UserResponseDto>(`/api/v1/users/by-email`, { params: { email } }).then(r => {
      console.log('[UserService] ✓ User fetched by email:', r.data.email);
      return r.data;
    });
  },
  
  checkEmail: (email: string) =>
    httpClient.get<{ exists: boolean; email: string }>(`/api/v1/users/check-email/${encodeURIComponent(email)}`).then(r => r.data),
  
  create: (data: UserCreateDto) =>
    httpClient.post<UserResponseDto>('/api/v1/users', data).then(r => r.data),
  
  update: (id: Id, data: UserUpdateDto) =>
    httpClient.put<UserResponseDto>(`/api/v1/users/${id}`, data).then(r => r.data),
  
  updateLanguage: (id: Id, language: 'en' | 'fr') =>
    httpClient.patch<UserResponseDto>(`/api/v1/users/${id}/language`, { language }).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/users/${id}`).then(r => r.data),
  
  // Dashboard aggregated data
  getDashboard: (userId: Id) => {
    console.log('[UserService] 🎯 Fetching dashboard data for user:', userId);
    return httpClient.get<{
      user: UserResponseDto;
      profile?: any;
      tomi?: any;
      todayProgress?: any;
    }>(`/api/v1/dashboard/${userId}`).then(r => {
      console.log('[UserService] ✓ Dashboard data received');
      console.log('[UserService]   - User:', r.data.user?.email);
      console.log('[UserService]   - Profile:', r.data.profile ? 'present' : 'missing');
      console.log('[UserService]   - TOMI:', r.data.tomi ? 'present' : 'missing');
      console.log('[UserService]   - Today Progress:', JSON.stringify(r.data.todayProgress));
      return r.data;
    });
  },
};
