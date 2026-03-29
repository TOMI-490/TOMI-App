import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isDevice } from 'expo-device';

const getEnv = (key: string): string | undefined =>
  Constants.expoConfig?.extra?.[key] ?? undefined;

function supabaseHostname(): string | undefined {
  const raw = getEnv('SUPABASE_URL');
  if (!raw) return undefined;
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

/**
 * .env examples mistakenly set TOMI_API_BASE_URL to the Supabase project URL.
 * That is not the FastAPI server — requests never reach your backend.
 */
function isMisconfiguredApiUrl(candidate: string): boolean {
  try {
    const host = new URL(candidate).hostname.toLowerCase();
    if (host.includes('supabase.co')) return true;
    const supHost = supabaseHostname();
    if (supHost && host === supHost) return true;
  } catch {
    return false;
  }
  return false;
}

/**
 * In dev, Metro already knows the machine IP (hostUri). Reuse it for the API so
 * physical devices do not call "localhost" (which is the phone itself).
 */
function getDevMachineHost(): string | undefined {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  const manifest: { debuggerHost?: string } | null =
    (Constants as { manifest?: { debuggerHost?: string } | null }).manifest ?? null;
  const debuggerHost =
    manifest?.debuggerHost ??
    (Constants.expoGoConfig as { debuggerHost?: string } | null)?.debuggerHost;
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  if (Platform.OS === 'android' && !isDevice) {
    return '10.0.2.2';
  }

  return undefined;
}

function resolveApiBaseUrl(): string {
  const isIosSimulator = Platform.OS === 'ios' && !isDevice;

  let fromEnv = getEnv('TOMI_API_BASE_URL');
  const fallback = 'http://localhost:8000';

  if (
    __DEV__ &&
    Platform.OS !== 'web' &&
    fromEnv?.trim() &&
    isMisconfiguredApiUrl(fromEnv.trim())
  ) {
    console.warn(
      '[config] TOMI_API_BASE_URL is set to Supabase (or matches SUPABASE_URL). ' +
        'It must be your FastAPI base URL, e.g. http://localhost:8000. Using local dev URL.'
    );
    fromEnv = undefined;
  }

  /**
   * Simulator runs on the Mac: FastAPI must be reached via loopback.
   * A physical-device .env (e.g. http://169.254.x.x:8000 USB IP) does not work here.
   */
  if (__DEV__ && isIosSimulator) {
    let port = '8000';
    const candidate = (fromEnv?.trim() || fallback).replace(/\/$/, '');
    try {
      const u = new URL(candidate);
      if (u.port) port = u.port;
    } catch {
      /* use default port */
    }
    const url = `http://127.0.0.1:${port}`;
    console.log('[config] iOS Simulator — API_BASE_URL (loopback) →', url);
    return url;
  }

  const raw = (fromEnv?.trim() || fallback).replace(/\/$/, '');

  if (!__DEV__ || Platform.OS === 'web') {
    return raw;
  }

  try {
    const url = new URL(raw);
    const isLoopback =
      url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (!isLoopback) {
      return raw;
    }

    const devHost = getDevMachineHost();
    if (!devHost) {
      return raw;
    }

    url.hostname = devHost;
    return url.toString().replace(/\/$/, '');
  } catch {
    return raw;
  }
}

export const API_BASE_URL = resolveApiBaseUrl();

/** API request timeout (ms). Increase if the backend is slow to wake or on poor networks. */
export const HTTP_TIMEOUT = 30000;

/** History/calendar aggregations can be slower than typical CRUD — avoids spurious timeouts. */
export const HTTP_TIMEOUT_HISTORY = 90000;

export const SUPABASE_URL =
  getEnv('SUPABASE_URL') || 'https://rvtrwomwwrrwqelpgxmr.supabase.co';
export const SUPABASE_KEY =
  getEnv('SUPABASE_KEY') || '';

if (__DEV__ && Platform.OS !== 'web' && !(Platform.OS === 'ios' && !isDevice)) {
  console.log('[config] API_BASE_URL →', API_BASE_URL);
}
