import { httpClient } from '../httpClient';
import { createAPICache } from '../../utils/apiCache';
import type { WorkoutTypeResponseDto, WorkoutTypeCreateDto, WorkoutTypeUpdateDto } from '../../models/dto/WorkoutType.dto';

type Id = string | number;

const allTypesCache = createAPICache<WorkoutTypeResponseDto[]>(300_000); // 5 min — types rarely change
const byIdCache     = createAPICache<WorkoutTypeResponseDto>(300_000);

export const workoutTypeService = {
  getAll: async (params?: Record<string, any>): Promise<WorkoutTypeResponseDto[]> => {
    const key = JSON.stringify(params ?? {});
    const fresh = allTypesCache.getFresh(key);
    if (fresh) return fresh;

    const stale = allTypesCache.get(key);
    const promise = httpClient
      .get<WorkoutTypeResponseDto[]>('/api/v1/workoutTypes', { params })
      .then((r) => { allTypesCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  getById: async (id: Id): Promise<WorkoutTypeResponseDto> => {
    const key = `${id}`;
    const fresh = byIdCache.getFresh(key);
    if (fresh) return fresh;

    const stale = byIdCache.get(key);
    const promise = httpClient
      .get<WorkoutTypeResponseDto>(`/api/v1/workoutTypes/${id}`)
      .then((r) => { byIdCache.set(key, r.data); return r.data; });

    if (stale) { promise.catch(() => {}); return stale; }
    return promise;
  },

  create: (data: WorkoutTypeCreateDto) =>
    httpClient.post<WorkoutTypeResponseDto>('/api/v1/workoutTypes', data).then((r) => {
      allTypesCache.clear();
      return r.data;
    }),

  update: (id: Id, data: WorkoutTypeUpdateDto) =>
    httpClient.put<WorkoutTypeResponseDto>(`/api/v1/workoutTypes/${id}`, data).then((r) => {
      allTypesCache.clear();
      byIdCache.invalidate(`${id}`);
      return r.data;
    }),

  delete: (id: Id) =>
    httpClient.delete<void>(`/api/v1/workoutTypes/${id}`).then((r) => {
      allTypesCache.clear();
      byIdCache.invalidate(`${id}`);
      return r.data;
    }),
};
