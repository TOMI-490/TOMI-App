import { httpClient } from '../httpClient';
import { createAPICache } from '../../utils/apiCache';
import type {
  EvolutionStateDto,
  EvolveResponseDto,
} from '../../models/dto/Evolution.dto';

const stateCache = createAPICache<EvolutionStateDto>(120_000); // 2 min

const OK_OR_NOT_FOUND = (status: number) => status === 200 || status === 404;

export const evolutionService = {
  /** Returns null when the user has no active avatar (API 404). */
  getEvolutionState: async (
    userId: number,
    forceRefresh = false,
  ): Promise<EvolutionStateDto | null> => {
    const key = `evo:${userId}`;

    if (!forceRefresh) {
      const fresh = stateCache.getFresh(key);
      if (fresh) return fresh;

      const stale = stateCache.get(key);
      if (stale) {
        httpClient
          .get<EvolutionStateDto>('/api/v1/evolution/state', {
            params: { user_id: userId },
            validateStatus: OK_OR_NOT_FOUND,
          })
          .then((r) => {
            if (r.status === 404) stateCache.invalidate(key);
            else stateCache.set(key, r.data);
          })
          .catch(() => {});
        return stale;
      }
    }

    const r = await httpClient.get<EvolutionStateDto>(
      '/api/v1/evolution/state',
      { params: { user_id: userId }, validateStatus: OK_OR_NOT_FOUND },
    );
    if (r.status === 404) {
      stateCache.invalidate(key);
      return null;
    }
    stateCache.set(key, r.data);
    return r.data;
  },

  evolve: async (
    userId: number,
    targetNodeId: number,
  ): Promise<EvolveResponseDto> => {
    const response = await httpClient.post<EvolveResponseDto>(
      '/api/v1/evolution/evolve',
      { userId, targetNodeId },
    );
    // Fully clear so the next fetch hits the network, not stale data
    stateCache.clear();
    return response.data;
  },

  invalidateCache: (userId?: number) => {
    if (userId) stateCache.invalidate(`evo:${userId}`);
    else stateCache.clear();
  },
};
