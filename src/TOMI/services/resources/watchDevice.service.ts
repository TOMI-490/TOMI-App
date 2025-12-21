import { httpClient } from '../httpClient';
import type { WatchDeviceResponseDto, WatchDeviceCreateDto, WatchDeviceUpdateDto } from '../../models/dto/WatchDevice.dto';

type Id = string | number;

export const watchDeviceService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<WatchDeviceResponseDto[]>('/api/v1/watchDevices', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<WatchDeviceResponseDto>(`/api/v1/watchDevices/${id}`).then(r => r.data),
  
  create: (data: WatchDeviceCreateDto) =>
    httpClient.post<WatchDeviceResponseDto>('/api/v1/watchDevices', data).then(r => r.data),
  
  update: (id: Id, data: WatchDeviceUpdateDto) =>
    httpClient.put<WatchDeviceResponseDto>(`/api/v1/watchDevices/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/watchDevices/${id}`).then(r => r.data),
};
