import { httpClient } from '../httpClient';
import type { LeaderboardResponseDto, LeaderboardCreateDto, LeaderboardUpdateDto } from '../../models/dto/Leaderboard.dto';

type Id = string | number;

export const leaderboardService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<LeaderboardResponseDto[]>('/api/v1/leaderboards', { params }).then(r => r.data),
  
  getById: (id: Id) =>
    httpClient.get<LeaderboardResponseDto>(`/api/v1/leaderboards/${id}`).then(r => r.data),
  
  create: (data: LeaderboardCreateDto) =>
    httpClient.post<LeaderboardResponseDto>('/api/v1/leaderboards', data).then(r => r.data),
  
  update: (id: Id, data: LeaderboardUpdateDto) =>
    httpClient.put<LeaderboardResponseDto>(`/api/v1/leaderboards/${id}`, data).then(r => r.data),
  
  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/leaderboards/${id}`).then(r => r.data),
};
