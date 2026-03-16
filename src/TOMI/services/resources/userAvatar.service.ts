import { httpClient } from '../httpClient';
import { createAPICache } from '../../utils/apiCache';
import type { UserAvatarResponseDto, UserAvatarCreateDto, UserAvatarUpdateDto } from '../../models/dto/UserAvatar.dto';

type Id = string | number;

const avatarByUserCache = createAPICache<UserAvatarResponseDto>(120_000); // 2 min

export const userAvatarService = {
  getAll: (params?: Record<string, any>) =>
    httpClient.get<UserAvatarResponseDto[]>('/api/v1/userAvatars', { params }).then(r => r.data),

  getById: (id: Id) =>
    httpClient.get<UserAvatarResponseDto>(`/api/v1/userAvatars/${id}`).then(r => r.data),

  getByUserId: async (userId: Id): Promise<UserAvatarResponseDto> => {
    const key = `user:${userId}`;
    const fresh = avatarByUserCache.getFresh(key);
    if (fresh) return fresh;

    const stale = avatarByUserCache.get(key);
    const fetchPromise = httpClient
      .get<UserAvatarResponseDto>(`/api/v1/userAvatars/user/${userId}`)
      .then((r) => {
        avatarByUserCache.set(key, r.data);
        return r.data;
      });

    if (stale) {
      fetchPromise.catch(() => {});
      return stale;
    }
    return fetchPromise;
  },

  create: (data: UserAvatarCreateDto) =>
    httpClient.post<UserAvatarResponseDto>('/api/v1/userAvatars', data).then(r => r.data),

  update: (id: Id, data: UserAvatarUpdateDto) =>
    httpClient.put<UserAvatarResponseDto>(`/api/v1/userAvatars/${id}`, data).then((r) => {
      avatarByUserCache.clear();
      return r.data;
    }),

  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/userAvatars/${id}`).then((r) => {
      avatarByUserCache.clear();
      return r.data;
    }),

  feed: (userId: Id) =>
    httpClient.post<UserAvatarResponseDto>(`/api/v1/userAvatars/user/${userId}/feed`).then((r) => {
      avatarByUserCache.invalidate(`user:${userId}`);
      return r.data;
    }),

  rest: (userId: Id) =>
    httpClient.post<UserAvatarResponseDto>(`/api/v1/userAvatars/user/${userId}/rest`).then((r) => {
      avatarByUserCache.invalidate(`user:${userId}`);
      return r.data;
    }),

  invalidateCache: (userId?: Id) => {
    if (userId) avatarByUserCache.invalidate(`user:${userId}`);
    else avatarByUserCache.clear();
  },
};
