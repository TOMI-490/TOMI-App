import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config/config';

function initSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(
      '[Supabase] Missing SUPABASE_URL or SUPABASE_KEY — check .env and app.config.js. ' +
      'Using placeholder client; auth and DB calls will fail gracefully.',
    );
  }

  return createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_KEY || 'placeholder', {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = initSupabase();



