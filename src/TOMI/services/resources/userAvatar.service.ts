import { httpClient } from '../httpClient';
import { createAPICache } from '../../utils/apiCache';
import type { UserAvatarResponseDto, UserAvatarCreateDto, UserAvatarUpdateDto } from '../../models/dto/UserAvatar.dto';
import { normalizeUserAvatarDto } from '../../utils/normalizeUserAvatarDto';

type Id = string | number;

const avatarByUserCache = createAPICache<UserAvatarResponseDto>(120_000); // 2 min

const norm = (d: UserAvatarResponseDto) => normalizeUserAvatarDto(d);

/** Axios treats 404 as success so optional resources don't spam the HTTP error logger. */
const OK_OR_NOT_FOUND = (status: number) => status === 200 || status === 404;

export const userAvatarService = {
  getAll: (params?: Record<string, any>) =>
    httpClient
      .get<UserAvatarResponseDto[]>('/api/v1/userAvatars', { params })
      .then((r) => r.data.map(norm)),

  getById: (id: Id) =>
    httpClient.get<UserAvatarResponseDto>(`/api/v1/userAvatars/${id}`).then((r) => norm(r.data)),

  /** Returns null when the user has no avatar row yet (API 404). */
  getByUserId: async (userId: Id): Promise<UserAvatarResponseDto | null> => {
    const key = `user:${userId}`;
    const fresh = avatarByUserCache.getFresh(key);
    if (fresh) return fresh;

    const stale = avatarByUserCache.get(key);
    const fetchPromise = httpClient
      .get<UserAvatarResponseDto>(`/api/v1/userAvatars/user/${userId}`, {
        validateStatus: OK_OR_NOT_FOUND,
      })
      .then((r) => {
        if (r.status === 404) {
          avatarByUserCache.invalidate(key);
          return null;
        }
        const data = norm(r.data);
        avatarByUserCache.set(key, data);
        return data;
      });

    if (stale) {
      fetchPromise.catch(() => {});
      return stale;
    }
    return fetchPromise;
  },

  create: (data: UserAvatarCreateDto) =>
    httpClient.post<UserAvatarResponseDto>('/api/v1/userAvatars', data).then((r) => norm(r.data)),

  update: (id: Id, data: UserAvatarUpdateDto) =>
    httpClient.put<UserAvatarResponseDto>(`/api/v1/userAvatars/${id}`, data).then((r) => {
      avatarByUserCache.clear();
      return norm(r.data);
    }),

  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/userAvatars/${id}`).then((r) => {
      avatarByUserCache.clear();
      return r.data;
    }),

  feed: (userId: Id) =>
    httpClient.post<UserAvatarResponseDto>(`/api/v1/userAvatars/user/${userId}/feed`).then((r) => {
      avatarByUserCache.invalidate(`user:${userId}`);
      return norm(r.data);
    }),

  rest: (userId: Id) =>
    httpClient.post<UserAvatarResponseDto>(`/api/v1/userAvatars/user/${userId}/rest`).then((r) => {
      avatarByUserCache.invalidate(`user:${userId}`);
      return norm(r.data);
    }),

  invalidateCache: (userId?: Id) => {
    if (userId) avatarByUserCache.invalidate(`user:${userId}`);
    else avatarByUserCache.clear();
  },
};
