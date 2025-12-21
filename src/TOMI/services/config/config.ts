import Constants from 'expo-constants';

const getEnv = (key:string) => Constants.expoConfig?.extra?.[key];

export const API_BASE_URL = getEnv('TOMI_API_BASE_URL') || 'http://localhost:8000';

export const HTTP_TIMEOUT = 15000; // 15 seconds

export const SUPABASE_URL = getEnv('SUPABASE_URL');
export const SUPABASE_KEY = getEnv('SUPABASE_KEY');
