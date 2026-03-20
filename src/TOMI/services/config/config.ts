import Constants from 'expo-constants';

const getEnv = (key: string): string | undefined =>
  Constants.expoConfig?.extra?.[key] ?? undefined;

export const API_BASE_URL = getEnv('TOMI_API_BASE_URL') || 'http://localhost:8000';

/** API request timeout (ms). Increase if the backend is slow to wake or on poor networks. */
export const HTTP_TIMEOUT = 30000;

export const SUPABASE_URL =
  getEnv('SUPABASE_URL') || 'https://rvtrwomwwrrwqelpgxmr.supabase.co';
export const SUPABASE_KEY =
  getEnv('SUPABASE_KEY') || '';

