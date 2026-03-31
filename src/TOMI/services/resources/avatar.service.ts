import { httpClient } from '../httpClient';
import { createAPICache } from '../../utils/apiCache';
import type { AvatarResponseDto, AvatarCreateDto, AvatarUpdateDto } from '../../models/dto/Avatar.dto';

type Id = string | number;

const allTemplatesCache = createAPICache<AvatarResponseDto[]>(600_000); // 10 min — templates almost never change
const byIdCache = createAPICache<AvatarResponseDto>(600_000);

export const avatarService = {
  getAll: async (params?: Record<string, any>): Promise<AvatarResponseDto[]> => {
    const key = JSON.stringify(params ?? {});
    const fresh = allTemplatesCache.getFresh(key);
    if (fresh) return fresh;

    const stale = allTemplatesCache.get(key);
    const promise = httpClient
      .get<AvatarResponseDto[]>('/api/v1/avatars', { params })
      .then((r) => { allTemplatesCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  getById: async (id: Id): Promise<AvatarResponseDto> => {
    const key = `${id}`;
    const fresh = byIdCache.getFresh(key);
    if (fresh) return fresh;

    const stale = byIdCache.get(key);
    const promise = httpClient
      .get<AvatarResponseDto>(`/api/v1/avatars/${id}`)
      .then((r) => { byIdCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  create: (data: AvatarCreateDto) =>
    httpClient.post<AvatarResponseDto>('/api/v1/avatars', data).then((r) => {
      allTemplatesCache.clear();
      return r.data;
    }),

  update: (id: Id, data: AvatarUpdateDto) =>
    httpClient.put<AvatarResponseDto>(`/api/v1/avatars/${id}`, data).then((r) => {
      allTemplatesCache.clear();
      byIdCache.invalidate(`${id}`);
      return r.data;
    }),

  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/avatars/${id}`).then((r) => {
      allTemplatesCache.clear();
      byIdCache.invalidate(`${id}`);
      return r.data;
    }),
};
