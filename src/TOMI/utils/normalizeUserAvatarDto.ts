import type { UserAvatarResponseDto } from '../models/dto/UserAvatar.dto';

/**
 * Coerce API mood fields to 0–100 integers.
 * Handles snake_case keys, boredom vs boredome, direct fullness, and 0–1 fractional values.
 */
function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  let x = n;
  if (x > 0 && x <= 1 && !Number.isInteger(x)) {
    x = Math.round(x * 100);
  }
  return Math.max(0, Math.min(100, Math.round(x)));
}

function readOpt(r: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    if (!(k in r) || r[k] === null || r[k] === undefined) continue;
    const n = Number(r[k]);
    if (!Number.isFinite(n)) continue;
    return clampPercent(n);
  }
  return undefined;
}

/** Normalize mood + core ids so UI always matches DB regardless of JSON key casing. */
export function normalizeUserAvatarDto(data: UserAvatarResponseDto): UserAvatarResponseDto {
  const r = data as unknown as Record<string, unknown>;

  const fullness = readOpt(r, ['fullnessLevel', 'fullness_level', 'fullnessPercent', 'fullness']);
  const hungerDirect = readOpt(r, ['hungerLevel', 'hunger_level', 'hunger']);
  const hungerLevel =
    hungerDirect !== undefined
      ? hungerDirect
      : fullness !== undefined
        ? Math.max(0, 100 - fullness)
        : clampPercent(data.hungerLevel ?? 0);

  const energyLevel = readOpt(r, ['energyLevel', 'energy_level', 'energy']);
  const sleepinessFromApi = readOpt(r, ['sleepinessLevel', 'sleepiness_level', 'sleepiness', 'sleep']);
  const sleepinessLevel =
    sleepinessFromApi !== undefined
      ? sleepinessFromApi
      : energyLevel !== undefined
        ? Math.max(0, 100 - energyLevel)
        : clampPercent(data.sleepinessLevel ?? 0);

  const funLevel = readOpt(r, ['funLevel', 'fun_level', 'fun']);
  const boredomFromApi = readOpt(r, [
    'boredomeLevel',
    'boredome_level',
    'boredomLevel',
    'boredom_level',
    'boredom',
  ]);
  const boredomeLevel =
    boredomFromApi !== undefined
      ? boredomFromApi
      : funLevel !== undefined
        ? Math.max(0, 100 - funLevel)
        : clampPercent(data.boredomeLevel ?? 0);

  const happinessLevel =
    readOpt(r, ['happinessLevel', 'happiness_level', 'happiness']) ??
    clampPercent(data.happinessLevel ?? 0);

  const userAvatarId = Number(
    r.userAvatarId ?? r.user_avatar_id ?? data.userAvatarId ?? 0,
  );
  const userId = Number(r.userId ?? r.user_id ?? data.userId ?? 0);
  const avatarId = Number(r.avatarId ?? r.avatar_id ?? data.avatarId ?? 0);

  return {
    ...data,
    userAvatarId,
    userId,
    avatarId,
    hungerLevel,
    sleepinessLevel,
    boredomeLevel,
    happinessLevel,
  };
}
