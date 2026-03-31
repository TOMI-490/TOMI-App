import { httpClient } from '../httpClient';
import type { NotificationResponseDto, NotificationCreateDto, NotificationUpdateDto } from '../../models/dto/Notification.dto';

type Id = string | number;

export const notificationService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<NotificationResponseDto[]>('/api/v1/notifications', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<NotificationResponseDto>(`/api/v1/notifications/${id}`).then(r => r.data),
  
  create: (data: NotificationCreateDto) =>
    httpClient.post<NotificationResponseDto>('/api/v1/notifications', data).then(r => r.data),
  
  update: (id: Id, data: NotificationUpdateDto) =>
    httpClient.put<NotificationResponseDto>(`/api/v1/notifications/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/notifications/${id}`).then(r => r.data),
};
